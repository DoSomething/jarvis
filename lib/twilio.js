'use strict';

const console = require('keypunch');
const twilio = require('twilio');
const client = new twilio.RestClient(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const northstar = require('./Northstar');

const middleware = twilio.webhook(process.env.TWILIO_AUTH_TOKEN);

/**
 * Send a message to the Twilio API for the given
 * body & mobile number.
 * @param  {String} mobile
 * @param  {Stribg} body
 * @return {Promise}
 */
function sendSms(mobile, body) {
  return new Promise((resolve, reject) => {
    client.messages.create({
      body,
      from: process.env.TWILIO_NUMBER,
      to: `+1${mobile}`,
    }, function(err, message) {
      if (err) {
        console.error(err);
        reject();
      }
      else {
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
    return user.getNorthstarUser()
    .then(nsUser => nsUser.data.mobile)
    .then(mobile => sendSms(mobile, message.response.text));
  }
}
