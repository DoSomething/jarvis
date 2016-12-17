'use strict';

const console = require('../util/configureLogger')();

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const router = require('../http/routes');
app.use('/', router());

app.listen(process.env.PORT, () => {
  console.info(`Api Process listening on ${process.env.PORT}`);
});

module.exports = app;
