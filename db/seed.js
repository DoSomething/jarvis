'use strict';

require('dotenv').config();
require('../util/pathHelpers');

const console = require('keypunch');
require('./mongo');

const seeds = ['admin'];
// Filter out by ENV vars / cmd arguments

seeds.forEach((seedName) => {
  console.log(`Running ${seedName}`);
  const seeder = require(`./seeds/${seedName}`);

  const pre = new Promise((resolve) => {
    seeder.preSeed(resolve);
  });

  pre.then(() => seeder.seed())
  .then((models) => {
    models.forEach((model) => {
      model.save().catch((err) => console.error(err));
    });
  });
});
