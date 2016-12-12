const console = require('keypunch');
const path = require('path');

const express = require('express');
const router = express.Router({ mergeParams: true });

const northstar = require('../../lib/northstar');

router.use(function(req, res, next) {
  if (!req.jarvis || req.jarvis.authenticated !== 'true') {
    return res.redirect(northstar.getAuthRedirectUrl());
  }

  next();
});

router.get('*', function(req, res) {
  res.sendFile(path.resolve(`${__dirname}/../../interface/index.html`));
});

module.exports = router;
