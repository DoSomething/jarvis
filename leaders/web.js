'use strict';

const console = require('keypunch');
console.info('Web Process starting...');

const forky = require('forky');
forky({
  path: `${__dirname}/../followers/api.js`,
  workers: process.env.FORKY_CORES || require('os').cpus().length,
  enable_logging: process.env.FORKY_LOGGING === 'true',
});
