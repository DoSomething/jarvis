'use strict';

const console = require('keypunch');
const mongo = require('../mongo');
const northstar = require(`${global.root}/lib/northstar`);
const protocols = require(`${global.root}/config/protocols`);

/**
 * User schema.
 * `_id` should always be the users Northstar ID.
 */
const schema = new mongo.Schema({

  /**
   * Keep track of the users current protocol.
   */
  protocol: {
    type: String,
    default: 'user',
    enum: protocols,
    required: true,
    lowercase: true,
    trim: true,
  },

  /**
   * Persistent space for storing custom fields.
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
 * Find or create a user based on the northstar id.
 * @param {String} northstarId
 * @param {String} primaryKey A Northstar primary key.
 *                            Could be a mobile #, email or a Facebook id.
 * @param {String} primaryKeyType The type of key being used
 *                                Could be mobile, email or facebook_id
 * For more on NS requirements see,
 * https://github.com/DoSomething/northstar/blob/dev/documentation/endpoints/users.md#create-a-user
 *
 * @return {Promise}
 */
schema.statics.findOrCreate = function (primaryKey, primaryKeyType) {
  const nsUser = {};
  nsUser[primaryKeyType] = primaryKey;

  return northstar.findUser(primaryKeyType, primaryKey)
  .then((res) => {
    if (res.data) return res.data;

    return northstar.createUser(nsUser)
    .then(newUserRes => newUserRes.data)
    .catch(err => console.error(err));
  })
  .then(nsRes => {
    nsUser._id = nsRes._id;
  })
  .then(() => this.findOne({ _id: nsUser._id })
    .exec()
    .catch(err => console.error(err))
  )
  .then((user) => {
    if (user) return user;

    return new this({ _id: nsUser._id })
    .save()
    .catch(err => console.error(err));
  })
  .catch(err => console.error(err));
};

/**
 * Get the Northstar user associated with this model.
 * @return {Promise}
 */
schema.methods.getNorthstarUser = function () {
  return northstar.findUserByNorthstarId(this._id)
  .catch(err => console.error(err));
};

const User = mongo.mongoose.model('User', schema);

module.exports = User;
