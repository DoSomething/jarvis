'use strict';

const Node = require(`${global.nodes}/Node`);
const Print = require(`${global.nodes}/Print`);

/**
 * Default submission handler.
 * Retun the given input unmodified.
 * @param  {String} input
 * @return {String}
 */
const defaultSubmit = input => input;

/**
 * Convert the comma seperated string to an array.
 * @param  {String} input
 * @return {Array}
 */
const convertStringToArray = input => input.split(',');

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
        description: 'Comma seperated links to images to send',
        onSubmit: convertStringToArray,
        parent: 'output',
      },
    ],
    attach: [
      {
        name: 'next',
        description: 'Node that comes next',
        typeOf: Node,
      },
    ],
    Instance: Print,
  },
};
