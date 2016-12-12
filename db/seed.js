'use strict';

require('dotenv').config();

const console = require('keypunch');
require('./mongo');

const Node = require('./models/Node');
const PrintNode = require('./models/NodePrint');
const ConditionalNode = require('./models/NodeConditional');
const Flow = require('./models/Flow');
const KeywordEntry = require('./models/EntryKeyword');

const conclusion = new Node({
  title: 'Buzzwords - conclusion',
  // eslint-disable-next-line max-len
  message: 'At the end of the day, going forward, a new normal that has evolved from generation X is on the runway heading towards a streamlined cloud solution.',
});

const choice2 = new PrintNode({
  title: 'Buzzwords - Choice 2',
  message: 'Efficiently unleash cross-media information without cross-media value. (Reply NEXT)',
  next: conclusion,
});

const choice1 = new PrintNode({
  title: 'Buzzwords - Choice 1',
  message: 'Quickly maximize timely deliverables for real-time schemas. (Reply NEXT)',
  next: conclusion,
});

const choices = new ConditionalNode({
  title: 'Buzzwords - The Choice',
  message: 'MULTIMEDIA based expertise or CROSS-MEDIA growth strategies?',
  testFor: 'MULTIMEDIA',
  pass: choice1,
  fail: choice2,
});

const introduction = new PrintNode({
  title: 'Buzzwords - The Introduction',
  // eslint-disable-next-line max-len
  message: 'Leverage agile frameworks to provide a robust synopsis for high level overviews. (Reply NEXT)',
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
});

function save() {
  const seed = new Promise((resolve) => {
    conclusion.save()
    .then(choice2.save)
    .then(choice1.save)
    .then(choices.save)
    .then(introduction.save)
    .then(buzzwordsFlow.save)
    .then(buzzwordsKeyword.save)
    .then(resolve);
  });

  seed.then(() => {
    console.info('Seed finished.');
  })
  .then(process.exit)
  .catch(console.err);
}

setTimeout(save, 2000); // Give a second for DB connection.
