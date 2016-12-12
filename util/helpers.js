'use strict';

const Keyword = require('../db/models/EntryKeyword');
const Conversation = require('../db/models/Conversation');
const Message = require('../db/models/Message');

module.exports = {
  /**
   * Route the given message to the proper conversation
   * and get the message which should be replied back
   * to the user.
   *
   * It works in the following steps.
   * 1. Check if the incoming message is a keyword. If Yes, Start a new conversation.
   *    Otherwise, find the users most recent conversation.
   * 2. Attach the new message to that conversation
   * 3. Update the conversation pointer based on that message.
   * 4. Populate the new pointer.
   * 5. Build a Jarvis message based on the pointer, attach this
   *    message to the conversation.
   * 6. Return that message.
   *
   * @param  {Object} scope Should contain a Message & User.
   * @return {Promise}
   */
  routeRequest: (scope) => {
    return Keyword.findByKeyword(scope.message.response.text)
    .then((keyword) => {
      return keyword ?
        Conversation.createFromEntry(scope.user, keyword) :
        Conversation.getUsersActiveConversation(scope.user.id);
    })
    .then((conversation) => {
      return scope.message.attachConversation(conversation)
      .then(message => conversation.updatePointer(message))
    })
    .then(conversation => Conversation.populate(conversation, 'pointer'))
    .then(conversation => this.getNodeMessage(scope.platform, conversation));
  },

  /**
   * Get the Message to return for the given platform
   * and conversation.
   * @param  {String} platform
   * @param  {conversation} conversation
   * @return {Promise}
   */
  getNodeMessage: (platform, conversation) => {
    const originalMessage = this.message;
    const message = new Message({
      platform,
      response: originalMessage.response,
      client: originalMessage.client,
      conversationId: conversation._id,
    });

    return message.save();
  }
}