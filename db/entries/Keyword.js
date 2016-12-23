'use strict';

const console = require('keypunch');
const mongo = require('../mongo');
const Entry = require('./Entry');
const protocols = require(`${global.root}/config/protocols`);

const schema = new mongo.Schema({
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
   * Keywords are marked as active if
   * users can send them in.
   */
  active: {
    type: Boolean,
    default: true,
    required: true,
  },
}, {
  discriminatorKey: 'entry',
});

schema.pre('validate', function(next) {
  if (!this.active) next();

  const keyword = this.keyword;
  const protocol = this.protocol;
  const active = true;

  Entry.findOne({ keyword, protocol, active }).exec()
  .then((dupe) => {
    if (dupe) {
      next(new Error('Duplicate active keyword'));
    } else {
      next();
    }
  })
});

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

schema.index({ keyword: 1, protocol: 1, active: 1 });

const KeywordEntry = Entry.discriminator('entry-keyword', schema);

module.exports = KeywordEntry;
