'use strict';

const Promise = require('bluebird'); // eslint-disable-line no-unused-vars
const mongo = require('../mongo');

const platforms = require('../../config/platforms');
const clients = require('../../config/clients');

const schema = new mongo.Schema({
  /**
   * Object containing information on
   * what was displayed in a message.
   */
  response: {

    text: {
      type: String,
      trim: true,
      default: '',
    },

    /**
     * Should contain strings of Media URI's.
     */
    media: [
      {
        type: String,
        lowercase: true,
        trim: true,
        default: [],
      },
    ],
  },

  /**
   * The platform this message is being delivered over.
   * See `config/platforms`
   */
  platform: {
    type: String,
    required: true,
    lowercase: true,
    enum: platforms,
  },

  /**
   * The client which created this message.
   */
  client: {

    /**
     * See `config/clients`
     */
    type: {
      type: String,
      required: true,
      lowercase: true,
      enum: clients,
    },

    /**
     * The unique identifier for this client.
     * If its a user client, use the user id.
     * If its an application, use the app name.
     */
    id: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
  },

  /**
   * The conversation this message is attached to.
   */
  conversationId: {
    type: String,
    index: true,
  },
}, {
  timestamps: {
    updatedAt: true,
    createdAt: false,
  },
});

/**
 * Set the message text to lowercase.
 * Useful for user messages when making string comparisons.
 */
schema.methods.lowercaseResponse = function () {
  this.response.text = this.response.text.toLowerCase();
  return this.save();
};

/**
 * Attach a conversation to this message
 * @param  {Conversation} conversation
 * @return {Promise}
 */
schema.methods.attachConversation = function (conversation) {
  this.conversationId = conversation._id.toString();
  return this.save();
};

/**
 * Find the last message for the given conversation.
 * @param  {Conversation} conversation
 * @return {Promise}
 */
schema.statics.findLastConversationMessage = function (conversation) {
  return this.findOne({ conversationId: conversation._id }).sort({ createdAt: -1 }).exec();
};

const Message = mongo.mongoose.model('Message', schema);

module.exports = Message;
