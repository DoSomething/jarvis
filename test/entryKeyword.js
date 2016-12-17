require('./root');

const assert = require('chai').assert;
const Node = require('../db/models/Node');
const Flow = require('../db/models/Flow');
const KeywordEntry = require('../db/models/EntryKeyword');

describe('verify entry keyword schema', function() {
  it ('should have a title, keyword & flow', function() {
    const testNode = new Node({title: 'Test node', message: {text: 'test'}});
    const testFlow = new Flow({
      title: 'Test flow',
      start: testNode,
      nodes: [testNode]
    });

    const entry = new KeywordEntry({title: 'Test entry', flow: testFlow, keyword: 'test'});

    assert.isString(entry.title, 'has title');
    assert.isString(entry.keyword, 'has keyword');
    assert.equal(entry.keyword, entry.keyword.toLowerCase(), 'keyword is lowercase');
    assert.isDefined(entry.flow, 'has flow');
  });
});

describe('verify entry keyword validation', function() {
  it ('should not save an entry missing a keyword', function() {
    const testNode = new Node({title: 'Test node', message: {text: 'test'}});
    const testFlow = new Flow({
      title: 'Test flow',
      start: testNode,
      nodes: [testNode]
    });
    const entry = new KeywordEntry({title: 'Test entry', flow: testFlow});

    return entry.save().catch((err) => {
      assert.isDefined(err, 'Keyword validation threw an error');
    });
  });

  it ('should not save an entry using an invliad protocol', function() {
    const testNode = new Node({title: 'Test node', message: {text: 'test'}});
    const testFlow = new Flow({
      title: 'Test flow',
      start: testNode,
      nodes: [testNode]
    });
    const entry = new KeywordEntry({title: 'Test entry', flow: testFlow, keyword: 'test', protocol: 'LOL THIS IS FAKE'});

    return entry.save().catch((err) => {
      assert.isDefined(err, 'Keyword validation threw an error');
    });
  });

  it ('should save the same keyword for two different protocols', function() {
    const testNode = new Node({title: 'Test node', message: {text: 'test'}});
    const testFlow = new Flow({
      title: 'Test flow',
      start: testNode,
      nodes: [testNode]
    });
    const entry1 = new KeywordEntry({title: 'Test entry', flow: testFlow, keyword: 'test'});
    const entry2 = new KeywordEntry({title: 'Test entry', flow: testFlow, keyword: 'test', protocol: 'admin'});

    return entry1.save().then(entry2.save)
    .then((entry) => {
      assert.isDefined(entry, 'Keyword validation passed');
    })
    .catch((err) => {
      assert.isUndefined(err, 'Keyword validation passed');
    })
  });

  it ('should not save the same keyword for the same protocols', function() {
    const testNode = new Node({title: 'Test node', message: {text: 'test'}});
    const testFlow = new Flow({
      title: 'Test flow',
      start: testNode,
      nodes: [testNode]
    });
    const entry1 = new KeywordEntry({title: 'Test entry', flow: testFlow, keyword: 'test'});
    const entry2 = new KeywordEntry({title: 'Test entry', flow: testFlow, keyword: 'test'});

    return entry1.save().then(entry2.save)
    .then((entry) => {
      assert.isUndefined(entry, 'Keyword validation failed');
    })
    .catch((err) => {
      assert.isDefined(err, 'Keyword validation failed');
    })
  });
});

describe('verify entry keyword functionality', function() {
  it ('should find the proper keyword', function() {
    const testNode = new Node({title: 'Test node', message: {text: 'test'}});
    const testFlow = new Flow({
      title: 'Test flow',
      start: testNode,
      nodes: [testNode]
    });

    const entry = new KeywordEntry({title: 'Test entry', flow: testFlow, keyword: 'test'});

    return testFlow.save()
    .then(entry.save)
    .then(() => KeywordEntry.findByKeyword('test', 'user'))
    .then((en) => {
      assert.isObject(en.flow, 'Entry Flow is defined');
      assert.isString(en.flow.title, 'Entry Flow title is defined');
      assert.equal(en.flow.title, testFlow.title, 'Entry flow title matches');
    });
  });
});
