require('./root');

const assert = require('chai').assert;

const Conversation = require(`${global.models}/Conversation`);
const User = require(`${global.models}/User`);
const Node = require(`${global.nodes}/Node`);
const Message = require(`${global.models}/Message`);

const testUser = new User({});
const testNode = new Node({title: 'test'});

describe('conversation model', function() {
  const convo = new Conversation({
    user: testUser,
    entry: testNode,
  });

  it ('should save the conversation', function() {
    return convo.save().then((convo) => {
      assert.isObject(convo, 'Conversation is defined');
      assert.isObject(convo.user, 'User is defined');
      assert.isObject(convo.entry, 'Entry is defined');
      assert.isNull(convo.pointer, 'Pointer is null');
      assert.isObject(convo.session, 'Session is defined');
    });
  });

  it ('should have a timestamp', function() {
    return convo.save().then((convo) => {
      assert.isString(convo.updatedAt.toString(), 'Conversation has updatedAt');
      assert.isString(convo.createdAt.toString(), 'Conversation has createdAt');
    });
  });

  it ('should have message virtuals', function() {
    const test1 = new Message({
      platform: 'test',
      client: {type: 'application', id: 'jarvis'},
      conversationId: convo._id.toString(),
    });

    const test2 = new Message({
      platform: 'test',
      client: {type: 'application', id: 'jarvis'},
      conversationId: convo._id.toString(),
    });

    return test1.save().then(test2.save).then(convo.save)
    .then(convo => Conversation.populate(convo, 'messages'))
    .then(convo => {
      assert.isArray(convo.messages, 'Messages is populated');
      convo.messages.forEach((msg, index) => {
        assert.equal(msg._id.toString() === test1._id.toString() ||
        msg._id.toString() === test2._id.toString(), true, `Message ${index} is in array`);
      });
    });
  });

  it ('should have static fields', function() {
    assert.isArray(Conversation.populationFields, 'Conversation has populationFields');
  });
});

describe('conversation functionality', function() {
  it ('should get the active conversation', function() {
    const convo1 = new Conversation({
      user: testUser,
      entry: testNode,
    });

    const convo2 = new Conversation({
      user: testUser,
      entry: testNode,
    });

    return convo1.save()
    .then(convo2.save)
    .then(() => Conversation.getUsersActiveConversation(testUser._id))
    .then((activeConvo) => {
      assert.equal(activeConvo._id.toString(), convo2._id.toString(), 'Active conversation retrieved');
    });
  });

  it ('should create a conversation', function() {
    return testUser.save().then(testNode.save)
    .then(() => Conversation.createFromEntry(testUser, testNode))
    .then((convo) => {
      assert.isObject(convo, 'Convo is defined');
      assert.equal(convo.user._id.toString(), testUser._id.toString(), 'user id matches');
      assert.equal(convo.entry._id.toString(), testNode._id.toString(), 'entry id matches');
      assert.isNull(convo.pointer, 'pointer is null');
    });
  });
});
