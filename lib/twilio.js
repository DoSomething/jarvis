'use strict';

const console = require('keypunch');
const stathat = require('./stathat');
const Promise = require('bluebird'); // eslint-disable-line no-unused-vars
const twilio = require('twilio');
const client = new twilio.RestClient(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * Send a message to the Twilio API for the given
 * body & mobile number.
 * @param  {String} mobile
 * @param  {Response} response
 * @return {Promise}
 */
function sendSms(mobile, response) {
  const twilioConfig = {
    from: process.env.TWILIO_NUMBER,
    to: `+1${mobile}`,
  };

  if (response.media) twilioConfig.mediaUrl = response.media;
  if (response.text) twilioConfig.body = response.text;

  return new Promise((resolve, reject) => {
    client.messages.create(twilioConfig, (err, message) => {
      if (err) {
        console.error(err);
        reject();
      } else {
        resolve();
      }
    });
  });
}

module.exports = {
  /**
   * Send a message to the given user.
   *
   * @param {Message} message
   * @param {User} user
   * @return {Promise}
   */
  sendMessage(message, user) {
    stathat.count('message sent~total,twilio', 1);
    return user.getNorthstarUser()
    .then(nsUser => nsUser.data.mobile)
    .then(mobile => sendSms(mobile, message.response));
  },

  middleware: twilio.webhook(process.env.TWILIO_AUTH_TOKEN),
};
