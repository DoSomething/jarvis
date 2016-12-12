const express = require('express');

const router = express.Router();

const apiRouter = express.Router({ mergeParams: true });
const recieveRouter = express.Router({ mergeParams: true });

module.exports = () => {
  router.use('/api', apiRouter);

  recieveRouter.use('/default', require('./controllers/Reciever'));
  recieveRouter.use('/twilio', require('./controllers/Twilio'));
  router.use('/recieve', recieveRouter);

  return router;
}
