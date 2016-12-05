'use strict';

const stathat = require('stathat');
const console = require('keypunch');

const enabled = process.env.STATHAT_REPORTING === 'true';
const email = process.env.STATHAT_EMAIL;

function log(stat, value) {
  console.log('Stahat request | ', stat, value);
}

function prefixStatName(name) {
  return `jarvis ${name}`;
}

module.exports = {
  /**
   * Log a count to stathat.
   *
   * @param {string} stat - Name of the stat.
   * @param {int} count - Count to add.
   */
  count(stat, count) {
    if (!enabled) {
      log(stat, count);
      return;
    }

    stathat.trackEZCount(email, prefixStatName(stat), count);
  },

  /**
   * Log a value to stathat.
   *
   * @param {string} stat - Name of the stat.
   * @param {string} value - value to count.
   */
  value(stat, value) {
    if (!enabled) {
      log(stat, value);
      return;
    }

    stathat.trackEZValue(email, prefixStatName(stat), value);
  },
};
