require('dotenv').config();
if (process.env.MONGODB_TEST_URI) process.env.MONGODB_URI = process.env.MONGODB_TEST_URI;

process.env.LOG_LEVEL = 4;

const mongo = require('../db/mongo');

function dropDatabase(done) {
  mongo.mongoose.connection.db.dropDatabase(done);
}

beforeEach(function(done) {
  dropDatabase(done);
});

after(function(done) {
  dropDatabase(done)
});
