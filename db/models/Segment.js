'use strict';

const mongo = require('../mongo');

const schema = new mongo.Schema({
  /**
   * The Jarvis user attached to this conversation
   */
  user: {
    type: mongo.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  /**
   * Every segment name is formatted
   * to be lowercase + trimmed.
   */
  name: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
}, {
  timestamps: {
    updatedAt: true,
    createdAt: false,
  },
});

const Segment = mongo.mongoose.model('Segment', schema);

module.exports = Segment;

// Schema Dependencies
require('./User');
