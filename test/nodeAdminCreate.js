require('./root');

const assert = require('chai').assert;
const AdminCreate = require('../db/models/NodeAdminCreate');
const Node = require('../db/models/Node');
const Flow = require('../db/models/Flow');

describe('verify admin create node schema', function() {
  it ('should have a requiredType, requiresInput & next', function() {
    const node = new AdminCreate({
      title: 'Test title 2',
      message: {text: 'test'},
      requiresType: null,
      requiresInput: null,
      next: null,
    });

    assert.isFunction(node.run, 'Run function is defined');
    assert.isString(node.title, 'Node title is defined');
    assert.isDefined(node.message, 'Node message is defined');
    assert.isDefined(node.next, 'Next node is defined');
    assert.isDefined(node.requiresType, 'Requires type is defined');
    assert.isDefined(node.requiresInput, 'Requires input is defined');
  });
});

describe('verify admin create node validation', function() {
  it ('should not save a node missing next', function() {
    const node = new AdminCreate({
      title: 'Test title 2',
      message: {text: 'test'},
      requiresInput: null,
      requiresType: null,
    });

    return node.save().catch((err) => {
      assert.isDefined(err, 'Node validation threw an error');
    });
  });
});

describe('verify admin create node functionality', function() {
  it ('should move pointer correctly for missing type', function() {
    const node1 = new Node({
      title: 'Test title 1',
      message: {text: 'test'}
    });

    const node2 = new Node({
      title: 'Test title 1',
      message: {text: 'test'}
    });

    const node3 = new AdminCreate({
      title: 'Test title 2',
      message: {text: 'test'},
      requiresType: node1,
      requiresInput: node2,
      next: node2,
    });

    return node3.save()
    .then(() => node3.run({}, {session: {}}))
    .then((conversation) => {
      assert.isDefined(conversation.pointer, 'pointer is deinfed');
      assert.equal(conversation.pointer._id, node1._id, 'pointer shifted correctly');
    });
  });

  it ('should move pointer correctly for missing fields', function() {
    const node1 = new Node({
      title: 'Test title 1',
      message: {text: 'test'}
    });

    const node2 = new Node({
      title: 'Test title 1',
      message: {text: 'test'}
    });

    const node3 = new AdminCreate({
      title: 'Test title 2',
      message: {text: 'test'},
      requiresType: node1,
      requiresInput: node2,
      next: node1,
    });

    return node3.save()
    .then(() => node3.run({}, {session: {adminCreate: {type: true}}}))
    .then((conversation) => {
      assert.isDefined(conversation.pointer, 'pointer is deinfed');
      assert.equal(conversation.pointer._id, node2._id, 'pointer shifted correctly');
    });
  });

  it ('should move pointer correctly for everything complete', function() {
    const node1 = new Node({
      title: 'Test title 1',
      message: {text: 'test'}
    });

    const node2 = new Node({
      title: 'Test title 1',
      message: {text: 'test'}
    });

    const node3 = new AdminCreate({
      title: 'Test title 2',
      message: {text: 'test'},
      requiresType: node1,
      requiresInput: node1,
      next: node2,
    });

    return node3.save()
    .then(() => node3.run({}, {session: {adminCreate: {type: 'flow', fields: {title: 'Test title'}}}}))
    .then((conversation) => {
      assert.isDefined(conversation.pointer, 'pointer is deinfed');
      assert.equal(conversation.pointer._id, node2._id, 'pointer shifted correctly');

      return Flow.findOne({title: 'Test title'}).exec().then((flow) => {
        assert.isDefined(flow, 'Flow was correctly saved');
      });
    });
  });
});
