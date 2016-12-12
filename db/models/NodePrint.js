'use strict';

const mongo = require('../mongo');
const Node = require('./Node');

const schema = new mongo.Schema({
  /**
   * The node that always comes next.
   */
  next: {
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
    conversation.pointer = this.next;
    resolve(conversation);
  });
};

const PrintNode = Node.discriminator('node-print', schema);

module.exports = PrintNode;