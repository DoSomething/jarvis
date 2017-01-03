'use strict';

const console = require('keypunch');
const mongo = require('../mongo');
const Node = require('./Node');
const Response = require(`${global.models}/Response`).model;
const stathat = require(`${global.root}/lib/stathat`);
const helpers = require(`${global.root}/util/helpers`);
const nodes = require(`${global.root}/config/nodes`);

const schema = new mongo.Schema({}, {
  discriminatorKey: 'node',
  toObject: {
    virtuals: true,
  },
});

schema.virtual('continuous').get(() => false);

function getFieldLinkMenu(session, node) {
  for (const baseNodeKey in nodes) {
    if (!nodes.hasOwnProperty(baseNodeKey)) continue;

    const baseNode = nodes[baseNodeKey];
    const baseDiscriminatorKey = new baseNode.Instance().node;

    if (baseDiscriminatorKey === node.node) { // Compares discriminatorKey
      session.menu = baseNode.attach;
      let msg = 'Please select a field...\n';

      baseNode.attach.forEach((field, index) => {
        msg += `${index + 1}) ${field.name} - ${field.description}\n`;
      });

      return msg;
    }
  }

  return 'This node has no linkable properties!';
}

function getConfirmationMessage(session) {
  return `(Y/N) Link *${session.field.name}* on *${session.point['1'].title}* to *${session.point['2'].title}*`; // eslint-disable-line max-len
}

function getResponse(session, msg) {
  let selection = null;
  let text = '';

  const route = new Promise((resolve) => {
    switch (session.step) {
      case 0:
        session.step = 1;
        resolve(new Response({ text: 'What is the title of the first node?' }));
        break;
      case 1:
        helpers.getTitleMenu(msg)
        .then((result) => {
          if (result.menu) {
            session.step = 2;
            session.menu = result.menu;
          }

          resolve(result.response);
        });
        break;
      case 2:
        selection = session.menu[parseInt(msg, 10) - 1];
        text = 'Invalid selection. Just reply with the number';

        if (selection) {
          session.step = 3;
          session.point['1'] = selection;
          text = getFieldLinkMenu(session, selection);
        }

        resolve(new Response({ text }));
        break;
      case 3:
        selection = session.menu[parseInt(msg, 10) - 1];
        text = 'Invalid selection. Just reply with the number';

        if (selection) {
          session.step = 4;
          session.field = selection;
          text = 'What is the title of the second node?';
        }

        resolve(new Response({ text }));
        break;
      case 4:
        helpers.getTitleMenu(msg)
        .then((result) => {
          if (result.menu) {
            session.step = 5;
            session.menu = result.menu;
          }

          resolve(result.response);
        });
        break;
      case 5:
        selection = session.menu[parseInt(msg, 10) - 1];
        text = 'Invalid selection. Just reply with the number';

        if (selection) {
          session.step = 6;
          session.point['2'] = selection;
          text = getConfirmationMessage(session);
        }

        resolve(new Response({ text }));
        break;
      case 6:
        if (msg === 'y') {
          Node.findOne({ _id: session.point['1']._id }).exec()
          .then((node) => {
            node[session.field.name] = session.point['2']._id;
            return node.save().catch(err => console.error(err));
          })
          .then(() => resolve(new Response({ text: 'Done.' })))
          .catch(err => console.error(err));
        } else {
          resolve(new Response({ text: 'Cancelling.' }));
        }

        break;
      default: resolve(new Response({ text: 'Ummm...' }));
    }
  });

  route.catch(err => console.error(err));

  return route;
}

/**
 * Link a field to another model.
 *
 * @param  {Message} message User message to parse.
 * @param  {Conversation} conversation conversation to modify.
 * @return {Promise}
 */
schema.methods.run = function (message, conversation) {
  stathat.count('node executed~total,admin link', 1);

  const msg = message.response.text;

  if (typeof conversation.session.adminLink === 'undefined') {
    conversation.session.adminLink = {
      step: 0,
      menu: [],
      point: {
        1: null,
        2: null,
      },
      field: null,
    };
  }

  const session = conversation.session.adminLink;

  const route = new Promise((resolve) => {
    const response = getResponse(session, msg);
    resolve(response);
  });

  route.catch(err => console.error(err));

  return route;
};

const AdminLinkNode = Node.discriminator('node-admin-link', schema);

module.exports = AdminLinkNode;

require('./');
