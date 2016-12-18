const console = require('keypunch');
const stathat = require('../../lib/stathat');
const helpers = require('../../util/helpers');
const Promise = require('bluebird'); // eslint-disable-line no-unused-vars

const express = require('express');
const router = express.Router({ mergeParams: true });

const twilio = require('../../lib/twilio');
const northstar = require('../../lib/northstar');

const User = require('../../db/Models/User');
const Message = require('../../db/models/Message');

function createMessage(text, user) {
  const message = new Message({
    response: {
      text,
    },
    platform: 'twilio',
    client: {
      type: 'user',
      id: user._id,
    },
  });

  return message.lowercaseResponse();
}

router.post('/', twilio.middleware, (req, res) => {
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
    return createMessage(req.body.Body, user);
  })
  .then((message) => {
    scope.message = message;
    return helpers.routeRequest(scope);
  })
  .then(message => {
    twilio.sendMessage(message, scope.user);
    stathat.count('message sent~total,twilio', 1);
  })
  .then(() => res.send('ok'))
  .catch(console.error);
});

module.exports = router;
