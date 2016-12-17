require('./root');

const assert = require('chai').assert;
const Node = require('../db/models/Node');
const Flow = require('../db/models/Flow');

describe('verify flow schema', function() {
  it ('should have a title, start & nodes', function() {
    const testNode = new Node({title: 'Test node', message: {text: 'test'}});
    const flow = new Flow({
      title: 'Test flow',
      start: testNode,
      nodes: [testNode]
    });

    assert.isString(flow.title, 'has title');
    assert.isDefined(flow.start, 'has start node');
    assert.isArray(flow.nodes, 'has nodes');
  });

  it ('should have a timestamp', function() {
    const testNode = new Node({title: 'Test node', message: {text: 'test'}});
    const flow = new Flow({
      title: 'Test flow',
      start: testNode,
      nodes: [testNode]
    });

    return flow.save().then((flow) => {
      assert.isDefined(flow.updatedAt, 'has updatedAt');
      assert.isDefined(flow.createdAt, 'has createdAt');
    });
  });
});

describe('verify flow validation', function() {
  it ('should not save a flow missing nodes', function() {
    const testNode = new Node({title: 'Test node', message: {text: 'test'}});
    const flow = new Flow({
      title: 'Test flow',
    });

    return flow.save().catch((err) => {
      assert.isDefined(err, 'Flow validation threw an error');
    });
  });
});

describe('verify flow functionality', function() {
  it ('should populate the nodes', function() {
    const testNode = new Node({title: 'Test node', message: {text: 'test'}});
    const testFlow = new Flow({
      title: 'Test flow',
      start: testNode,
      nodes: [testNode]
    });

    return testNode.save()
    .then(testFlow.save)
    .then(() => Flow.findOne({_id: testFlow._id}).populate('start nodes').exec())
    .then((fl) => {
      assert.isObject(fl.start, 'Start is defined');
      assert.isString(fl.start.title, 'Flow start title is defined');
      assert.isArray(fl.nodes, 'Flow nodes are defined');
      assert.isString(fl.nodes[0].title, 'Flows first node title is defined');
    });
  });
});
