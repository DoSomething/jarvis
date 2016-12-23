'use strict';

const console = require('keypunch');
const mongo = require('../mongo');
const Node = require('./Node');
const Response = require(`${global.models}/Response`).model;
const stathat = require(`${global.root}/lib/stathat`);
const helpers = require(`${global.root}/util/helpers`);
const admin = require(`${global.root}/config/admin`);

const schema = new mongo.Schema({}, {
  discriminatorKey: 'node',
  toObject: {
    virtuals: true,
  },
});

schema.virtual('continuous').get(() => false);

/**
 * Get a message containing each node type.
 * @return {Response}
 */
function getTypes() {
  let text = 'Please reply with one of the following types...\n';
  helpers.getCreatableNodeTypes().forEach((type) => {
    text += `- ${type}\n`;
  });

  return new Response({ text });
}

/**
 * Gets a field the admin must fill out.
 * Determines the field based on the index & type.
 * @param {int} index
 * @param {string} type
 * @return {Response}
 */
function getField(index, type) {
  const field = admin[type].fill[index];
  const text = `[*${field.title}*] ${field.description}. (${index}/${admin[type].fill.length})`;

  return new Response({ text });
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
  stathat.count('node executed~total,admin create', 1);

  if (typeof conversation.session.adminCreate === 'undefined') {
    conversation.session.adminCreate = {};
  }

  const session = conversation.session.adminCreate;
  const msg = message.response.text;

  let type = session.type;
  let fields = session.fields;
  let fieldIndex = session.fieldIndex;

  const route = new Promise((resolve) => {
    if (!type) {
      if (helpers.isValidCreatableNodeType(msg)) {
        type = msg;
        fieldIndex = 0;
        fields = {};

        resolve(getField(fieldIndex, type));
      } else {
        resolve(getTypes());
      }

      return;
    }

    if (Object.keys(fields.length) !== admin[type].fill.length) {
      const field = admin[type][fieldIndex];
      const key = field.name;
      const value = field.onSubmit(msg);

      if (field.parent) {
        fields[field.parent][key] = value;
      } else {
        fields[key] = value;
      }

      fieldIndex++;

      resolve(getField(fieldIndex, type));
      return;
    }

    const model = new admin[type].Instance(fields);

    model.save()
    .then(() => resolve(new Response({ text: 'Done!' })))
    .catch(err => console.error(err));
  });

  route.catch(err => console.error(err));

  return route;
};

const AdminCreateNode = Node.discriminator('node-admin-create', schema);

module.exports = AdminCreateNode;
