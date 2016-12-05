require('./root');

const assert = require('chai').assert;
const PrintNode = require('../db/models/NodePrint');
const Node = require('../db/models/Node');

describe('verify print node schema', function() {
  it ('should have a title, message & next', function() {
    const node1 = new Node({
      title: 'Test title 1',
      message: 'Test message'
    });

    const node2 = new PrintNode({
      title: 'Test title 2',
      message: 'Test message 2',
      next: node1
    });

    assert.isFunction(node2.run, 'Run function is defined');
    assert.isString(node2.title, 'Node title is defined');
    assert.isString(node2.message, 'Node message is defined');
    assert.isDefined(node2.next, 'Next node is defined');
  });
});

describe('verify print node validation', function() {
  it ('should not save a node missing next', function() {
    const node = new PrintNode({
      title: 'Test title 2',
      message: 'Test message 2',
    });

    return node.save().catch((err) => {
      assert.isDefined(err, 'Node validation threw an error');
    });
  });
});

describe('verify print node functionality', function() {
  it ('should move pointer correctly', function() {
    const node1 = new Node({
      title: 'Test title 1',
      message: 'Test message'
    });

    const node2 = new PrintNode({
      title: 'Test title 2',
      message: 'Test message 2',
      next: node1
    });

    return node2.save()
    .then(() => node2.run({}, {}))
    .then((conversation) => {
      assert.isDefined(conversation.pointer, 'pointer is deinfed');
      assert.equal(conversation.pointer._id, node1._id, 'pointer shifted correctly');
    });
  });
});
