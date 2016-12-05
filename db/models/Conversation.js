'use strict';

const mongo = require('../mongo');

const schema = new mongo.Schema({
  /**
   * The Gambit user attached to this conversation
   */
  user: {
    type: mongo.mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  /**
   * The entry point for this conversation.
   */
  entry: {
    type: mongo.mongoose.Schema.Types.ObjectId,
    ref: 'Entry',
    required: true,
  },

  /**
   * The current point in the flow for this conversation
   */
  pointer: {
    type: mongo.mongoose.Schema.Types.ObjectId,
    ref: 'Node',
    default: null,
  },

  /**
   * Misc. object for storing data to enable analysis & visualization later.
   * WARN: Do not use this in any production queries.
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
    path: 'user'
  },
  {
    path: 'pointer'
  }
];

/**
 * Get the active conversation for the given user id.
 * @param  {String} userId
 * @return {Promise}
 */
schema.statics.getUsersActiveConversation = function (userId) {
  return this.findOne({user: userId})
  .sort({updatedAt: -1})
  .populate(populatedFields)
  .exec();
};

/**
 * Update the conversation pointer based on the supplied message.
 *
 * @param  {Message} message
 * @return {Promise}
 */
schema.methods.updatePointer = function (message) {
  const update = new Promise((resolve) => {
    if (!this.pointer) {
      this.pointer = this.entry.flow.start;
      resolve();
    }
    else {
      this.pointer.run(message, this).then(resolve);
    }
  });

  return update.then(this.save);
}

const Conversation = mongo.mongoose.model('Conversation', schema);

module.exports = Conversation;
