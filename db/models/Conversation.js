'use strict';

const console = require('keypunch');
const mongo = require('../mongo');
const Node = require(`${global.nodes}/Node`);

const schema = new mongo.Schema({
  /**
   * The Jarvis user attached to this conversation
   */
  user: {
    type: mongo.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  /**
   * The entry point for this conversation.
   */
  entry: {
    type: mongo.Schema.Types.ObjectId,
    ref: 'Entry',
    required: true,
  },

  /**
   * The current point in the flow for this conversation
   */
  pointer: {
    type: mongo.Schema.Types.ObjectId,
    ref: 'Node',
    default: null,
  },

  /**
   * Storage space for nodes in order
   * to save variables specific
   * to this conversation.
   */
  session: {
    type: mongo.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
});

schema.index({ user: 1, updatedAt: -1 });

schema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'conversationId',
});

/**
 * Fields required for most applications.
 */
schema.statics.populationFields = [
  {
    path: 'entry',
    populate: {
      path: 'start',
    },
  },
  {
    path: 'user',
  },
  {
    path: 'pointer',
  },
];

/**
 * Get the active conversation for the given user id.
 * @param  {String} userId
 * @return {Promise}
 */
schema.statics.getUsersActiveConversation = function (userId) {
  return this.findOne({ user: userId })
  .sort({ updatedAt: -1 })
  .populate(this.populationFields)
  .exec()
  .catch(err => console.error(err));
};

/**
 * Create a new conversation for the given user & entry.
 * @param  {User} user
 * @param  {Entry} entry
 * @return {Promise}
 */
schema.statics.createFromEntry = function (user, entry) {
  const conversation = new this({
    user,
    entry,
  });

  return conversation.save()
  .then(convo => this.populate(convo, this.populationFields))
  .catch(err => console.error(err));
};

/**
 * Load the pointer for this conversation
 * @return {Promise}
 */
schema.methods.loadPointer = function () {
  return Node.findOne({ _id: this.pointer })
  .exec()
  .catch(err => console.error(err));
};

/**
 * Update the conversation pointer based on the supplied message.
 *
 * @param  {Message} message
 * @return {Promise}
 */
schema.methods.updatePointer = function (message) {
  const scope = {};

  return this.loadPointer()
  .then((pointer) => {
    if (pointer) return pointer;

    this.pointer = this.entry.start;
    return this.loadPointer();
  })
  .then((pointer) => {
    scope.continuous = pointer.continuous;
    return pointer;
  })
  .then(pointer => pointer.run(message, this))
  .then((response) => {
    scope.response = response;
    return this.save().catch(err => console.error(err));
  })
  .then(() => this.loadPointer())
  .then((pointer) => {
    if (scope.continuous) {
      return this.updatePointer(message);
    }

    return scope.response;
  })
  .catch(err => console.error(err));
};

const Conversation = mongo.mongoose.model('Conversation', schema);

module.exports = Conversation;

// Schema Dependencies
require('./User');
require(`${global.entries}`);
require(`${global.nodes}`);
