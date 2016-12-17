'use strict';

const mongo = require('../mongo');
const Node = require('./Node');
const Segment = require('./Segment');

const schema = new mongo.Schema({
  /**
   * The node that always comes next.
   */
  next: {
    type: mongo.Schema.Types.ObjectId,
    ref: 'Node',
    required: true,
  },

  /**
   * Name of the segment to make.
   */
  segmentName: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
}, {
  discriminatorKey: 'node',
  virtuals: {
    toObject: true,
  },
});

schema.virtual('hop').get(() => true);

/**
 * Update the conversation pointer to the next node.
 * Creates a segment for the given user & this nodes
 * segment name.
 *
 * @param  {Message} message User message to parse.
 * @param  {Conversation} conversation conversation to modify.
 * @return {Promise}
 */
schema.methods.run = function (message, conversation) {
  return new Promise((resolve) => {
    conversation.pointer = this.next;

    const segment = new Segment({
      user: conversation.user,
      name: this.segmentName,
    });

    segment.save().then(() => resolve(conversation));
  });
};

const SegmentNode = Node.discriminator('node-segment', schema);

module.exports = SegmentNode;
