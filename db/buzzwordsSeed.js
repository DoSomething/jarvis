'use strict';

require('dotenv').config();

const console = require('keypunch');
require('./mongo');

const Message = require('./models/Message');
const Node = require('./models/Node');
const PrintNode = require('./models/NodePrint');
const ConditionalNode = require('./models/NodeConditional');
const Flow = require('./models/Flow');
const KeywordEntry = require('./models/EntryKeyword');

function makeMessage(text) {
  return new Message({
    response: {
      text,
    },
    platform: 'test',
    client: {
      type: 'jarvis',
      id: process.env.NODE_ENV === 'production' ? 'prod' : 'qa',
    },
  });
}

// eslint-disable-next-line max-len
const conclusionMessage = makeMessage('At the end of the day, going forward, a new normal that has evolved from generation X is on the runway heading towards a streamlined cloud solution.');
const conclusion = new Node({
  title: 'Buzzwords - conclusion',
  message: conclusionMessage,
});

// eslint-disable-next-line max-len
const choice2Message = makeMessage('Efficiently unleash cross-media information without cross-media value. (Reply NEXT)');
const choice2 = new PrintNode({
  title: 'Buzzwords - Choice 2',
  message: choice2Message,
  next: conclusion,
});

// eslint-disable-next-line max-len
const choice1Message = makeMessage('Quickly maximize timely deliverables for real-time schemas. (Reply NEXT)');
const choice1 = new PrintNode({
  title: 'Buzzwords - Choice 1',
  message: choice1Message,
  next: conclusion,
});

// eslint-disable-next-line max-len
const choicesMessage = makeMessage('MULTIMEDIA based expertise or CROSS-MEDIA growth strategies?');
const choices = new ConditionalNode({
  title: 'Buzzwords - The Choice',
  message: choicesMessage,
  testFor: 'MULTIMEDIA',
  pass: choice1,
  fail: choice2,
});

// eslint-disable-next-line max-len
const introductionMessage = makeMessage('Leverage agile frameworks to provide a robust synopsis for high level overviews. (Reply NEXT)');
const introduction = new PrintNode({
  title: 'Buzzwords - The Introduction',
  message: introductionMessage,
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
    conclusionMessage,
    conclusion,
    choice2Message,
    choice2,
    choice1Message,
    choice1,
    choicesMessage,
    choices,
    introductionMessage,
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
