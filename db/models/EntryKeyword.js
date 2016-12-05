'use strict';

const mongo = require('../mongo');
const Entry = require('./Entry');
const Flow = require('./Flow');

const schema = new mongo.Schema({
  /**
   * Every keyword is unique and
   * automatically formatted to be lowercase + trimmed.
   */
  keyword: {
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true,
  },
}, {
  discriminatorKey: 'entry',
});

/**
 * Find a KeywordEntry by the given keyword and
 * automatically populate the flow.
 *
 * @param  {String} keyword
 * @return {Promise}
 */
schema.statics.findByKeyword = function (keyword) {
  return this.findOne({ keyword }).populate('flow').exec();
};

const KeywordEntry = Entry.discriminator('entry-keyword', schema);

module.exports = KeywordEntry;
