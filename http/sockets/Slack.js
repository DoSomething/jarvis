'use strict';

const console = require('keypunch');
const stathat = require(`${global.root}/lib/stathat`);
const slack = require(`${global.root}/lib/slack`);
const helpers = require(`${global.root}/util/helpers`);

const User = require(`${global.models}/User`);
const Message = require(`${global.models}/Message`);
const Response = require(`${global.models}/Response`).model;

const Slack = require('@slack/client');
const RtmClient = Slack.RtmClient;
const events = Slack.CLIENT_EVENTS;
const rtm = new RtmClient(process.env.SLACK_API_TOKEN);

function extractSlackMessage(msg) {
  let text = msg.text;
  let media = '';

  if (msg.subtype && msg.subtype === 'file_share') {
    text = msg.file.initial_comment ? msg.file.initial_comment.comment : '';
    media = msg.file.permalink_public;
  }

  return new Response({
    text,
    media,
  });
}

/**
 * Create a Message from the given Slack msg & Jarvis User.
 * @param  {Object} msg  RTM message from Slack
 * @param  {User} user
 * @return {Promise}
 */
function createMessage(msg, user) {
  const response = extractSlackMessage(msg);
  const message = new Message({
    response,
    platform: 'slack',
    client: {
      type: 'user',
      id: user._id,
    },
  });

  return message.lowercaseResponse();
}

rtm.on(events.RTM.AUTHENTICATED, (data) => {
  if (data.ok) console.info(`Authenticated as ${data.self.name} in team ${data.team.name}`);
  else console.error('Slack auth failed');
});

rtm.on('message', (msg) => {
  stathat.count('message recieved~total,slack', 1);

  if (msg.type !== 'message') return;

  const scope = {
    platform: 'slack',
  };

  slack.getInfo(msg.user)
  .then(info => info.user.profile.email)
  .then(email => User.findOrCreate(email, 'email'))
  .then(user => {
    scope.user = user;
    return createMessage(msg, user);
  })
  .then((message) => {
    scope.message = message;
    return helpers.routeRequest(scope);
  })
  .then(message => slack.sendMessage(message, msg.channel))
  // .catch(err => console.error(err));
});

rtm.start();
