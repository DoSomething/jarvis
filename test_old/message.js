require('./root');

const assert = require('chai').assert;
const Message = require('../db/models/Message');
const Conversation = require('../db/models/Conversation');
const platforms = require('../config/platforms');
const clients = require('../config/clients');

describe('verify message schema', function() {
  it ('should have a response, platform, client & conversation', function() {
    const message = new Message({
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

    assert.isString(message.response.text, 'Response text default is defined');
    assert.isArray(message.response.media, 'Response media is defined');
    assert.isString(message.response.media[0], 'Response media first img is defined');
    assert.isString(message.platform, 'Platform is defined');
    assert.isString(message.client.type, 'Client type is defined');
    assert.isString(message.client.id, 'Client ID is defined');
    assert.isString(message.conversationId, 'Conversation ID is defined');
  });

  it ('should only have a createdAt timestamp', function() {
    const message = new Message({
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

    return message.save().then((msg) => {
      assert.isUndefined(msg.updatedAt, 'does not have updatedAt');
      assert.isDefined(msg.createdAt, 'has createdAt');
    });
  });
});

describe('verify message validation', function() {
  it ('should not save a message missing metadata', function() {
    const message = new Message({
      response: {
        text: 'Test message'
      }
    });

    return message.save().catch((err) => {
      assert.isDefined(err, 'Message validation threw an error');
    });
  });

  it ('should not save a message with a platform not supported', function() {
    const message = new Message({
      response: {
        media: ['test.jpg'],
      },
      platform: 'lol this is wrong',
      client: {
        type: clients[0],
        id: 'abcd'
      },
      conversationId: '1234'
    });

    return message.save().catch((err) => {
      assert.isDefined(err, 'Message validation threw an error');
    });
  });
});

describe('verify message functionality', function() {
  it ('should return the last conversation message', function() {
    const conversationId = '1234';

    const message1 = new Message({
      response: {
        text: 'first msg',
        media: ['test.jpg'],
      },
      platform: platforms[0],
      client: {
        type: clients[0],
        id: 'abcd'
      },
      conversationId
    });

    const message2 = new Message({
      response: {
        text: 'second msg',
        media: ['test.jpg'],
      },
      platform: platforms[0],
      client: {
        type: clients[0],
        id: 'abcd'
      },
      conversationId
    });

    const conversation = {_id: conversationId};

    return message1.save()
    .then(message2.save)
    .then(() => Message.findLastConversationMessage(conversation))
    .then((msg) => {
      assert.equal(msg._id.toString(), message2._id.toString(), 'Correct msg returned');
    });
  });

  it ('should have lowercase the users message', function() {
    const message = new Message({
      response: {
        text: 'HELLO'
      },
      platform: platforms[0],
      client: {
        type: 'user',
        id: 'abcd'
      },
      conversationId: '1234'
    });

    return message.lowercaseResponse().then(msg => {
      assert.equal(msg.response.text, msg.response.text.toLowerCase(), 'Response message is lower case');
    });
  });

  it ('should attach the conversation', function() {
    const conversation = new Conversation();
    const message = new Message({
      response: {
        text: 'HELLO'
      },
      platform: platforms[0],
      client: {
        type: 'user',
        id: 'abcd'
      }
    });

    return message.save()
    .then(msg => msg.attachConversation(conversation))
    .then(msg => {
      assert.equal(msg.conversationId, conversation._id, 'Conversation id is correct');
    });
  });
});
