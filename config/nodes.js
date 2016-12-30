'use strict';

const Print = require(`${global.nodes}/Print`);
const Keyword = require(`${global.nodes}/Keyword`);
const Conditional = require(`${global.nodes}/Conditional`);
const Segment = require(`${global.nodes}/Segment`);
const Signup = require(`${global.nodes}/Signup`);

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
        name: 'next',
        description: 'Node that should run after the signup is complete',
      },
    ],
    Instance: Signup,
  },
};
