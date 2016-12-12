const console = require('keypunch');
const helpers = require('../../util/helpers');

const express = require('express');
const router = express.Router({ mergeParams: true });

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
  const northstarId = req.body.northstar_id;
  const text = req.body.text;

  if (!northstarId) return res.status(400).send('Missing Northstar Id');
  if (!text) return res.status(400).send('Missing text');

  const scope = {
    user: {},
    message: {},
    platform: 'test'
  };

  User.findOrCreate(northstarId)
  .then(user => {
    scope.user = user;
    return createMessage(text, user);
  })
  .then((message) => {
    scope.message = message;
    return helpers.routeRequest(scope);
  })
  .then(message => res.send(message.response.text))
  .catch(console.error);
});

module.exports = router;
