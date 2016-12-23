'use strict';

const console = require('keypunch');
const mongo = require('../mongo');
const Node = require('./Node');
const response = require(`${global.models}/Response`);
const stathat = require(`${global.root}/lib/stathat`);

const schema = new mongo.Schema({
  /**
   * Content that should be displayed to the user.
   */
  output: response.schema,

  /**
   * The node that always comes next.
   */
  next: {
    type: mongo.Schema.Types.ObjectId,
    ref: 'Node',
  },
}, {
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
  stathat.count('node executed~total,print', 1);

  const printer = new Promise((resolve) => {
    if (this.next) conversation.pointer = this.next;
    resolve(this.output);
  });

  printer.catch(err => console.error(err));

  return printer;
};

const PrintNode = Node.discriminator('node-print', schema);

module.exports = PrintNode;
