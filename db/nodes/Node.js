'use strict';

const mongo = require('../mongo');
const stathat = require(`${global.root}/lib/stathat`);

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
}, {
  discriminatorKey: 'node',
  timestamps: true,
  toObject: {
    virtuals: true,
  },
});

schema.virtual('continuous').get(() => false);

/**
 * Based on the users message, modify the conversation pointer & run functionality.
 * (Default node does not modify anything)
 *
 * @param  {Message} message User message to parse.
 * @param  {Conversation} conversation conversation to modify.
 * @return {Promise}
 */
schema.methods.run = function (message, conversation) {
  stathat.count('node executed~total,default', 1);
  return new Promise((resolve) => resolve());
};

const Node = mongo.mongoose.model('Node', schema);

module.exports = Node;
