'use strict';

const Promise = require('bluebird'); // eslint-disable-line no-unused-vars
const mongo = require('../mongo');
const Node = require('./Node');
const stathat = require('../../lib/stathat');
const helpers = require('../../util/helpers');
const admin = require('../../config/admin');

const schema = new mongo.Schema({
  /**
   * If there is no node type selected.
   */
  requiresType: {
    type: mongo.Schema.Types.ObjectId,
    ref: 'Node',
    required: true,
  },

  /**
   * If there are fields missing.
   */
  requiresInput: {
    type: mongo.Schema.Types.ObjectId,
    ref: 'Node',
    required: true,
  },

  /**
   * If everything is complete.
   */
  next: {
    type: mongo.Schema.Types.ObjectId,
    ref: 'Node',
    required: true,
  },
}, {
  discriminatorKey: 'node',
});

/**
 * Update the conversation pointer to the next node.
 *
 * @param  {Message} message User message to parse.
 * @param  {Conversation} conversation conversation to modify.
 * @return {Promise}
 */
schema.methods.run = function (message, conversation) {
  stathat.count('node executed~total,admin create');

  const type = helpers.deepGet('session.adminCreate.type', conversation);
  const fields = helpers.deepGet('session.adminCreate.fields', conversation);

  return new Promise((resolve) => {
    if (!type) {
      conversation.session.select = {};
      conversation.session.select.items = Object.keys(admin);
      conversation.session.select.fill = 'session.adminCreate.type';
      conversation.pointer = this.requiresType;
      resolve(conversation);
    } else if (!fields) {
      conversation.session.form = {};
      conversation.session.form.type = type;
      conversation.session.form.fill = 'session.adminCreate.fields';
      conversation.pointer = this.requiresInput;
      resolve(conversation);
    } else {
      const model = new admin[type].Instance(fields);
      conversation.pointer = this.next;
      model.save().then(() => resolve(conversation));
    }
  });
};

const AdminCreateNode = Node.discriminator('node-admin-create', schema);

module.exports = AdminCreateNode;
