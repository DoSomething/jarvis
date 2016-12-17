require('./root');

const assert = require('chai').assert;
const nock = require('nock');
const ProtocolNode = require('../db/models/NodeProtocol');
const Node = require('../db/models/Node');
const Message = require('../db/models/Message');
const Conversation = require('../db/models/Conversation');
const User = require('../db/models/User');
const Flow = require('../db/models/Flow');
const KeywordEntry = require('../db/models/EntryKeyword');

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

describe('verify protocol node schema', function() {
  it ('should have a title, message & protocol metadata', function() {
    const node1 = new Node({
      title: 'Test title 1',
      message: testMessage,
    });

    const node2 = new ProtocolNode({
      title: 'Test title 2',
      message: testMessage,
      success: node1,
      failed: node1,
    });

    assert.isFunction(node2.run, 'Run function is defined');
    assert.isString(node2.title, 'Node title is defined');
    assert.isDefined(node2.message, 'Node message is defined');
    assert.isString(node2.protocol, 'Node protocol is defined');
    assert.isArray(node2.requiredRole, 'Node required role is defined');
    assert.isDefined(node2.success, 'Success node is defined');
    assert.isDefined(node2.failed, 'Failed node is defined');
  });
});

describe('verify protocol node validation', function() {
  it ('should not save a node missing success or failed', function() {
    const node = new ProtocolNode({
      title: 'Test title 2',
      message: testMessage
    });

    return node.save().catch((err) => {
      assert.isDefined(err, 'Node validation threw an error');
    });
  });
});

describe('verify protocol node functionality', function() {
  it ('should move pointer correctly for non admin', function() {
    const adminMessage = new Message({
      response: {
        text: 'admin'
      },
      platform: 'test',
      client: {
        type: 'user',
        id: 'abcd'
      },
      conversationId: '1234'
    });

    const node1 = new Node({
      title: 'Succesful protocol change',
      message: testMessage
    });

    const node2 = new Node({
      title: 'Failed protocol change',
      message: testMessage
    });

    const protocolNode = new ProtocolNode({
      title: 'Test title 3',
      message: testMessage,
      protocol: 'admin',
      requiredRole: ['admin'],
      success: node1,
      failed: node2,
    });

    const user = new User({_id: '5807ace57f43c2045904eda9'});
    const originalProtocol = user.protocol;

    const testFlow = new Flow({
      title: 'Protocol flow',
      start: protocolNode,
      nodes: [protocolNode, node1, node2]
    });
    const testEntry = new KeywordEntry({title: 'Test entry', flow: testFlow, keyword: 'protocol'});

    nock(process.env.NORTHSTAR_URI)
      .get('/v2/auth/token')
      .reply(200, {
        access_token: '12345'
      })
      .get(`/v1/users/id/${user._id}`)
      .reply(200, {
        data: {
          role: 'user',
        }
      });

    return node1.save()
    .then(node2.save)
    .then(user.save)
    .then(testFlow.save)
    .then(testEntry.save)
    .then(protocolNode.save)
    .then(() => Conversation.createFromEntry(user, testEntry))
    .then(convo => {
      convo.pointer = protocolNode;
      return convo.save();
    })
    .then(convo => Conversation.populate(convo, Conversation.populationFields))
    .then(convo => convo.updatePointer(adminMessage))
    .then((convo) => {
      assert.isDefined(convo.pointer, 'pointer is deinfed');
      assert.equal(convo.pointer.toString(), node2._id.toString(), 'pointer shifted correctly');
      assert.equal(convo.user.protocol, originalProtocol, 'protocol didnt change');
    })
    .catch(err => console.error(err));
  });

  it ('should move pointer correctly for an admin', function() {
    const adminMessage = new Message({
      response: {
        text: 'admin'
      },
      platform: 'test',
      client: {
        type: 'user',
        id: 'abcd'
      },
      conversationId: '1234'
    });

    const node1 = new Node({
      title: 'Succesful protocol change',
      message: testMessage
    });

    const node2 = new Node({
      title: 'Failed protocol change',
      message: testMessage
    });

    const protocolNode = new ProtocolNode({
      title: 'Test title 3',
      message: testMessage,
      protocol: 'admin',
      requiredRole: ['admin'],
      success: node1,
      failed: node2,
    });

    const user = new User({_id: '559442c4a59dbfc9578b4b6a'});
    const testFlow = new Flow({
      title: 'Protocol flow',
      start: protocolNode,
      nodes: [protocolNode, node1, node2]
    });
    const testEntry = new KeywordEntry({title: 'Test entry', flow: testFlow, keyword: 'protocol'});

    nock(process.env.NORTHSTAR_URI)
      .get('/v2/auth/token')
      .reply(200, {
        access_token: '12345'
      })
      .get(`/v1/users/id/${user._id}`)
      .reply(200, {
        data: {
          role: 'admin',
        }
      });

    return node1.save()
    .then(node2.save)
    .then(user.save)
    .then(testFlow.save)
    .then(testEntry.save)
    .then(protocolNode.save)
    .then(() => Conversation.createFromEntry(user, testEntry))
    .then(convo => {
      convo.pointer = protocolNode;
      return convo.save();
    })
    .then(convo => Conversation.populate(convo, Conversation.populationFields))
    .then(convo => convo.updatePointer(adminMessage))
    .then((convo) => {
      assert.isDefined(convo.pointer, 'pointer is deinfed');
      assert.equal(convo.pointer.toString(), node1._id.toString(), 'pointer shifted correctly');
    });
  });
});
