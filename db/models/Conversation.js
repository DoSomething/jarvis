'use strict';

const mongo = require('../mongo');
const Node = require('./Node');

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
   * Misc. object for storing data to enable analysis & visualization later.
   * WARN: Do not use this in any production queries.
   * TODO: Remove in favor of events?
   */
  analytics: mongo.Schema.Types.Mixed,
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
      path: 'flow',
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
  .exec();
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
  .then(convo => this.populate(convo, this.populationFields));
};

/**
 * Load the pointer for this conversation
 * @return {Promise}
 */
schema.methods.loadPointer = function () {
  return Node.findOne({ _id: this.pointer }).exec();
};

/**
 * Update the conversation pointer based on the supplied message.
 *
 * @param  {Message} message
 * @return {Promise}
 */
schema.methods.updatePointer = function (message) {
  return this.loadPointer()
  .then((pointer) => {
    if (!pointer) {
      this.pointer = this.entry.flow.start;
      return true;
    }

    return pointer.run(message, this);
  })
  .then(() => this.save())
  .then(() => this.loadPointer())
  .then((pointer) => {
    if (pointer.hop) return this.updatePointer(message).then(this.save);

    return this;
  });
};

const Conversation = mongo.mongoose.model('Conversation', schema);

module.exports = Conversation;

// Schema Dependencies
require('./User');
require('./Entry');
