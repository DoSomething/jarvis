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
      request.set('accept', 'application/json');
      request.set('Content-Type', 'application/json');

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
      request.set('accept', 'application/json');
      request.set('Content-Type', 'application/json');

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
   * @param {int} drupalId
   * @param {String} campaignId
   * @param {String} source
   * @return {Promise}
   */
  signup(drupalId, campaignId, source) {
    const userData = {
      uid: parseInt(drupalId, 10),
      source,
    };

    return this.auth()
    .then(auth => this.post(`/v1/campaigns/${campaignId}/signup`, auth, userData))
    .catch(err => console.error(err));
  },

  /**
   * Get the activity for this user
   * on this campaign.
   * WARNING: This endpoint seems quite buggy on the Phoenix side.
   *
   * @param {String} drupalId
   * @param {String} campaignId
   * @return {Promise}
   */
  activity(drupalId, campaignId) {
    const url = `/v1/users/current/activity?nid=${campaignId}&uid=${drupalId}`;

    return this.auth()
    .then(auth => this.get(url, auth))
    .catch(err => console.error(err));
  },

  /**
   * Submit a RB on the given campaign
   * for this drupal user.
   *
   * See: https://github.com/DoSomething/phoenix/blob/dev/documentation/endpoints/campaigns.md#campaign-reportback
   * for RB options.
   *
   * @return {Promise}
   */
  reportback(campaignId, rb) {
    return this.auth()
    .then(auth => this.post(`/v1/campaigns/${campaignId}/reportback`, auth, rb))
    .catch(err => console.error(err));
  },

  /**
   * Get a reportback for the given
   * reportback id.
   *
   * @param {String} reportbackId
   * @return {Promise}
   */
  getReportback(reportbackId) {
    return this.get(`/v1/reportbacks/${reportbackId}`)
    .catch(err => console.error(err));
  },
};
