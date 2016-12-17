require('./root');

const assert = require('chai').assert;
const SegmentNode = require('../db/models/NodeSegment');
const Node = require('../db/models/Node');
const Message = require('../db/models/Message');
const User = require('../db/models/User');

const testMessage = new Message({
  response: {
    text: 'test message'
  },
  platform: 'test',
  client: {
    type: 'jarvis',
    id: 'abcd'
  },
  conversationId: '1234'
});

describe('verify segment node schema', function() {
  it ('should have a title, message & next', function() {
    const node1 = new Node({
      title: 'Test title 1',
      message: testMessage,
    });

    const node2 = new SegmentNode({
      title: 'Test title 2',
      message: null,
      segmentName: 'Test segment',
      next: node1,
    });

    assert.isFunction(node2.run, 'Run function is defined');
    assert.isString(node2.title, 'Node title is defined');
    assert.isDefined(node2.message, 'Node message is defined');
    assert.isDefined(node2.next, 'Next node is defined');
    assert.isString(node2.segmentName, 'Segment is defined');
  });

  it('should have a virtual hop property', function() {
    const node = new SegmentNode({
      title: 'Test title',
      message: null,
      segmentName: 'Test segment',
      next: null,
    });

    assert.isBoolean(node.hop, 'Has hop boolean');
    assert.equal(node.hop, true, 'Hop is set to false');
  });
});

describe('verify segment node validation', function() {
  it ('should not save a node missing segment name', function() {
    const node = new SegmentNode({
      title: 'Test title 2',
      message: testMessage,
      next: null,
    });

    return node.save().catch((err) => {
      assert.isDefined(err, 'Node validation threw an error');
    });
  });
});

describe('verify segment node functionality', function() {
  it ('should move pointer correctly', function() {
    const user = new User();

    const node1 = new Node({
      title: 'Test title 1',
      message: testMessage
    });

    const node2 = new SegmentNode({
      title: 'Test title 2',
      message: testMessage,
      next: node1,
      segmentName: 'test'
    });

    return node2.save()
    .then(() => node2.run({}, {user}))
    .then((conversation) => {
      assert.isDefined(conversation.pointer, 'pointer is deinfed');
      assert.equal(conversation.pointer._id, node1._id, 'pointer shifted correctly');
    });
  });
});
