const console = require('keypunch');
const path = require('path');

const express = require('express');
const router = express.Router({ mergeParams: true });

const northstar = require('../../lib/northstar');

router.get('/callback', function(req, res) {
  const code = req.query['code'];
  const state = req.query['state'];

  if (!northstar.compareValidationToken(state)) {
    req.jarvis.authenticated = 'false';
    res.redirect('/admin');
  }

  northstar.verifyAccessToken(code)
  .then((token) => {
    res.json({code, state, token});
    // req.jarvis.authenticated = 'true';
  }).catch(err => console.error(err));
});

module.exports = router;
