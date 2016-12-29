'use strict';

module.exports = {};

const console = require('keypunch');
const Keyword = require(`${global.nodes}/Keyword`);
const Conversation = require(`${global.models}/Conversation`);
const Message = require(`${global.models}/Message`);
const Response = require(`${global.models}/Response`).model;
const Node = require(`${global.nodes}/Node`);
const nodes = require(`${global.root}/config/nodes`);

/**
 * Get the Message to return for the given platform
 * and conversation.
 * @param  {String} platform
 * @param  {Conversation} conversation
 * @param  {Response} response
 * @return {Promise}
 */
module.exports.getNodeMessage = (platform, conversation, response) => {
  const message = new Message({
    platform,
    response,
    client: {
      type: 'application',
      id: 'jarvis',
    },
    conversationId: conversation._id,
  });

  return message.save().catch(err => console.error(err));
};

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
module.exports.routeRequest = (scope) => // eslint-disable-line no-unused-expressions
  Keyword.findByKeyword(
    scope.message.response.text,
    scope.user.protocol, true)
  .then((keyword) => (keyword ?
    Conversation.createFromEntry(scope.user, keyword) :
    Conversation.getUsersActiveConversation(scope.user.id)))
  .then(conversation => scope.message.attachConversation(conversation)
    .then(message => conversation.updatePointer(message))
    .then((response) => module.exports.getNodeMessage(
      scope.platform,
      conversation,
      response))
    .catch(err => console.error(err))
  )
  .catch(err => console.error(err));

/**
 * Safley retrieve a variable under a multi layered data structure.
 * @param  {String} path      Dot seperated path. eg: 'user.profile.firstName'
 * @param  {Object} container Object to search.
 * @return {Mixed}            Returns the value if found, otherwise undefined.
 */
module.exports.deepGet = (path, container) => {
  if (typeof container === undefined) return undefined;

  const keys = path.split('.');
  let cursor = container;

  for (const key of keys) {
    if (typeof cursor[key] === 'undefined') return undefined;

    cursor = cursor[key];
  }

  return cursor;
};

/**
 * Get the node types an admin can create.
 * @return {Array}
 */
module.exports.getCreatableNodeTypes = () => Object.keys(nodes);

/**
 * Get a message containing each node type.
 * @return {Response}
 */
module.exports.getCreatableNodeTypesResponse = () => {
  let text = 'Please reply with one of the following types...\n';
  module.exports.getCreatableNodeTypes().forEach((type) => {
    text += `- ${type}\n`;
  });

  return new Response({ text });
};

/**
 * Check if the given type is creatable by an admin.
 * @param  {String}  type
 * @return {Boolean}
 */
module.exports.isValidCreatableNodeType = type => typeof nodes[type] !== 'undefined';

/**
 * Get the admin title menu.
 *
 * @param {String} query
 * @return {Promise}
 */
module.exports.getTitleMenu = (query) =>
  Node.find({ $text: { $search: query } }).exec()
  .then((menu) => {
    if (!menu || menu.length === 0) {
      return {
        menu: null,
        response: new Response({
          text: 'No nodes were found. Try a different title?',
        }),
      };
    }

    let msg = 'Please select a node...\n';

    menu.forEach((node, index) => {
      msg += `${index + 1}) ${node.title}`;
    });

    return {
      menu,
      response: new Response({ text: msg }),
    };
  });
