'use strict';

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
   * The flow this Entry should link to.
   */
  flow: {
    type: mongo.mongoose.Schema.Types.ObjectId,
    ref: 'Flow',
    required: true,
  },
}, {
  discriminatorKey: 'entry',
  timestamps: true,
});

const Entry = mongo.mongoose.model('Entry', schema);

module.exports = Entry;

// Schema Dependencies
require('./Flow');
