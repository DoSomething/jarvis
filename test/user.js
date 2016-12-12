require('./root');

const assert = require('chai').assert;
const User = require('../db/models/User');

describe('verify user schema', function() {
  it ('should have a profile', function() {
    const user = new User();

    assert.isDefined(user.profile, 'has profile');
    assert.isDefined(user.profile.scienceSleuthDonationCount, 'has Science Sleuth donation count');
    assert.strictEqual(user.profile.scienceSleuthDonationCount['2015'], 0, 'Science Sleuth 2015 donation count equals 0');
    assert.strictEqual(user.profile.scienceSleuthDonationCount['2016'], 0, 'Science Sleuth 2015 donation count equals 0');
  });

  it ('should have a timestamp', function() {
    const user = new User();

    return user.save().then((user) => {
      assert.isDefined(user.updatedAt, 'has updatedAt');
      assert.isDefined(user.createdAt, 'has createdAt');
    });
  });
});

describe('verify user functionality', function() {
  it ('should return a new user', function() {
    const userId = '5807ace57f43c2045904eda9';

    return User.findOrCreate(userId).then((user) => {
      assert.isDefined(user, 'New user returned');
      assert.equal(user._id.toString(), userId, 'User Id matches');
    });
  });

  it ('should find the user', function() {
    const userId = '5807ace57f43c2045904eda9';
    const user = new User({_id: userId});

    return user.save()
    .then(() => User.findOrCreate(userId))
    .then((user) => {
      assert.isDefined(user, 'Existing user returned');
      assert.equal(user._id.toString(), userId, 'User Id matches');
    });
  });

  it ('should return a northstar profile', function() {
    const user = new User({_id: '5807ace57f43c2045904eda9'});

    return user.getNorthstarUser().then((nsUser) => {
      assert.isDefined(nsUser.data, 'has data');
      assert.strictEqual(nsUser.data.email, 'jkent@dosomething.org', 'correct profile returned');
    });
  });
});