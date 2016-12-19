'use strict';

const Flow = require('../db/models/Flow');

module.exports = {
  flow: {
    fill: ['title'],
    attach: {
      start: {
        ref: 'single',
        type: 'node',
      },
      nodes: {
        ref: 'multi',
        type: 'node',
      },
    },
    Instance: Flow,
  },
};
