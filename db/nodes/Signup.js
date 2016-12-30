'use strict';

const console = require('keypunch');
const mongo = require('../mongo');
const Node = require('./Node');
const stathat = require(`${global.root}/lib/stathat`);
const phoenix = require(`${global.root}/lib/phoenix`);

const schema = new mongo.Schema({
  /**
   * The node that always comes next.
   */
  next: {
    type: mongo.Schema.Types.ObjectId,
    ref: 'Node',
  },

  /**
   * Id of the campaign to signup for.
   */
  campaignId: {
    type: String,
    required: true,
  },
}, {
  discriminatorKey: 'node',
  toObject: {
    virtuals: true,
  },
});

schema.virtual('continuous').get(() => true);

/**
 * Update the conversation pointer to the next node.
 * Creates a segment for the given user & this nodes
 * segment name.
 *
 * @param  {Message} message User message to parse.
 * @param  {Conversation} conversation conversation to modify.
 * @return {Promise}
 */
schema.methods.run = function (message, conversation) {
  stathat.count('node executed~total,signup', 1);
  const postSignup = new Promise((resolve) => {
    if (this.next) conversation.pointer = this.next;

    conversation.user.getNorthstarUser()
    .then(nsUser => phoenix.signup(nsUser.drupal_id, this.campaignId))
    .then(() => resolve());
  });

  postSignup.catch(err => console.error(err));

  return postSignup;
};

const SignupNode = Node.discriminator('node-signup', schema);

module.exports = SignupNode;
