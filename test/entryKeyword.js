require('./root');

const assert = require('chai').assert;
const Node = require('../db/models/Node');
const Flow = require('../db/models/Flow');
const KeywordEntry = require('../db/models/EntryKeyword');

describe('verify entry keyword schema', function() {
  it ('should have a title, keyword & flow', function() {
    const testNode = new Node({title: 'Test node', message: 'hi'});
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
    const testNode = new Node({title: 'Test node', message: 'hi'});
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
});

describe('verify entry keyword functionality', function() {
  it ('should find the proper keyword', function() {
    const testNode = new Node({title: 'Test node', message: 'hi'});
    const testFlow = new Flow({
      title: 'Test flow',
      start: testNode,
      nodes: [testNode]
    });

    const entry = new KeywordEntry({title: 'Test entry', flow: testFlow, keyword: 'test'});

    return testFlow.save()
    .then(entry.save)
    .then(() => KeywordEntry.findByKeyword('test'))
    .then((en) => {
      assert.isObject(en.flow, 'Entry Flow is defined');
      assert.isString(en.flow.title, 'Entry Flow title is defined');
      assert.equal(en.flow.title, testFlow.title, 'Entry flow title matches');
    });
  });
});
