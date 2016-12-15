'use strict';

const mongo = require('../mongo');
const Node = require('./Node');
const protocols = require('../../config/protocols');

const schema = new mongo.Schema({
  /**
   * What protocol is this Node
   * changing too?
   */
  protocol: {
    type: String,
    default: 'user',
    enum: protocols,
    required: true,
    lowercase: true,
    trim: true,
  },

  /**
   * The roles that are allowed
   * to switch to this protocol.
   */
  requiredRole: {
    type: Array,
    default: ['user'],
    required: true,
  },

  /**
   * The node that runs if the protocol changes
   */
  success: {
    type: mongo.Schema.Types.ObjectId,
    ref: 'Node',
    required: true,
  },

  /**
   * The node that runs if the protocol
   * fails to change.
   */
  failed: {
    type: mongo.Schema.Types.ObjectId,
    ref: 'Node',
    required: true,
  },
}, {
  discriminatorKey: 'node',
});


/**
 * Update the conversation pointer to the next node.
 *
 * @param  {Message} message User message to parse.
 * @param  {Conversation} conversation conversation to modify.
 * @return {Promise}
 */
schema.methods.run = function (message, conversation) {
  return new Promise((resolve) => {
    if (message.response.text !== this.protocol) {
      conversation.pointer = this.failed;
      return resolve(conversation);
    }

    return conversation.user.getNorthstarUser()
    .then((nsUser) => {
      if (this.requiredRole.indexOf(nsUser.data.role) < 0) {
        return false;
      }

      return true;
    })
    .then((access) => {
      if (!access) {
        conversation.pointer = this.failed;
        return resolve(conversation);
      }

      conversation.pointer = this.success;
      conversation.user.protocol = this.protocol;
      return conversation.user.save().then(() => resolve(conversation));
    });
  });
};

const PrintNode = Node.discriminator('node-protocol', schema);

module.exports = PrintNode;
