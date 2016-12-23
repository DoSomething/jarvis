'use strict';

const console = require('keypunch');
const Keyword = require(`${global.entries}/Keyword`);
const AdminCreate = require(`${global.nodes}/AdminCreate`);
const Print = require(`${global.nodes}/Print`);
const protocolHelpers = require(`${global.root}/util/seedHelpers`);

module.exports = {
  seed: () => {
    const help = new Print({
      title: 'Admin help text',
      output: {
        text: '_Available commands..._ help, create',
      },
    });

    const helpKeyword = new Keyword({
      title: 'Admin help',
      keyword: 'help',
      protocol: 'admin',
      start: help,
    });

    const create = new AdminCreate({
      title: 'Admin create',
    });

    const createKeyword = new Keyword({
      title: 'Admin create',
      keyword: 'create',
      protocol: 'admin',
      start: create,
    });

    return [
      help,
      helpKeyword,
      create,
      createKeyword,
    ];
  },

  preSeed: (done) => {
    protocolHelpers.retireOldProtocolKeywords(
      'help',
      'admin')
    .then(() => protocolHelpers.retireOldProtocolKeywords(
      'create',
      'admin',
      done));
  },
}
