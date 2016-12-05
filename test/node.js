require('./root');

const assert = require('chai').assert;
const Node = require('../db/models/Node');

describe('verify node schema', function() {
  it ('should have a title & message', function() {
    const node = new Node({title: 'Test title', message: 'Test message'});

    assert.isString(node.title, 'Node title is defined');
    assert.isString(node.message, 'Node message is defined');
  });

  it ('should have a timestamp', function() {
    const node = new Node({title: 'Test title', message: 'Test message'});

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
    const node = new Node({title: 'Test title', message: 'Test message'});

    assert.isFunction(node.run, 'Run function is defined');
  });
});
