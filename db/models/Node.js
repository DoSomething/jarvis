'use strict';

const mongo = require('../mongo');
const Message = require('./Message');

const schema = new mongo.Schema({
  /**
   * Human readable title.
   */
  title: {
    type: String,
    required: true,
    text: true,
    trim: true,
  },

  /**
   * Message this node will output.
   */
  message: {
    type: mongo.Schema.Types.ObjectId,
    ref: 'Message',
    required: true,
  },
}, {
  discriminatorKey: 'node',
  timestamps: true,
});

/**
 * Based on the users message, modify the conversation pointer & run functionality.
 * (Default node does not modify anything)
 *
 * @param  {Message} message User message to parse.
 * @param  {Conversation} conversation conversation to modify.
 * @return {Promise}
 */
schema.methods.run = function (message, conversation) {
  return new Promise((resolve) => resolve(conversation));
};

const Node = mongo.mongoose.model('Node', schema);

module.exports = Node;

// Schema Dependencies
require('./NodePrint');
require('./NodeConditional');
