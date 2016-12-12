const console = require('keypunch');
const helpers = require('../../util/helpers');

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

router.post('/', (req, res) => {
  const scope = {
    user: {},
    message: {},
    platform: 'twilio'
  };

  northstar
  .findUserByMobile(req.body.From.replace('+1', ''))
  .then(nsUser => User.findOrCreate(nsUser.data.id))
  .then((user) => {
    scope.user = user;
    return createMessage(req.body.Body, user);
  })
  .then((message) => {
    scope.message = message;
    return helpers.routeRequest(scope);
  })
  .then(message => twilio.sendMessage(message, scope.user))
  .then(() => res.send('ok'))
  .catch(console.error);
});

module.exports = router;
