require('./root');

const assert = require('chai').assert;
const Node = require('../db/models/Node');
const platforms = require('../config/platforms');
const clients = require('../config/clients');


describe('verify node schema', function() {
  it ('should have a title & message', function() {
    const node = new Node({title: 'Test title', message: {text: 'test'}});

    assert.isString(node.title, 'Node title is defined');
    assert.isDefined(node.message, 'Node message is defined');
  });

  it ('should have a timestamp', function() {
    const node = new Node({title: 'Test title', message: {text: 'test'}});

    return node.save().then((node) => {
      assert.isDefined(node.updatedAt, 'has updatedAt');
      assert.isDefined(node.createdAt, 'has createdAt');
    });
  });

  it('should have a hop property', function() {
    const node = new Node({
      title: 'Test title',
      message: {text: 'test'},
    });

    assert.isBoolean(node.hop, 'Has default hop boolean');
    assert.equal(node.hop, false, 'Default hop is set to false');
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
    const node = new Node({title: 'Test title', message: {text: 'test'}});

    assert.isFunction(node.run, 'Run function is defined');
  });
});
