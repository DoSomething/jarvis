require('./root');

const assert = require('chai').assert;
const Node = require('../db/models/Node');
const Flow = require('../db/models/Flow');
const Entry = require('../db/models/Entry');
const Message = require('../db/models/Message');

const testMessage = new Message({
  response: {
    media: ['test.jpg']
  },
  platform: 'test',
  client: {
    type: 'jarvis',
    id: 'abcd'
  },
  conversationId: '1234'
});

describe('verify entry schema', function() {
  it ('should have a title & flow', function() {
    const testNode = new Node({title: 'Test node', message: testMessage});
    const testFlow = new Flow({
      title: 'Test flow',
      start: testNode,
      nodes: [testNode]
    });

    const entry = new Entry({
      title: 'A test entry',
      flow: testFlow
    });

    assert.isString(entry.title, 'has title');
    assert.isDefined(entry.flow, 'has a flow');
  });

  it ('should have a timestamp', function() {
    const testNode = new Node({title: 'Test node', message: testMessage});
    const testFlow = new Flow({
      title: 'Test flow',
      start: testNode,
      nodes: [testNode]
    });

    const entry = new Entry({
      title: 'A test entry',
      flow: testFlow
    });

    return entry.save().then((entry) => {
      assert.isDefined(entry.updatedAt, 'has updatedAt');
      assert.isDefined(entry.createdAt, 'has createdAt');
    });
  });
});

describe('verify entry validation', function() {
  it ('should not save an entry missing flow', function() {
    const entry = new Entry({
      title: 'A test entry',
    });

    return entry.save().catch((err) => {
      assert.isDefined(err, 'Entry validation threw an error');
    });
  });
});

describe('verify entry functionality', function() {
  it ('should populate the flow', function() {
    const testNode = new Node({title: 'Test node', message: testMessage});
    const testFlow = new Flow({
      title: 'Test flow',
      start: testNode,
      nodes: [testNode]
    });

    const entry = new Entry({
      title: 'A test entry',
      flow: testFlow
    });

    return testFlow.save()
    .then(entry.save)
    .then(() => Entry.findOne({_id: entry._id}).populate('flow').exec())
    .then((en) => {
      assert.isObject(en.flow, 'Flow is defined');
      assert.isString(en.flow.title, 'Flow title is defined');
    });
  });
});
