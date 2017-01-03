'use strict';

const Print = require(`${global.nodes}/Print`);
const Keyword = require(`${global.nodes}/Keyword`);
const Conditional = require(`${global.nodes}/Conditional`);
const Segment = require(`${global.nodes}/Segment`);
const Signup = require(`${global.nodes}/Signup`);
const Reportback = require(`${global.nodes}/Reportback`);

/**
 * Default submission handler.
 * Retun the given input unmodified.
 *
 * Originally there were other submission handlers,
 * however over the course of refactoring they were no longer needed.
 * I kept this here anyway in the event we do complex input again.
 *
 * @param  {String} input
 * @return {String}
 */
const defaultSubmit = input => input;

module.exports = {
  print: {
    fill: [
      {
        name: 'title',
        description: 'A descriptive name of this node',
        onSubmit: defaultSubmit,
      },
      {
        name: 'text',
        description: 'Text to print to the user',
        onSubmit: defaultSubmit,
        parent: 'output',
      },
      {
        name: 'media',
        description: 'Link of an image to send',
        onSubmit: defaultSubmit,
        parent: 'output',
      },
    ],
    attach: [
      {
        name: 'next',
        description: 'Node that comes next',
      },
    ],
    Instance: Print,
  },
  keyword: {
    fill: [
      {
        name: 'title',
        description: 'A descriptive name of this node',
        onSubmit: defaultSubmit,
      },
      {
        name: 'keyword',
        description: 'What is the actual keyword?',
        onSubmit: defaultSubmit,
      },
    ],
    attach: [
      {
        name: 'start',
        description: 'What node should this keyword goto?',
      },
    ],
    Instance: Keyword,
  },
  conditional: {
    fill: [
      {
        name: 'title',
        description: 'A descriptive name of this node',
        onSubmit: defaultSubmit,
      },
      {
        name: 'testFor',
        description: 'What sequence of characters or words should we compare for?',
        onSubmit: defaultSubmit,
      },
    ],
    attach: [
      {
        name: 'pass',
        description: 'If the user sends the correct message, go to...',
      },
      {
        name: 'fail',
        description: 'If the user sends the wrong message, go to...',
      },
    ],
    Instance: Conditional,
  },
  segment: {
    fill: [
      {
        name: 'title',
        description: 'A descriptive name of this node',
        onSubmit: defaultSubmit,
      },
      {
        name: 'segmentName',
        description: 'What is the name of the segment to give this user?',
        onSubmit: defaultSubmit,
      },
    ],
    attach: [
      {
        name: 'next',
        description: 'Node that should run after the segment is applied',
      },
    ],
    Instance: Segment,
  },
  signup: {
    fill: [
      {
        name: 'title',
        description: 'A descriptive name of this node',
        onSubmit: defaultSubmit,
      },
      {
        name: 'campaignId',
        description: 'What is the ID of this campaign?',
        onSubmit: defaultSubmit,
      },
    ],
    attach: [
      {
        name: 'complete',
        description: 'Node that should run after the signup is complete',
      },
      {
        name: 'exists',
        description: 'Node that should run if the user already has a signup',
      },
      {
        name: 'error',
        description: 'Node that should run if the system encounters an error',
      },
    ],
    Instance: Signup,
  },
  reportback: {
    fill: [
      {
        name: 'title',
        description: 'A descriptive name of this node',
        onSubmit: defaultSubmit,
      },
      {
        name: 'campaignId',
        description: 'What is the ID of this campaign?',
        onSubmit: defaultSubmit,
      },
      {
        name: 'defaultParticipated',
        description: 'Default "why participated". eg: "I loved doing this campaign!"',
        onSubmit: defaultSubmit,
      },
      {
        name: 'text',
        description: 'Text to ask for a photo',
        parent: 'askForPhoto',
        onSubmit: defaultSubmit,
      },
      {
        name: 'text',
        description: 'Text to ask for the quantity',
        parent: 'askForQuantity',
        onSubmit: defaultSubmit,
      },
      {
        name: 'text',
        description: 'Text to ask for the why participated',
        parent: 'askForWhy',
        onSubmit: defaultSubmit,
      },
      {
        name: 'text',
        description: 'Text for when the user encounters an error',
        parent: 'error',
        onSubmit: defaultSubmit,
      },
    ],
    attach: [
      {
        name: 'next',
        description: 'Node that should run after the reportback is complete',
      },
    ],
    Instance: Reportback,
  },
};
