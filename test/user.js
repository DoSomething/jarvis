require('./root');

const assert = require('chai').assert;
const nock = require('nock');
const User = require('../db/models/User');

describe('verify user schema', function() {
  it ('should have a profile', function() {
    const user = new User();

    assert.isDefined(user.profile, 'has profile');
    assert.isDefined(user.profile.scienceSleuthDonationCount, 'has Science Sleuth donation count');
    assert.isDefined(user.session, 'has session');
    assert.strictEqual(user.profile.scienceSleuthDonationCount['2015'], 0, 'Science Sleuth 2015 donation count equals 0');
    assert.strictEqual(user.profile.scienceSleuthDonationCount['2016'], 0, 'Science Sleuth 2015 donation count equals 0');
    assert.equal(user.protocol, 'user', 'default protocol is set to user');
  });

  it ('should have a timestamp', function() {
    const user = new User();

    return user.save().then((user) => {
      assert.isDefined(user.updatedAt, 'has updatedAt');
      assert.isDefined(user.createdAt, 'has createdAt');
    });
  });
});

describe('verify user validation', function() {
  it ('should not save an invalid protocol', function() {
    const user = new User({protocol: 'LOL THIS IS FAKE'});

    return user.save().catch((err) => {
      assert.isDefined(err, 'User validation threw an error');
    });
  });
});

describe('verify user functionality', function() {
  it ('should return a new user', function() {
    const userId = '5807ace57f43c2045904eda9';

    nock(process.env.NORTHSTAR_URI)
      .get('/v2/auth/token')
      .reply(200, {
        access_token: '12345'
      });

    nock(process.env.NORTHSTAR_URI)
      .get(`/v1/users/_id/${userId}`)
      .reply(200, {
        data: {
          _id: userId,
        }
      });

    nock(process.env.NORTHSTAR_URI)
      .post(`/v1/users/`, {
        _id: userId,
      })
      .reply(200, {
        data: {
          _id: userId,
        }
      });

    return User.findOrCreate(userId, '_id').then((user) => {
      assert.isDefined(user, 'New user returned');
      assert.equal(user._id.toString(), userId, 'User Id matches');
    });
  });

  it ('should find the user', function() {
    const userId = '5807ace57f43c2045904eda9';
    const user = new User({_id: userId});

    nock(process.env.NORTHSTAR_URI)
      .get('/v2/auth/token')
      .reply(200, {
        access_token: '12345'
      });

    nock(process.env.NORTHSTAR_URI)
      .get(`/v1/users/_id/${userId}`)
      .reply(200, {
        data: {
          _id: userId,
        }
      });

    return user.save()
    .then(() => User.findOrCreate(userId, '_id'))
    .then((user) => {
      assert.isDefined(user, 'Existing user returned');
      assert.equal(user._id.toString(), userId, 'User Id matches');
    });
  });

  it ('should return a northstar profile', function() {
    const user = new User({_id: '5807ace57f43c2045904eda9'});

    nock(process.env.NORTHSTAR_URI)
      .get('/v2/auth/token')
      .reply(200, {
        access_token: '12345'
      });

    nock(process.env.NORTHSTAR_URI)
      .get(`/v1/users/id/${user._id}`)
      .reply(200, {
        data: {
          email: 'jkent@dosomething.org',
        }
      });

    return user.getNorthstarUser().then((nsUser) => {
      assert.isDefined(nsUser.data, 'has data');
      assert.strictEqual(nsUser.data.email, 'jkent@dosomething.org', 'correct profile returned');
    });
  });
});
