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
 * Gets a field the admin must fill out.
 * Determines the field based on the index & type.
 * @param {int} index
 * @param {string} type
 * @return {Response}
 */
function getField(index, type) {
  const field = nodes[type].fill[index];
  const text = `[*${field.name}*] ${field.description}. (${index + 1}/${nodes[type].fill.length})`;

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

  const msg = message.response.text;

  if (typeof conversation.session.adminCreate === 'undefined') {
    conversation.session.adminCreate = {
      type: null,
      fieldIndex: 0, // Easier than calculating total root + nested fields
      fields: {},
    };
  }

  const session = conversation.session.adminCreate;

  const route = new Promise((resolve) => {
    if (!session.type) {
      if (helpers.isValidCreatableNodeType(msg)) {
        session.type = msg;
        resolve(getField(session.fieldIndex, session.type));
      } else {
        resolve(helpers.getCreatableNodeTypesResponse());
      }

      return;
    }

    const form = nodes[session.type];

    if (session.fieldIndex <= form.fill.length - 1) {
      const field = form.fill[session.fieldIndex];
      const key = field.name;
      const value = field.onSubmit(msg);

      if (field.parent) {
        if (typeof session.fields[field.parent] === 'undefined') {
          session.fields[field.parent] = {};
        }

        session.fields[field.parent][key] = value;
      } else {
        session.fields[key] = value;
      }

      session.fieldIndex = session.fieldIndex + 1;

      if (session.fieldIndex <= form.fill.length - 1) {
        resolve(getField(session.fieldIndex, session.type));
      } else {
        const model = new nodes[session.type].Instance(session.fields);

        model.save()
        .then(() => resolve(new Response({ text: 'Done!' })))
        .catch(err => {
          console.error(err);
          resolve(new Response({ text: `Error: ${err.message}` }));
        });
      }
    }
  });

  route.catch(err => console.error(err));

  return route;
};

const AdminCreateNode = Node.discriminator('node-admin-create', schema);

module.exports = AdminCreateNode;
