require('./root');

const assert = require('chai').assert;
const Node = require('../db/models/Node');
const PrintNode = require('../db/models/NodePrint');
const SegmentNode = require('../db/models/NodeSegment');
const User = require('../db/models/User');
const Flow = require('../db/models/Flow');
const Conversation = require('../db/models/Conversation');
const KeywordEntry = require('../db/models/EntryKeyword');
const Message = require('../db/models/Message');
const platforms = require('../config/platforms');
const clients = require('../config/clients');

describe('verify conversation schema', function() {
  it ('should have a user, entry and pointer', function() {
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
    const testNode = new Node({title: 'Test node', message: testMessage});
    const testFlow = new Flow({
      title: 'Test flow',
      start: testNode,
      nodes: [testNode]
    });
    const testEntry = new KeywordEntry({title: 'Test entry', flow: testFlow, keyword: 'test'});

    const conversation = new Conversation({
      user: new User(),
      entry: testEntry,
    });

    assert.isDefined(conversation.user, 'User is defined');
    assert.isDefined(conversation.entry, 'Entry is defined');
    assert.isNull(conversation.pointer, 'Pointer is null');
  });

  it ('should have a timestamp', function() {
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
    const testNode = new Node({title: 'Test node', message: testMessage});
    const testFlow = new Flow({
      title: 'Test flow',
      start: testNode,
      nodes: [testNode]
    });
    const testEntry = new KeywordEntry({title: 'Test entry', flow: testFlow, keyword: 'test'});

    const conversation = new Conversation({
      user: new User(),
      entry: testEntry,
    });

    return conversation.save().then((conversation) => {
      assert.isDefined(conversation.updatedAt, 'has updatedAt');
      assert.isDefined(conversation.createdAt, 'has createdAt');
    });
  });
});

describe('verify conversation validation', function() {
  it ('should not accept a conversation missing an entry', function() {
    const conversation = new Conversation({
      user: new User(),
    });

    return conversation.save().catch((err) => {
      assert.isDefined(err, 'Node validation threw an error');
    });
  });
});

describe('verify conversation virtuals', function() {
  it ('should have messages populated', function() {
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
    const testNode = new Node({title: 'Test node', message: testMessage});
    const testFlow = new Flow({
      title: 'Test flow',
      start: testNode,
      nodes: [testNode]
    });
    const testEntry = new KeywordEntry({title: 'Test entry', flow: testFlow, keyword: 'test'});

    const conversation = new Conversation({
      user: new User(),
      entry: testEntry,
    });

    const message = new Message({
      response: {
        text: 'test message'
      },
      platform: platforms[0],
      client: {
        type: clients[0],
        id: 'abcd'
      },
    });

    return message.attachConversation(conversation)
    .then(() => conversation.save())
    .then(() => Conversation.findOne({_id: conversation._id}).populate('messages').exec())
    .then((convo) => {
      assert.isArray(convo.messages, 'Messages populated');
      assert.equal(convo.messages[0]._id.toString(), message._id.toString(), 'Proper message populated')
    });
  });
});

