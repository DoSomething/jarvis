'use strict';

const console = require('keypunch');
const Keyword = require(`${global.entries}/Keyword`);
const Protocol = require(`${global.nodes}/Protocol`);
const Print = require(`${global.nodes}/Print`);
const protocolHelpers = require(`${global.root}/util/seedHelpers`);

const changeProtocolString = 'change protocol';

module.exports = {
  seed: () => {
    const protocolSuccess = new Print({
      output: {
        text: 'You\'ve changed protocols',
      },
      title: 'Protocol change success',
    });

    const protocolFail = new Print({
      output: {
        text: 'You\'ve failed to changed protocol',
      },
      title: 'Protocol change failure',
    });

    const protocolChange = new Protocol({
      success: protocolSuccess,
      failed: protocolFail,
      title: 'Protocol change',
    });

    const protocolGreeting = new Print({
      output: {
        text: 'Please enter a protocol',
      },
      next: protocolChange,
      title: 'Protocol change greeting',
    });

    const userKeyword = new Keyword({
      keyword: changeProtocolString,
      protocol: 'user',
      title: 'User protocol keyword',
      start: protocolGreeting,
    });

    const adminKeyword = new Keyword({
      keyword: changeProtocolString,
      protocol: 'admin',
      title: 'Admin protocol keyword',
      start: protocolGreeting,
    });

    return [
      protocolSuccess,
      protocolFail,
      protocolChange,
      protocolGreeting,
      userKeyword,
      adminKeyword,
    ];
  },

  preSeed: (done) => {
    protocolHelpers.retireOldProtocolKeywords(
      changeProtocolString,
      'user')
    .then(() => protocolHelpers.retireOldProtocolKeywords(
      changeProtocolString,
      'admin',
      done));
  },
}
