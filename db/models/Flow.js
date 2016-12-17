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
  },

  /**
   * The Node to start on when executing this flow.
   */
  start: {
    type: mongo.Schema.Types.ObjectId,
    ref: 'Node',
  },

  /**
   * All of the Nodes in this flow.
   */
  nodes: [
    {
      type: mongo.Schema.Types.ObjectId,
      ref: 'Node',
    },
  ],
}, {
  timestamps: true,
});

const Flow = mongo.mongoose.model('Flow', schema);

module.exports = Flow;

// Schema Dependencies
require('./Node');