describe('verify conversation functionality', function() {
  it ('should populate the conversation', function() {
    const testUser = new User();
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
    const testNode = new Node({title: 'Test node', message: testMessage});
    const testFlow = new Flow({
      title: 'Test flow',
      start: testNode,
      nodes: [testNode]
    });
    const testEntry = new KeywordEntry({title: 'Test entry', flow: testFlow, keyword: 'test'});

    const conversation = new Conversation({
      user: testUser,
      entry: testEntry,
      pointer: testNode,
    });

    return testUser.save()
    .then(testMessage.save)
    .then(testNode.save)
    .then(testFlow.save)
    .then(testEntry.save)
    .then(conversation.save)
    .then(convo => Conversation.populate(convo, Conversation.populationFields))
    .then((convo) => {
      assert.equal(convo.entry._id.toString(), testEntry._id.toString(), 'Entry defined');
      assert.equal(convo.entry.flow._id.toString(), testFlow._id.toString(), 'Flow defined');
      assert.equal(convo.user._id.toString(), testUser._id.toString(), 'User defined');
      assert.equal(convo.pointer._id.toString(), testNode._id.toString(), 'Pointer defined');
    });
  });

  it ('should create a new conversation from entry', function() {
    const testUser = new User();
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
    const testNode = new Node({title: 'Test node', message: testMessage});
    const testFlow = new Flow({
      title: 'Test flow',
      start: testNode,
      nodes: [testNode]
    });
    const testEntry = new KeywordEntry({title: 'Test entry', flow: testFlow, keyword: 'test'});

    return testUser.save()
    .then(testMessage.save)
    .then(testNode.save)
    .then(testFlow.save)
    .then(testEntry.save)
    .then(() => Conversation.createFromEntry(testUser, testEntry))
    .then((convo) => {
      assert.equal(convo.entry._id.toString(), testEntry._id.toString(), 'Entry defined');
      assert.equal(convo.entry.flow._id.toString(), testFlow._id.toString(), 'Flow defined');
      assert.equal(convo.user._id.toString(), testUser._id.toString(), 'User defined');
    });
  });

  it ('should find the most recent conversation', function() {
    const testUser = new User();
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
    const testNode = new Node({title: 'Test node', message: testMessage});
    const testFlow = new Flow({
      title: 'Test flow',
      start: testNode,
      nodes: [testNode]
    });
    const testEntry = new KeywordEntry({title: 'Test entry', flow: testFlow, keyword: 'test'});

    const conversation1 = new Conversation({
      user: testUser,
      entry: testEntry,
      pointer: testNode,
    });

    const conversation2 = new Conversation({
      user: testUser,
      entry: testEntry,
      pointer: testNode,
    });

    return testUser.save()
    .then(conversation1.save)
    .then(conversation2.save)
    .then(() => Conversation.getUsersActiveConversation(testUser))
    .then((convo) => {
      assert.equal(convo._id.toString(), conversation2._id.toString(), 'Most recent conversation returned');
    });
  });

  it ('should update the null pointer', function() {
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
    const testNode2 = new Node({title: 'Test node', message: testMessage});
    const testNode1 = new PrintNode({title: 'Test node', message: testMessage, next: testNode2});
    const testFlow = new Flow({
      title: 'Test flow',
      start: testNode1,
      nodes: [testNode1, testNode2]
    });
    const testEntry = new KeywordEntry({title: 'Test entry', flow: testFlow, keyword: 'test'});
    const testUser = new User();

    const conversation = new Conversation({
      user: testUser,
      entry: testEntry,
    });

    const message = new Message({
      response: {
        text: 'test message'
      },
      platform: platforms[0],
      client: {
        type: 'user',
        id: testUser._id.toString(),
      },
    });

    return testNode1.save()
    .then(testNode2.save)
    .then(testFlow.save)
    .then(testEntry.save)
    .then(testUser.save)
    .then(message.save)
    .then(conversation.save)
    .then(convo => Conversation.populate(convo, Conversation.populationFields))
    .then(convo => convo.updatePointer(message))
    .then(convo => Conversation.populate(convo, 'pointer'))
    .then((convo) => {
      assert.equal(convo.pointer._id.toString(), testNode1._id.toString(), 'Pointer updated correctly');
    });
  });

  it ('should update the defined pointer', function() {
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
    const testNode2 = new Node({title: 'Test node', message: testMessage});
    const testNode1 = new PrintNode({title: 'Test node', message: testMessage, next: testNode2});
    const testFlow = new Flow({
      title: 'Test flow',
      start: testNode1,
      nodes: [testNode1, testNode2]
    });
    const testEntry = new KeywordEntry({title: 'Test entry', flow: testFlow, keyword: 'test'});
    const testUser = new User();

    const conversation = new Conversation({
      user: testUser,
      entry: testEntry,
      pointer: testNode1,
    });

    const message = new Message({
      response: {
        text: 'test message'
      },
      platform: platforms[0],
      client: {
        type: 'user',
        id: testUser._id.toString(),
      },
    });

    return testNode1.save()
    .then(testNode2.save)
    .then(testFlow.save)
    .then(testEntry.save)
    .then(testUser.save)
    .then(message.save)
    .then(conversation.save)
    .then(convo => Conversation.populate(convo, Conversation.populationFields))
    .then(convo => convo.updatePointer(message))
    .then(convo => Conversation.populate(convo, 'pointer'))
    .then((convo) => {
      assert.equal(convo.pointer._id.toString(), testNode2._id.toString(), 'Pointer updated correctly');
    });
  });

  it ('should update the null pointer and hop', function() {
    const testMessage = new Message({
      response: {
        text: 'test message'
      },
      platform: 'test',
      client: {
        type: 'jarvis',
        id: 'abcd'
      },
      conversationId: '1234'
    });
    const testNode2 = new Node({title: 'Test node', message: testMessage});
    const testNode1 = new SegmentNode({title: 'Test node', message: testMessage, next: testNode2, segmentName: 'test segment'});
    const testFlow = new Flow({
      title: 'Test flow',
      start: testNode1,
      nodes: [testNode1, testNode2]
    });
    const testEntry = new KeywordEntry({title: 'Test entry', flow: testFlow, keyword: 'test'});
    const testUser = new User();

    const conversation = new Conversation({
      user: testUser,
      entry: testEntry,
    });

    const message = new Message({
      response: {
        text: 'test message'
      },
      platform: platforms[0],
      client: {
        type: 'user',
        id: testUser._id.toString(),
      },
    });

    return testNode1.save()
    .then(testNode2.save)
    .then(testFlow.save)
    .then(testEntry.save)
    .then(testUser.save)
    .then(message.save)
    .then(conversation.save)
    .then(convo => Conversation.populate(convo, Conversation.populationFields))
    .then(convo => convo.updatePointer(message))
    .then(convo => Conversation.populate(convo, 'pointer'))
    .then((convo) => {
      assert.equal(convo.pointer._id.toString(), testNode2._id.toString(), 'Pointer updated correctly');
    });
  });

  it ('should update the defined pointer and double hop', function() {
    const testMessage = new Message({
      response: {
        text: 'test message'
      },
      platform: 'test',
      client: {
        type: 'jarvis',
        id: 'abcd'
      },
      conversationId: '1234'
    });
    const testNode3 = new Node({title: 'Test node', message: testMessage});
    const testNode2 = new SegmentNode({title: 'Test node', message: testMessage, next: testNode3, segmentName: 'test segment'});
    const testNode1 = new SegmentNode({title: 'Test node', message: testMessage, next: testNode2, segmentName: 'test segment'});
    const testFlow = new Flow({
      title: 'Test flow',
      start: testNode1,
      nodes: [testNode1, testNode2, testNode3]
    });
    const testEntry = new KeywordEntry({title: 'Test entry', flow: testFlow, keyword: 'test'});
    const testUser = new User();

    const conversation = new Conversation({
      user: testUser,
      entry: testEntry,
      pointer: testNode1,
    });

    const message = new Message({
      response: {
        text: 'test message'
      },
      platform: platforms[0],
      client: {
        type: 'user',
        id: testUser._id.toString(),
      },
    });

    return testNode1.save()
    .then(testNode2.save)
    .then(testNode3.save)
    .then(testFlow.save)
    .then(testEntry.save)
    .then(testUser.save)
    .then(message.save)
    .then(conversation.save)
    .then(convo => Conversation.populate(convo, Conversation.populationFields))
    .then(convo => convo.updatePointer(message))
    .then(convo => Conversation.populate(convo, 'pointer'))
    .then((convo) => {
      assert.equal(convo.pointer._id.toString(), testNode3._id.toString(), 'Pointer updated correctly');
    });
  });
});
