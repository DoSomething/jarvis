'use strict';

const console = require('keypunch');
const superagent = require('superagent');

const uri = process.env.NORTHSTAR_URI;
const clientId = process.env.NORTHSTAR_CLIENT_ID;
const clientSecret = process.env.NORTHSTAR_CLIENT_SECRET;
const authHeader = 'Authorization';

module.exports = {
  /**
   * Make a GET request to Gambit Groups API.
   * Handles authentication & URL formation.
   * @param {String} path  API Path. eg: /group
   * @param {String} token API token.
   * @return {Promise}
   */
  get(path, token) {
    console.log('Making northstar GET request', path);

    const authToken = `Bearer ${token}`;
    return superagent.get(`${uri}${path}`)
      .set(authHeader, authToken)
      .then(res => res.body)
      .catch(console.error);
  },

  /**
   * Make a post request to Gambit Groups API.
   * Handles authentication & URL formation.
   * @param {String} path  API Path. eg: /group
   * @param {String} token API token.
   * @param {object} data  JSON data to send.
   * @return {Promise}
   */
  post(path, token, data) {
    console.log('Making northstar POST request', path);

    const authToken = `Bearer ${token}`;
    return superagent.post(`${uri}${path}`)
      .send(data)
      .set(authHeader, authToken)
      .then(res => res.body)
      .catch(console.error);
  },

  /**
   * Authenticate with Northstar and get an access token.
   * @return {String}
   */
  auth() {
    return this.post('/v2/auth/token', '', {
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'admin',
    })
    .then(res => res.access_token);
  },

  /**
   * Find a user for the given id type & value.
   * @param {String} type Type of id to query by.
   * @param {String} value The id to query for.
   * @return {Promise}
   */
  findUser(type, value) {
    return this.auth().then(token => this.get(`/v1/users/${type}/${value}`, token));
  },

  /**
   * Find a user for the given Northstar id.
   * @param {String} id Northstar id to search for.
   * @return {Promise}
   */
  findUserByNorthstarId(id) {
    return this.findUser('id', id);
  },

  /**
   * Find a user for the given phone number
   * @param {String} mobile Mobile to search for.
   * @return {Promise}
   */
  findUserByMobile(mobile) {
    return this.findUser('mobile', mobile);
  },
};
