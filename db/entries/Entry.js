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
   * The Node to start on when executing this flow.
   */
  start: {
    type: mongo.Schema.Types.ObjectId,
    ref: 'Node',
  },
}, {
  discriminatorKey: 'entry',
  timestamps: true,
});

const Entry = mongo.mongoose.model('Entry', schema);

module.exports = Entry;
