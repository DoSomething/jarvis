'use strict';

const console = require('keypunch');
const stathat = require('./stathat');
const slack = require('@slack/client');
const WebClient = slack.WebClient;

const botClient = new WebClient(process.env.SLACK_API_TOKEN);

module.exports = {
  /**
   * Get a Northstar users Slack ID
   * @param {User} user
   * @return {Promise}
   */
  getSlackId(user) {
    user.getNorthstarUser()
    .then(nsUser => nsUser.data.slack_id)
    .catch(err => console.error(err));
  },

  /**
   * Get a Slack profile for this slack user id.
   * @param {String} slackUserId
   * @return {Promise}
   */
  getInfo(slackUserId) {
    return new Promise((resolve) => {
      botClient.users.info(slackUserId, (err, info) => {
        if (err) console.error(err);
        else resolve(info);
      });
    }).catch(err => console.error(err));
  },

  /**
   * Send a message to the given user.
   *
   * @param {Message} message
   * @param {String} slackChannel
   * @return {Promise}
   */
  sendMessage(message, slackChannel) {
    stathat.count('message sent~total,slack', 1);

    return new Promise((resolve) => {
      const slackMsg = message.response.text + message.response.media;

      botClient.chat.postMessage(slackChannel, slackMsg, {
        username: 'jarvis',
        icon_url: 'https://static.dosomething.org/jarvis/jarvis.jpg',
      }, (err) => {
        if (err) console.error(err);
      });
    });
  }
}
