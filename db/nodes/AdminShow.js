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

function showNode(node) {
  const type = node.node.replace('node-', '');
  const form = nodes[type];
  let text = '';

  form.fill.forEach((field) => {
    const name = field.name;
    text += `*${name}* ${node[name]}\n`;
  });

  let completedAttachments = 0;

  return new Promise((resolve) => {
    form.attach.forEach((attachmentField) => {
      const attachmentName = attachmentField.name;
      const _id = node[attachmentName];

      Node.findOne({ _id }).exec().then((attachment) => {
        completedAttachments++;
        text += `${attachmentName} --> ${attachment.title}\n`;

        if (completedAttachments >= form.attach.length) {
          resolve(new Response({ text }));
        }
      });
    });
  });
}

/**
 * Link a field to another model.
 *
 * @param  {Message} message User message to parse.
 * @param  {Conversation} conversation conversation to modify.
 * @return {Promise}
 */
schema.methods.run = function (message, conversation) {
  stathat.count('node executed~total,admin show', 1);

  const msg = message.response.text;

  if (typeof conversation.session.adminShow === 'undefined') {
    conversation.session.adminShow = {
      step: 0,
      menu: null,
    };
  }

  const session = conversation.session.adminShow;

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
        const selection = session.menu[parseInt(msg, 10) - 1];

        if (!selection) {
          resolve(new Response({
            text: 'Invalid selection. Just reply with the number.'
          }));
        }

        session.step++;
        showNode(selection).then(resolve);
        break;
    }

  });

  route.catch(err => console.error(err));

  return route;
};

const AdminShowNode = Node.discriminator('node-admin-show', schema);

module.exports = AdminShowNode;
