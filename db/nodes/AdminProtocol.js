'use strict';

const console = require('keypunch');
const mongo = require('../mongo');
const Node = require('./Node');
const Response = require(`${global.models}/Response`).model;
const stathat = require(`${global.root}/lib/stathat`);

const mapping = {
  user: {
    requires: ['user', 'staff', 'admin'],
  },
  admin: {
    requires: ['staff', 'admin'],
  },
};

const schema = new mongo.Schema({}, {
  discriminatorKey: 'node',
  toObject: {
    virtuals: true,
  },
});

schema.virtual('continuous').get(() => false);

/**
 * Update the conversation pointer to the next node.
 *
 * @param  {Message} message User message to parse.
 * @param  {Conversation} conversation conversation to modify.
 * @return {Promise}
 */
schema.methods.run = function (message, conversation) {
  stathat.count('node executed~total,admin protocol', 1);

  const msg = message.response.text;
  const scope = {};

  const invalidName = new Response({ text: `Select a role: ${Object.keys(mapping).join(', ')}` });
  const invalidAccess = new Response({ text: 'You\'re not allowed to do that!' });
  const success = new Response({ text: 'Switched role.' });

  const switchProtocol = new Promise((resolve) => {
    const protocol = mapping[msg];

    if (!protocol) {
      return resolve(invalidName);
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
        return resolve(invalidAccess);
      }

      conversation.pointer = this.success;
      conversation.user.protocol = msg;

      return conversation.user.save()
      .then(() => resolve(success))
      .catch(err => console.error(err));
    });
  });

  switchProtocol.catch(err => console.error(err));

  return switchProtocol;
};

const AdminProtocol = Node.discriminator('node-admin-protocol', schema);

module.exports = AdminProtocol;

// Schema Dependencies
require(`${global.models}/User`);
