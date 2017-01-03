'use strict';

const console = require('keypunch');
const stathat = require(`${global.root}/lib/stathat`);
const northstar = require(`${global.root}/lib/northstar`);
const helpers = require(`${global.root}/util/helpers`);

const express = require('express');
const router = express.Router({ mergeParams: true });

const User = require(`${global.models}/User`);
const Message = require(`${global.models}/Message`);

/**
 * Create a Message for the given text & user.
 *
 * @param  {String} text
 * @param  {String} media
 * @param  {User} user
 * @return Promise
 */
function createMessage(text, media, user) {
  const message = new Message({
    response: {
      text,
      media,
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

  const text = req.body.text || '';
  const media = req.body.media;
  const email = req.body.email;

  if (!email) return res.status(400).send('Missing email');

  const scope = {
    user: {},
    message: {},
    platform: 'test'
  };

  User.findOrCreate(email, 'email')
  .then((user) => {
    scope.user = user;
    return createMessage(text, media, user);
  })
  .then((message) => {
    scope.message = message;
    return helpers.routeRequest(scope);
  })
  .then(message => {
    let text = helpers.deepGet('response.text', message);
    let media = helpers.deepGet('response.media', message);

    if (!text) {
      let text = '';
    }

    if (media) {
      text += `\n${media}`;
    }

    res.send(text);

    stathat.count('message sent~total,test', 1);
  })
  .catch(err => console.error(err));
});

module.exports = router;
