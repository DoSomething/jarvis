require('./root');

const assert = require('chai').assert;
const Segment = require('../db/models/Segment');
const User = require('../db/models/User');

describe('verify segment schema', function() {
  it ('should have a user & name', function() {
    const user = new User();
    const segment = new Segment({
      user,
      name: 'Test Segment'
    });

    assert.isString(segment.name, 'has name');
    assert.isDefined(segment.user, 'has a user');
  });

  it ('should have a timestamp', function() {
    const user = new User();
    const segment = new Segment({
      user,
      name: 'Test Segment'
    });

    return segment.save().then((seg) => {
      assert.isUndefined(seg.updatedAt, 'does not have updatedAt');
      assert.isDefined(seg.createdAt, 'has createdAt');
    });
  });
});

describe('verify segment validation', function() {
  it ('should not save a segment missing user', function() {
    const segment = new Segment({
      name: 'A test segment',
    });

    return segment.save().catch((err) => {
      assert.isDefined(err, 'Segment validation threw an error');
    });
  });
});
