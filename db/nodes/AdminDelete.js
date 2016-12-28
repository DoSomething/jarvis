'use strict';

const console = require('keypunch');
const mongo = require('../mongo');
const Node = require('./Node');
const Response = require(`${global.models}/Response`).model;
const stathat = require(`${global.root}/lib/stathat`);
const helpers = require(`${global.root}/util/helpers`);
const nodes = require(`${global.root}/config/nodes`);
const Conversation = require(`${global.models}/Conversation`);

const schema = new mongo.Schema({}, {
  discriminatorKey: 'node',
  toObject: {
    virtuals: true,
  },
});

schema.virtual('continuous').get(() => false);

function getUsersOnNode(nodeId) {
  return Conversation.count({ pointer: nodeId }).exec()
  .then(total => new Response({
    text: `(Y/N) Are you sure you want to delete? ${total} users are on this node.`,
  }));
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
  stathat.count('node executed~total,admin delete', 1);

  const msg = message.response.text;

  if (typeof conversation.session.adminDelete === 'undefined') {
    conversation.session.adminDelete = {
      step: 0,
      node: null,
      menu: null,
      confirmation: false,
    };
  }

  const session = conversation.session.adminDelete;

  const route = new Promise((resolve) => {
    switch (session.step) {
      case 0:
        resolve(new Response({ text: 'What is the title?' }));
        session.step++;
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
        const selection = session.menu[parseInt(msg, 10) - 1];

        if (selection) {
          session.node = selection;
          session.step++;
          getUsersOnNode(session.node._id).then(resolve);
        } else {
          resolve(new Response({
            text: 'Invalid selection. Just reply with the number.'
          }));
        }
        break;
      case 3:
        if (msg !== 'y') {
          resolve(new Response({
            text: 'Ok',
          }));
        } else {
          Node.find({_id: session.node._id})
          .remove()
          .exec()
          .then(() => {
            resolve(new Response({ text: 'Deleted' }));
          });
        }

        session.step++;
        break;
    }
  });

  route.catch(err => console.error(err));

  return route;
};

const AdminDeleteNode = Node.discriminator('node-admin-delete', schema);

module.exports = AdminDeleteNode;
