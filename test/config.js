require('./root');

const assert = require('chai').assert;

const clients = require(`${global.root}/config/clients`);
const nodes = require(`${global.root}/config/nodes`);
const platforms = require(`${global.root}/config/platforms`);
const protocols = require(`${global.root}/config/protocols`);

describe('check config types', function() {
  it ('should be an array', function() {
    assert.isArray(clients, 'clients is an array');
    assert.isArray(platforms, 'platforms is an array');
    assert.isArray(protocols, 'protocols is an array');
  });

  it ('should be an object', function() {
    assert.isObject(nodes, 'nodes is an object');
  });
});

describe('validate nodes structure', function() {
  it ('should be valid', function() {
    Object.keys(nodes).forEach((nodeKey) => {
      const node = nodes[nodeKey];

      assert.isObject(node, 'Node is an object');
      assert.isFunction(node.Instance, 'Instance is an function');
      assert.isObject(node.Instance.schema, 'Schema is an object');
      assert.equal(node.Instance.modelName.replace('node-', ''), nodeKey, 'Instance name matches');
      assert.isArray(node.attach, 'Attach is an array');
      assert.isArray(node.fill, 'Fill is an array');

      node.fill.forEach((fillItem) => {
        assert.isObject(fillItem, 'Fill item is an object');
        assert.isString(fillItem.name, 'Name is a string');
        assert.isString(fillItem.description, 'Description is a string');
        assert.isFunction(fillItem.onSubmit, 'Submit is a function');
          if (fillItem.parent) assert.isString(fillItem.parent, 'Parent is a string');
      });

      node.attach.forEach((attachment) => {
        assert.isObject(attachment, 'Attachment is an object');
        assert.isString(attachment.name, 'Name is a string');
        assert.isString(attachment.description, 'Description is a string');
      });
    });
  });
});
