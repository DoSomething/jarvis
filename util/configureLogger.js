'use strict';

const console = require('keypunch');

module.exports = () => {
  console.addHeaderFunction(() => `[pid:${process.pid}]`);
  return console;
};
