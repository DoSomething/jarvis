'use strict';

const console = require('keypunch');
const mongo = require('../mongo');
const Node = require('./Node');
const Segment = require(`${global.models}/Segment`);
const stathat = require(`${global.root}/lib/stathat`);

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
  toObject: {
    virtuals: true,
  },
});

schema.virtual('continuous').get(() => true);

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
  stathat.count('node executed~total,segment', 1);
  const createSegment = new Promise((resolve) => {
    conversation.pointer = this.next;

    const segment = new Segment({
      user: conversation.user,
      name: this.segmentName,
    });

    segment.save()
    .then(() => resolve())
    .catch(err => console.error(err));
  });

  createSegment.catch(err => console.error(err));

  return createSegment;
};

const SegmentNode = Node.discriminator('node-segment', schema);

module.exports = SegmentNode;
