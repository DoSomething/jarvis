'use strict';

const console = require('keypunch');
const mongo = require('../mongo');

const platforms = require(`${global.root}/config/platforms`);
const clients = require(`${global.root}/config/clients`);

const responseSchema = require('./Response').schema;

const schema = new mongo.Schema({
  /**
   * Object containing information on
   * what was displayed in a message.
   */
  response: responseSchema,

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
  timestamps: true,
});

/**
 * Set the message text to lowercase.
 * Useful for user messages when making string comparisons.
 */
schema.methods.lowercaseResponse = function () {
  this.response.text = this.response.text.toLowerCase();
  return this.save().catch(err => console.error(err));
};

/**
 * Attach a conversation to this message
 * @param  {Conversation} conversation
 * @return {Promise}
 */
schema.methods.attachConversation = function (conversation) {
  this.conversationId = conversation._id.toString();
  return this.save().catch(err => console.error(err));
};

/**
 * Find the last message for the given conversation.
 * @param  {Conversation} conversation
 * @return {Promise}
 */
schema.statics.findLastConversationMessage = function (conversation) {
  return this.findOne({ conversationId: conversation._id })
  .sort({ createdAt: -1 })
  .exec()
  .catch(err => console.error(err));
};

const Message = mongo.mongoose.model('Message', schema);

module.exports = Message;
