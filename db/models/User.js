'use strict';

const mongo = require('../mongo');
const northstar = require('../../lib/northstar');

/**
 * User schema.
 * `_id` should always be the users Northstar ID.
 */
const schema = new mongo.Schema({
  /**
   * Use the user profile for storing custom fields per user that aren't persisted elsewhere.
   */
  profile: {

    /**
     * Keep track of the users donations for Science Sleuth.
     */
    scienceSleuthDonationCount: {
      2015: {
        type: Number,
        default: 0,
      },
      2016: {
        type: Number,
        default: 0,
      },
    },
  },
}, {
  timestamps: true,
});

/**
 * Get the Northstar user associated with this model.
 * @return {Promise}
 */
schema.methods.getNorthstarUser = function () {
  return northstar.findUserByNorthstarId(this._id);
};

const User = mongo.mongoose.model('User', schema);

module.exports = User;
