'use strict';

const console = require('keypunch');
const mongo = require('../mongo');
const Node = require('./Node');
const response = require(`${global.models}/Response`);
const stathat = require(`${global.root}/lib/stathat`);
const phoenix = require(`${global.root}/lib/phoenix`);
const schema = new mongo.Schema({
  /**
   * The node that comes after the RB completion.
   */
  next: {
    type: mongo.Schema.Types.ObjectId,
    ref: 'Node',
  },

  /**
   * The message that runs if the user encounters an error.
   */
  error: response.schema,

  /**
   * Id of the campaign to RB for.
   */
  campaignId: {
    type: String,
    required: true,
  },

  /**
   * The default value of the RB `why_participated` field.
   */
  defaultParticipated: {
    type: String,
    default: 'I loved doing this campaign!',
    required: true,
  },

  /**
   * Message to ask for a photo
   */
  askForPhoto: response.schema,

  /**
   * Message to ask for a quantity
   */
  askForQuantity: response.schema,

  /**
   * Message to ask for why participated
   */
  askForWhy: response.schema,
}, {
  discriminatorKey: 'node',
  toObject: {
    virtuals: true,
  },
});

schema.virtual('continuous').get(() => false);

function getResponseForStep(step, config) {
  switch (step) {
    case 'photo': return config.askForPhoto;
    case 'quantity': return config.askForQuantity;
    case 'why': return config.askForWhy;
    default: return config.error;
  }
}

function collectField(msg, reportback, config, step) {
  const hasWhy = typeof reportback.why_participated !== 'undefined' &&
    reportback.why_participated !== config.defaultParticipated &&
    reportback.why_participated !== null;

  const rb = {
    quantity: reportback.quantity || 0,
    why_participated: reportback.why_participated || config.defaultParticipated,
  };
  let nextStep = 'photo';

  if (!step || step === 'photo') {
    if (msg.media) {
      rb.file_url = msg.media;
      nextStep = 'quantity';
    }
  } else if (step === 'quantity') {
    if (!isNaN(msg.text)) {
      rb.quantity = msg.text;

      if (hasWhy) {
        nextStep = 'complete';
      } else {
        nextStep = 'why';
      }
    }
  } else if (step === 'why') {
    if (msg.text) {
      rb.why_participated = msg.text;
      nextStep = 'complete';
    }
  }

  return {
    rb,
    step: nextStep,
  };
}

/**
 * Update the conversation pointer to the next node.
 * Create a phoenix reportback for the user.
 *
 * @param  {Message} message User message to parse.
 * @param  {Conversation} conversation conversation to modify.
 * @return {Promise}
 */
schema.methods.run = function (message, conversation) {
  stathat.count('node executed~total,reportback', 1);

  const scope = {};

  const postReportback = new Promise((resolve) => {
    conversation.user.getNorthstarUser()
    .then((nsUser) => {
      const drupalId = nsUser.data.drupal_id;
      scope.drupalId = drupalId;

      if (!conversation.user.profile.reportbacks[this.campaignId]) {
        conversation.user.profile.reportbacks[this.campaignId] = {
          id: null,
          step: 'photo',
        };
      }

      return conversation.user.profile.reportbacks[this.campaignId].id;
    })
    .then(reportbackId => phoenix.getReportback(reportbackId))
    .then((reportback) => {
      if (!reportback || (reportback.error && reportback.error.status !== 404)) {
        return resolve(this.error);
      }

      const reportbackData = reportback.data || {};
      const step = conversation.user.profile.reportbacks[this.campaignId].step;

      return collectField(message.response, reportbackData, this, step);
    })
    .then((form) => {
      const formerStep = conversation.user.profile.reportbacks[this.campaignId].step;
      const newStep = form.step;

      if (formerStep === newStep) {
        return resolve(getResponseForStep(formerStep, this));
      }

      scope.step = newStep;
      form.rb.uid = scope.drupalId;
      form.rb.nid = this.campaignId;
      form.rb.source = `jarvis-${message.platform}`;

      return phoenix.reportback(this.campaignId, form.rb);
    })
    .then((reportback) => {
      if (!reportback || reportback.error instanceof Error) {
        return resolve(this.error);
      }

      const profileMap = conversation.user.profile.reportbacks[this.campaignId];
      profileMap.id = reportback[0];
      profileMap.step = scope.step;

      conversation.user.markModified('profile.reportbacks');

      let continuousOverride = false;

      if (scope.step === 'complete') {
        profileMap.step = 'photo';
        if (this.next) {
          conversation.pointer = this.next;
          continuousOverride = true;
        }
      }

      return conversation.user.save()
      .then(() => {
        const res = getResponseForStep(profileMap.step, this);
        res.continuous = continuousOverride;
        resolve(res);
      })
      .catch(err => console.error(err));
    })
    .catch(err => console.error(err));
  });

  postReportback.catch(err => console.error(err));

  return postReportback;
};

const ReportbackNode = Node.discriminator('node-reportback', schema);

module.exports = ReportbackNode;

require(`${global.models}/User`);
