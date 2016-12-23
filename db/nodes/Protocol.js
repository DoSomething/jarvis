'use strict';

const console = require('keypunch');
const mongo = require('../mongo');
const Node = require('./Node');
const protocols = require(`${global.root}/config/protocols`);
const stathat = require(`${global.root}/lib/stathat`);

const mapping = {
  user: {
    requires: ['user', 'staff', 'admin'],
  },
  admin: {
    requires: ['staff', 'admin'],
  },
};

const schema = new mongo.Schema({
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
  toObject: {
    virtuals: true,
  },
});

schema.virtual('continuous').get(() => true);

/**
 * Update the conversation pointer to the next node.
 *
 * @param  {Message} message User message to parse.
 * @param  {Conversation} conversation conversation to modify.
 * @return {Promise}
 */
schema.methods.run = function (message, conversation) {
  stathat.count('node executed~total,protocol', 1);

  const msg = message.response.text;
  const scope = {};

  const switchProtocol = new Promise((resolve) => {
    const protocol = mapping[msg];

    if (!protocol) {
      conversation.pointer = this.failed;
      return resolve(conversation);
    }

    scope.protocol = protocol;

    return conversation.user.getNorthstarUser()
    .then((nsUser) => {
      const userRole = nsUser.data.role;

      if (scope.protocol.requires.indexOf(userRole) < 0) {
        return false;
      }

      return true;
    })
    .then((access) => {
      if (!access) {
        conversation.pointer = this.failed;
        return resolve();
      }

      conversation.pointer = this.success;
      conversation.user.protocol = msg;

      return conversation.user.save()
      .then(() => resolve())
      .catch(err => console.error(err));
    });
  });

  switchProtocol.catch(err => console.error(err));

  return switchProtocol;
};

const PrintNode = Node.discriminator('node-protocol', schema);

module.exports = PrintNode;

// Schema Dependencies
require(`${global.models}/User`);
