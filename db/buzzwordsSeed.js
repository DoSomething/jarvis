'use strict';

require('dotenv').config();
require('./mongo');
const Promise = require('bluebird'); // eslint-disable-line no-unused-vars

const console = require('keypunch');
const Node = require('./models/Node');
const PrintNode = require('./models/NodePrint');
const ConditionalNode = require('./models/NodeConditional');
const Flow = require('./models/Flow');
const KeywordEntry = require('./models/EntryKeyword');

const conclusion = new Node({
  title: 'Buzzwords - conclusion',
  message: {
    // eslint-disable-next-line max-len
    text: 'At the end of the day, going forward, a new normal that has evolved from generation X is on the runway heading towards a streamlined cloud solution.',
  },
});

const choice2 = new PrintNode({
  title: 'Buzzwords - Choice 2',
  message: {
    // eslint-disable-next-line max-len
    text: 'Efficiently unleash cross-media information without cross-media value. (Reply NEXT)',
  },
  next: conclusion,
});

const choice1 = new PrintNode({
  title: 'Buzzwords - Choice 1',
  message: {
    // eslint-disable-next-line max-len
    text: 'Quickly maximize timely deliverables for real-time schemas. (Reply NEXT)',
  },
  next: conclusion,
});

const choices = new ConditionalNode({
  title: 'Buzzwords - The Choice',
  message: {
    // eslint-disable-next-line max-len
    text: 'MULTIMEDIA based expertise or CROSS-MEDIA growth strategies?',
  },
  testFor: 'MULTIMEDIA',
  pass: choice1,
  fail: choice2,
});

const introduction = new PrintNode({
  title: 'Buzzwords - The Introduction',
  message: {
    // eslint-disable-next-line max-len
    text: 'Leverage agile frameworks to provide a robust synopsis for high level overviews. (Reply NEXT)',
  },
  next: choices,
});

const buzzwordsFlow = new Flow({
  title: 'Buzzwords',
  nodes: [introduction, choices, choice1, choice2, conclusion],
  start: introduction,
});

const buzzwordsKeyword = new KeywordEntry({
  title: 'Buzzwords',
  keyword: 'agile',
  flow: buzzwordsFlow,
  protocol: 'user',
});

function save() {
  const models = [
    conclusion,
    choice2,
    choice1,
    choices,
    introduction,
    buzzwordsFlow,
    buzzwordsKeyword,
  ];

  models.forEach((model, index) => {
    model.save()
    .then(() => {
      if (index === models.length - 1) process.exit();
    })
    .catch((err) => {
      console.error(err);
    });
  });
}

setTimeout(save, 2000); // Give a second for DB connection.
