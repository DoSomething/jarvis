'use strict';

const console = require('keypunch');
console.info('Loading sockets...');

require('../util/pathHelpers');
require(`${global.root}/http/sockets`);
