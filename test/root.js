require('dotenv').config();

if (process.env.MONGODB_TEST_URI) process.env.MONGODB_URI = process.env.MONGODB_TEST_URI;

process.env.LOG_LEVEL = 4;

require('../util/pathHelpers');

const mongo = require(`${global.root}/db/mongo`);
const nock = require('nock');

function dropDatabase(done) {
  mongo.mongoose.connection.db.dropDatabase(done);
}

before(function(done) {
  nock.disableNetConnect();
  done();
});

beforeEach(function(done) {
  dropDatabase(done);
});

afterEach(function(done) {
  nock.cleanAll();
  done();
});

after(function(done) {
  nock.enableNetConnect();
  dropDatabase(done)
});
