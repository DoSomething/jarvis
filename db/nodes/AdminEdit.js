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

/**
 * Get all of the fields for the given type
 * @param  {String} type
 * @return {String}
 */
function getAllFields(type) {
  const text = `Select a field...\n${
    nodes[type].fill
    .map((field, index) => `${index + 1}) *${field.name}* - ${field.description}\n`)
    .join(',')}`;

  return text;
}

/**
 * Create a new node by accepting admin input and
 * update the conversation pointer to the next node.
 *
 * @param  {Message} message User message to parse.
 * @param  {Conversation} conversation conversation to modify.
 * @return {Promise}
 */
schema.methods.run = function (message, conversation) {
  stathat.count('node executed~total,admin edit', 1);

  const msg = message.response.text;

  if (typeof conversation.session.adminEdit === 'undefined') {
    conversation.session.adminEdit = {
      type: null,
      node: null,
      fieldIndex: null,
      menu: null,
      step: 0,
    };
  }

  const session = conversation.session.adminEdit;

  let selection = null;
  let text = '';
  let field = null;
  let value = null;

  const route = new Promise((resolve) => {
    switch (session.step) {
      case 0:
        session.step++;
        resolve(new Response({ text: 'What is the title of the node?' }));
        break;
      case 1:
        helpers.getTitleMenu(msg)
        .then((result) => {
          if (result.menu) {
            session.menu = result.menu;
            session.step++;
          }

          return result;
        })
        .then(result => resolve(result.response));
        break;
      case 2:
        selection = session.menu[parseInt(msg, 10) - 1];
        text = 'Invalid selection. Just reply with the number.';

        if (selection) {
          session.step++;
          session.node = selection;
          session.type = selection.node.replace('node-', '');

          text = getAllFields(session.type);
        }

        resolve(new Response({ text }));
        break;
      case 3:
        session.fieldIndex = parseInt(msg, 10) - 1;
        selection = nodes[session.type].fill[session.fieldIndex];
        text = 'Invalid selection. Just reply with the number.';

        if (selection) {
          session.step++;
          text = 'Enter the new value';
        }

        resolve(new Response({ text }));
        break;
      case 4:
        field = nodes[session.type].fill[session.fieldIndex];
        value = field.onSubmit(msg);

        Node.findOne({ _id: session.node._id }).exec()
        .then((node) => {
          node[field.name] = value;
          return node.save();
        })
        .then(() => resolve(new Response({ text: 'Done!' })))
        .catch(err => resolve(new Response({ text: err.message })));
        break;
      default: break;
    }
  });

  route.catch(err => console.error(err));

  return route;
};

const AdminEditNode = Node.discriminator('node-admin-edit', schema);

module.exports = AdminEditNode;
