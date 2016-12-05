const console = require('keypunch');

const express = require('express');
const router = express.Router({ mergeParams: true });

const User = require('../../db/Models/User');
const Message = require('../../db/models/Message');
const Keyword = require('../../db/models/EntryKeyword');
const Conversation = require('../../db/models/Conversation');

function createMessage(text, user) {
  const message = new Message({
    response: {
      text,
    },
    platform: 'http',
    client: {
      type: 'user',
      id: user._id,
    },
  });

  return message.lowercaseResponse();
}

router.post('/', (req, res) => {
  const northstarId = req.body.northstar_id;
  const text = req.body.text;

  const scope = {
    user: {},
    message: {},
  };

  User.findOrCreate(northstarId)
  .then(user => {
    scope.user = user;
    return createMessage(text, user);
  })
  .then((message) => { // At this point most of the follow logic could be moved to a helpers.js in the Util folder.
    scope.message = message;
    return Keyword.findByKeyword(message.response.text);
  })
  .then((keyword) => {
    return keyword ?
      Conversation.createFromEntry(scope.user, keyword) :
      Conversation.getUsersActiveConversation(scope.user.id);
  })
  .then((conversation) => {
    return scope.message.attachConversation(conversation)
    .then(message => conversation.updatePointer(message))
  })
  .then(conversation => Conversation.populate(conversation, 'pointer'))
  .then(conversation => res.send(conversation.pointer.message))
  .catch(console.error);
});

module.exports = router;
