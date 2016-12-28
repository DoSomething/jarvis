'use strict';

const mongo = require('../mongo');

// The response is designed to be a common schema & object
// shared between functions and other models. It on its own
// should not be saved to a collection.

const schema = new mongo.Schema({
  /**
   * Text that will be sent to the user.
   */
  text: {
    type: String,
    trim: true,
    default: '',
  },

  /**
   * Contains strings of Media URI's.
   */
  media: [
    {
      type: String,
      lowercase: true,
      trim: true,
      default: [],
    },
  ],
}, {
  _id: false,
});

const model = mongo.mongoose.model('Response', schema);

module.exports = { schema, model };
