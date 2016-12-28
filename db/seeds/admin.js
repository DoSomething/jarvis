'use strict';

const Keyword = require(`${global.nodes}/Keyword`);
const AdminCreate = require(`${global.nodes}/AdminCreate`);
const AdminLink = require(`${global.nodes}/AdminLink`);
const AdminProtocol = require(`${global.nodes}/AdminProtocol`);
const AdminEdit = require(`${global.nodes}/AdminEdit`);
const AdminDelete = require(`${global.nodes}/AdminDelete`);
const AdminShow = require(`${global.nodes}/AdminShow`);
const Print = require(`${global.nodes}/Print`);
const protocolHelpers = require(`${global.root}/util/seedHelpers`);

module.exports = {
  seed: () => {
    const help = new Print({
      title: 'Admin help text',
      output: {
        text: '_Available commands..._ help, create, link',
      },
    });

    const helpKeyword = new Keyword({
      title: 'Admin help keyword',
      keyword: 'help',
      protocol: 'admin',
      start: help,
    });

    const create = new AdminCreate({
      title: 'Admin create',
    });

    const createKeyword = new Keyword({
      title: 'Admin create keyword',
      keyword: 'create',
      protocol: 'admin',
      start: create,
    });

    const link = new AdminLink({
      title: 'Admin link',
    });

    const linkKeyword = new Keyword({
      title: 'Admin link keyword',
      keyword: 'link',
      protocol: 'admin',
      start: link,
    });

    const protocol = new AdminProtocol({
      title: 'Admin protocol',
    });

    const protocolUserKeyword = new Keyword({
      title: 'User protocol keyword',
      keyword: 'change jarvis protocol',
      protocol: 'user',
      start: protocol,
    });

    const protocolAdminKeyword = new Keyword({
      title: 'Admin protocol keyword',
      keyword: 'change jarvis protocol',
      protocol: 'admin',
      start: protocol,
    });

    const edit = new AdminEdit({
      title: 'Admin Edit',
    });

    const editKeyword = new Keyword({
      title: 'Admin Edit Keyword',
      keyword: 'edit',
      protocol: 'admin',
      start: edit,
    });

    // delete is a reserved JS word
    const deleteNode = new AdminDelete({
      title: 'Admin delete',
    });

    const deleteKeyword = new Keyword({
      title: 'Admin delete keyword',
      keyword: 'delete',
      protocol: 'admin',
      start: deleteNode,
    })

    const show = new AdminShow({
      title: 'Admin show',
    });

    const showKeyword = new Keyword({
      title: 'Admin show keyword',
      keyword: 'show',
      protocol: 'admin',
      start: show,
    });

    return [
      help,
      helpKeyword,
      create,
      createKeyword,
      link,
      linkKeyword,
      protocol,
      protocolUserKeyword,
      protocolAdminKeyword,
      edit,
      editKeyword,
      deleteNode,
      deleteKeyword,
      show,
      showKeyword,
    ];
  },

  preSeed: (done) => {
    protocolHelpers.retireOldProtocolKeywords(
      'help',
      'admin')
    .then(() => protocolHelpers.retireOldProtocolKeywords(
      'link',
      'admin'
    ))
    .then(() => protocolHelpers.retireOldProtocolKeywords(
      'edit',
      'admin'
    ))
    .then(() => protocolHelpers.retireOldProtocolKeywords(
      'delete',
      'admin'
    ))
    .then(() => protocolHelpers.retireOldProtocolKeywords(
      'show',
      'admin'
    ))
    .then(() => protocolHelpers.retireOldProtocolKeywords(
      'change jarvis protocol',
      'admin'
    ))
    .then(() => protocolHelpers.retireOldProtocolKeywords(
      'change jarvis protocol',
      'user'
    ))
    .then(() => protocolHelpers.retireOldProtocolKeywords(
      'create',
      'admin',
      done));
  },
};
