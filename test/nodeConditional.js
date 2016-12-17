require('./root');

const assert = require('chai').assert;
const ConditionalNode = require('../db/models/NodeConditional');
const Node = require('../db/models/Node');
const Message = require('../db/models/Message');

describe('verify conditional node schema', function() {
  it ('should have a title, message & conditional fields', function() {
    const pass = new Node({
      title: 'Test pass',
      message: {text: 'test'}
    });

    const fail = new Node({
      title: 'Test fail',
      message: {text: 'test'}
    });

    const condition = new ConditionalNode({
      title: 'Test condition',
      message: {text: 'test'},
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
      message: {text: 'test'},
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
      message: {text: 'test'}
    });

    const fail = new Node({
      title: 'Test fail',
      message: {text: 'test'}
    });

    const condition = new ConditionalNode({
      title: 'Test condition',
      message: {text: 'test'},
      testFor: 'test',
      pass,
      fail,
    });

    const message = new Message({
      response: {
        text: 'test',
      },
      platform: 'test',
      client: {
        type: 'user',
        id: 'test',
      }
    });

    return condition.save()
    .then(() => condition.run(message, {}))
    .then((conversation) => {
      assert.isDefined(conversation.pointer, 'pointer is deinfed');
      assert.equal(conversation.pointer._id, pass._id, 'pointer shifted correctly');
    });
  });
});
