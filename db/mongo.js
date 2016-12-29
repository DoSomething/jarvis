'use strict';

const console = require('keypunch');
const stathat = require('../lib/stathat');

const mongoose = require('mongoose');

if (process.env.DEBUG_MONGO) mongoose.set('debug', true);

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.info('Mongoose connection open');
});

mongoose.connection.on('error', (err) => {
  stathat.count('mongo connection error', 1);
  console.info('Mongoose connection error', err);
});

mongoose.connection.on('disconnected', () => {
  stathat.count('mongo disconnect', 1);
  console.log('Mongoose connection disconnected');
});

const Schema = mongoose.Schema;

module.exports = {
  mongoose,
  Schema,
};
