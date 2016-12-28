'use strict';

const console = require('keypunch');
const mongo = require('../mongo');
const Node = require('./Node');
const stathat = require(`${global.root}/lib/stathat`);

const schema = new mongo.Schema({
  /**
   * String to evaluate for in a message.
   */
  testFor: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },

  /**
   * If the evaluation passes, goto this node.
   */
  pass: {
    type: mongo.Schema.Types.ObjectId,
    ref: 'Node',
  },

  /**
   * If the evaluation fails, goto this node.
   */
  fail: {
    type: mongo.Schema.Types.ObjectId,
    ref: 'Node',
  },
}, {
  discriminatorKey: 'node',
  toObject: {
    virtuals: true,
  },
});

schema.virtual('continuous').get(() => true);

/**
 * Update the conversation pointer to the next node based
 * on the users message.
 *
 * @param  {Message} message User message to parse.
 * @param  {Conversation} conversation conversation to modify.
 * @return {Promise}
 */
schema.methods.run = function (message, conversation) {
  stathat.count('node executed~total,conditional', 1);
  const conditional = new Promise((resolve) => {
    const passedTest = this.testFor === message.response.text;
    conversation.pointer = passedTest ? this.pass : this.fail;

    resolve();
  });

  conditional.catch(err => console.error(err));

  return conditional;
};

const ConditionalNode = Node.discriminator('node-conditional', schema);

module.exports = ConditionalNode;
