require('./root');

const assert = require('chai').assert;

const adminSeeder = require(`${global.root}/db/seeds/admin`);

describe('check seeder output', function() {
  it ('should output an array of Mongo objects', function() {
    const models = adminSeeder.seed();

    models.forEach((model) => {
      assert.isObject(model, 'Model is an object');
      assert.isObject(model._id, '_id is a object');
    });
  });
});
