require('./root');

const assert = require('chai').assert;
const Message = require('../db/models/Message');
const Node = require('../db/models/Node');
const platforms = require('../config/platforms');
const clients = require('../config/clients');

const testMessage = new Message({
  response: {
    media: ['test.jpg']
  },
  platform: platforms[0],
  client: {
    type: clients[0],
    id: 'abcd'
  },
  conversationId: '1234'
});

describe('verify node schema', function() {
  it ('should have a title & message', function() {
    const node = new Node({title: 'Test title', message: testMessage});

    assert.isString(node.title, 'Node title is defined');
    assert.isDefined(node.message, 'Node message is defined');
  });

  it ('should have a timestamp', function() {
    const node = new Node({title: 'Test title', message: testMessage});

    return node.save().then((node) => {
      assert.isDefined(node.updatedAt, 'has updatedAt');
      assert.isDefined(node.createdAt, 'has createdAt');
    });
  });
});

describe('verify node validation', function() {
  it ('should not save a blank node', function() {
    const node = new Node();

    return node.save().catch((err) => {
      assert.isDefined(err, 'Node validation threw an error');
    });
  });
});

describe('verify node functionality', function() {
  it ('should have a run method', function() {
    const node = new Node({title: 'Test title', message: testMessage});

    assert.isFunction(node.run, 'Run function is defined');
  });
});
