'use strict';

const Promise = require('bluebird'); // eslint-disable-line no-unused-vars
const mongo = require('../mongo');

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
    /**
     * Text to output.
     */
    text: {
      type: String,
      trim: true,
      default: '',
    },

    /**
     * Should contain strings of Media URI's.
     */
    media: [
      {
        type: String,
        lowercase: true,
        trim: true,
        default: [],
      },
    ],
  },

  /**
   * Indicate if the flow should hop
   * over this node.
   */
  hop: {
    type: Boolean,
    required: true,
    default: false,
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
require('./Message');
