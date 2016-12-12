'use strict';

const console = require('../util/configureLogger')();

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const sessions = require('client-sessions');
app.use(sessions({
  cookieName: 'jarvis',
  secret: process.env.COOKIE_SECRET, // should be a large unguessable string
  duration: 24 * 60 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

app.use('/public', express.static('./interface/dist'));
app.use('/public/forge', express.static('./node_modules/@dosomething/forge/dist'));

const router = require('../http/routes');
app.use('/', router());

app.listen(process.env.PORT, () => {
  console.info(`Api Process listening on ${process.env.PORT}`);
});

module.exports = app;
