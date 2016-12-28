'use strict';

const path = require('path');
global.root = path.resolve(`${__dirname}/../`);
global.models = path.resolve(`${root}/db/models`);
global.nodes = path.resolve(`${root}/db/nodes`);
