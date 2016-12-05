const express = require('express');

const router = express.Router();

const apiRouter = express.Router({ mergeParams: true });
const interfaceRouter = express.Router({ mergeParams: true });
const recieveRouter = express.Router({ mergeParams: true });

module.exports = () => {

  // Don't enable the test reciever on production.
  if (process.env.NODE_ENV !== 'production') {
    recieveRouter.use('/default', require('./controllers/Reciever'));
  }

  router.use('/', interfaceRouter);
  router.use('/api', apiRouter);
  router.use('/recieve', recieveRouter);

  return router;
}
