const console = require('keypunch');
const stathat = require('../../lib/stathat');
const helpers = require('../../util/helpers');
const Promise = require('bluebird'); // eslint-disable-line no-unused-vars

const express = require('express');
const router = express.Router({ mergeParams: true });

const northstar = require('../../lib/northstar');

const User = require('../../db/Models/User');
const Message = require('../../db/models/Message');

/**
 * Create a Message for the given text & user.
 *
 * @param  {String} text
 * @param  {User} user
 * @return Promise
 */
function createMessage(text, user) {
  const message = new Message({
    response: {
      text,
    },
    platform: 'test',
    client: {
      type: 'user',
      id: user._id,
    },
  });

  return message.lowercaseResponse();
}

router.post('/', (req, res) => {
  stathat.count('message recieved~total,test', 1);

  const text = req.body.text;
  const email = req.body.email;

  if (!text) return res.status(400).send('Missing text');
  if (!email) return res.status(400).send('Missing email');

  const scope = {
    user: {},
    message: {},
    platform: 'test'
  };

  User.findOrCreate(email, 'email')
  .then((user) => {
    scope.user = user;
    return createMessage(text, user);
  })
  .then((message) => {
    scope.message = message;
    return helpers.routeRequest(scope);
  })
  .then(message => {
    res.send(message.response.text);
    stathat.count('message sent~total,test', 1);
  })
  .catch(err => console.error(err));
});

module.exports = router;
