'use strict';

const console = require('keypunch');
const mongo = require('../mongo');
const Node = require('./Node');
const protocols = require(`${global.root}/config/protocols`);
const stathat = require(`${global.root}/lib/stathat`);

const schema = new mongo.Schema({
  /**
   * The node that always comes next.
   */
  start: {
    type: mongo.Schema.Types.ObjectId,
    ref: 'Node',
  },

  /**
   * Every keyword is formatted
   * to be lowercase + trimmed.
   */
  keyword: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },

  /**
   * Every keyword must be tied
   * to a specific protocol.
   */
  protocol: {
    type: String,
    default: 'user',
    enum: protocols,
    required: true,
    lowercase: true,
    trim: true,
  },

  /**
   * Multiple keywords can exist of the same
   * string, but only one can be active.
   */
  active: {
    type: Boolean,
    default: true,
    required: true,
  },
}, {
  discriminatorKey: 'node',
  toObject: {
    virtuals: true,
  },
});

schema.virtual('continuous').get(() => true);

schema.index({ keyword: 1, protocol: 1, active: 1 });

schema.pre('validate', function (next) {
  if (!this.active) next();

  const keyword = this.keyword;
  const protocol = this.protocol;
  const active = true;

  Node.find({ keyword, protocol, active }).exec()
  .then((dupes) => {
    if (dupes && dupes.length > 1) {
      next(new Error('Duplicate active keyword'));
    } else {
      next();
    }
  });
});

/**
 * Update the conversation pointer to the next node.
 *
 * @param  {Message} message User message to parse.
 * @param  {Conversation} conversation conversation to modify.
 * @return {Promise}
 */
schema.methods.run = function (message, conversation) { // eslint-disable-line no-unused-vars
  stathat.count('node executed~total,keyword', 1);
  return new Promise((resolve) => {
    if (this.start) conversation.pointer = this.start;
    resolve();
  });
};

/**
 * Find a KeywordEntry by the given keyword and protocol.
 * Additionally, automatically populate the start node.
 *
 * @param {String} keyword
 * @param {String} protocol
 * @param {Boolean} active
 * @return {Promise}
 */
schema.statics.findByKeyword = function (keyword, protocol, active) {
  return this.findOne({ keyword, protocol, active })
  .populate('start')
  .exec()
  .catch(err => console.error(err));
};

const KeywordNode = Node.discriminator('node-keyword', schema);

module.exports = KeywordNode;
