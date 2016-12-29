'use strict';

const console = require('keypunch');
const superagent = require('superagent');

const uri = process.env.PHOENIX_URI;
const username = process.env.PHOENIX_USERNAME;
const password = process.env.PHOENIX_PASSWORD;

class Auth {
  /**
   * Container for Phoenix auth response.
   *
   * @param {String} token
   * @param {String} sessionId
   * @param {String} sessionName
   */
  constructor(token, sessionId, sessionName) {
    this.token = token;
    this.session = {
      id: sessionId,
      name: sessionName,
    };
  }

  /**
   * Get the formatted cookie string
   * @return {String}
   */
  getCookie() {
    return `${this.session.name}=${this.session.id}`;
  }
}

module.exports = {
  /**
   * Make a GET request to Phoenix.
   * Handles authentication & URL formation.
   * @param {String} path  API Path. eg: /group
   * @param {Auth}   auth
   * @return {Promise}
   */
  get(path, auth) {
    console.log('Making phoenix GET request', path);

    return new Promise((resolve) => {
      const request = superagent.get(`${uri}${path}`);

      if (auth) {
        request.set('X-CSRF-Token', auth.token);
        request.set('Cookie', auth.getCookie());
      }

      request
        .then(res => resolve(res.body))
        .catch(error => resolve({ error }));
    });
  },

  /**
   * Make a post request to Phoenix.
   * Handles authentication & URL formation.
   * @param {String} path  API Path. eg: /group
   * @param {Auth}   auth
   * @param {object} data  JSON data to send.
   * @return {Promise}
   */
  post(path, auth, data) {
    console.log('Making phoenix POST request', path);

    return new Promise((resolve) => {
      const request = superagent.post(`${uri}${path}`);

      if (auth) {
        request.set('X-CSRF-Token', auth.token);
        request.set('Cookie', auth.getCookie());
      }

      if (data) {
        request.send(data);
      }

      request
        .then(res => resolve(res.body))
        .catch(error => resolve({ error }));
    });
  },

  /**
   * Authenticate with Phoenix and get an access token.
   * @return {Auth}
   */
  auth() {
    return this.post('/v1/auth/login', '', {
      username,
      password,
    })
    .then((res) => new Auth(
      res.token,
      res.sessid,
      res.session_name
    ))
    .catch(err => console.error(err));
  },

  /**
   * Create a signup on the given campaign
   * for this drupal user.
   *
   * @param {String} drupalId
   * @param {String} campaignId
   * @return {Promise}
   */
  signup(drupalId, campaignId) {
    const userData = {
      uid: drupalId,
      source: 'jarvis',
    };

    return this.auth()
    .then(auth => this.post(`/v1/campaigns/${campaignId}/signup`, auth, userData))
    .catch(err => console.error(err));
  },
};
