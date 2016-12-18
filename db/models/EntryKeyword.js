'use strict';

const Promise = require('bluebird'); // eslint-disable-line no-unused-vars
const mongo = require('../mongo');
const Entry = require('./Entry');
const protocols = require('../../config/protocols');

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
}, {
  discriminatorKey: 'entry',
});

/**
 * Find a KeywordEntry by the given keyword and protocol.
 * Additionally, automatically populate the flow.
 *
 * @param {String} keyword
 * @param {String} protocol
 * @return {Promise}
 */
schema.statics.findByKeyword = function (keyword, protocol) {
  return this.findOne({ keyword, protocol }).populate('flow').exec();
};

schema.index({ keyword: 1, protocol: 1 }, { unique: true });

const KeywordEntry = Entry.discriminator('entry-keyword', schema);

module.exports = KeywordEntry;

// Flow Dependencies
require('./Flow');
