'use strict';

const console = require('keypunch');
const stathat = require(`${global.root}/lib/stathat`);
const helpers = require(`${global.root}/util/helpers`);

const express = require('express');
const router = express.Router({ mergeParams: true });

const twilio = require(`${global.root}/lib/twilio`);

const User = require(`${global.models}/User`);
const Message = require(`${global.models}/Message`);

function createMessage(text, media, user) {
  const message = new Message({
    response: {
      text,
      media: media || '',
    },
    platform: 'twilio',
    client: {
      type: 'user',
      id: user._id,
    },
  });

  return message.lowercaseResponse().catch(err => console.error(err));
}

// router.post('/', twilio.middleware, (req, res) => {
router.post('/', (req, res) => {
  stathat.count('message recieved~total,twilio', 1);

  const scope = {
    user: {},
    message: {},
    platform: 'twilio'
  };

  const mobile = req.body.From.replace('+1', '');

  User.findOrCreate(mobile, 'mobile')
  .then((user) => {
    scope.user = user;
    return createMessage(req.body.Body, req.body.MediaUrl0, user);
  })
  .then((message) => {
    scope.message = message;
    return helpers.routeRequest(scope);
  })
  .then(message => twilio.sendMessage(message, scope.user))
  .then(() => res.send('ok'))
  .catch(err => console.error(err));
});

module.exports = router;
