'use strict';

const console = require('keypunch');
const mongo = require('../mongo');
const Node = require('./Node');
const stathat = require(`${global.root}/lib/stathat`);
const phoenix = require(`${global.root}/lib/phoenix`);

const schema = new mongo.Schema({
  /**
   * The node that comes after signup.
   */
  complete: {
    type: mongo.Schema.Types.ObjectId,
    ref: 'Node',
  },

  /**
   * The node that comes next if the
   * user is already signed up.
   */
  exists: {
    type: mongo.Schema.Types.ObjectId,
    ref: 'Node',
  },

  /**
   * If we encounter an error while making the signup,
   * go to this node.
   */
  error: {
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
 * Create a Phoenix signup for the user.
 *
 * @param  {Message} message User message to parse.
 * @param  {Conversation} conversation conversation to modify.
 * @return {Promise}
 */
schema.methods.run = function (message, conversation) {
  stathat.count('node executed~total,signup', 1);
  const scope = {};

  const postSignup = new Promise((resolve) => {
    conversation.user.getNorthstarUser()
    .then((nsUser) => {
      const drupalId = nsUser.data.drupal_id;
      scope.drupalId = drupalId;

      return phoenix.activity(drupalId, this.campaignId, `jarvis-${message.platform}`);
    })
    .then((activity) => {
      if (!activity || activity instanceof Error) return this.error;
      if (activity.signed_up) return this.exists;

      return phoenix.signup(scope.drupal_id, this.campaignId)
      .then((signup) => {
        if (signup &&
          Array.isArray(signup) &&
          signup[0] !== false) return this.complete;

        return this.error;
      });
    })
    .then((pointer) => {
      if (pointer) conversation.pointer = pointer;
      resolve();
    });
  });

  postSignup.catch(err => console.error(err));

  return postSignup;
};

const SignupNode = Node.discriminator('node-signup', schema);

module.exports = SignupNode;
