require('./root');

const assert = require('chai').assert;
const ConditionalNode = require('../db/models/NodeConditional');
const Node = require('../db/models/Node');
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

describe('verify conditional node schema', function() {
  it ('should have a title, message & conditional fields', function() {
    const pass = new Node({
      title: 'Test pass',
      message: testMessage
    });

    const fail = new Node({
      title: 'Test fail',
      message: testMessage
    });

    const condition = new ConditionalNode({
      title: 'Test condition',
      message: testMessage,
      testFor: 'test',
      pass,
      fail,
    });

    assert.isFunction(condition.run, 'Run function is defined');
    assert.isString(condition.title, 'Node title is defined');
    assert.isDefined(condition.message, 'Node message is defined');
    assert.isString(condition.testFor, 'Node test is defined');
    assert.isDefined(condition.pass, 'Pass node is defined');
    assert.isDefined(condition.fail, 'Fail node is defined');
  });
});

describe('verify conditional node validation', function() {
  it ('should not save a node missing conditions', function() {
    const node = new ConditionalNode({
      title: 'Test title 2',
      message: testMessage,
    });

    return node.save().catch((err) => {
      assert.isDefined(err, 'Node validation threw an error');
    });
  });
});

describe('verify conditional node functionality', function() {
  it ('should move pointer correctly', function() {
    const pass = new Node({
      title: 'Test pass',
      message: testMessage
    });

    const fail = new Node({
      title: 'Test fail',
      message: testMessage
    });

    const condition = new ConditionalNode({
      title: 'Test condition',
      message: testMessage,
      testFor: 'test',
      pass,
      fail,
    });

    return condition.save()
    .then(() => condition.run({response: {text: 'test'}}, {}))
    .then((conversation) => {
      assert.isDefined(conversation.pointer, 'pointer is deinfed');
      assert.equal(conversation.pointer._id, pass._id, 'pointer shifted correctly');
    });
  });
});
