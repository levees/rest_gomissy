'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const crypto = require('crypto');
const Schema = mongoose.Schema;
// const salt = 'goodfriends.co'

const oAuthTypes = [
  'github',
  'twitter',
  'facebook',
  'google',
  'linkedin',
  'kakao'
];

/**
 * User Schema
 */

const UserSchema = new Schema({
  username: {
    type: String,
    default: '',
    required: true,
    trim: true,
    lowercase: true,
    unique: true
  },
  hashed_password: {
    type: String,
    required: true,
    default: ''
  },
  name: {
    type: String,
    default: '',
    required: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true
  },
  photo: { 
    type: String, 
    default: '' 
  },
  mobile: {
    type: String,
    default: ''
  },
  location: {
    zipcode: { type: String, required: true, validate: [/^[0-9]{5}$/i, '올바른 Zipcode를 입력하세요.'] },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: '' }
  },
  birth: { 
    open:  { type: String, default: 'global' },
    month: { type: String },
    day:   { type: String },
    year:  { type: String }
  },
  salt: {
    type: String,
    default: ''
  },
  access_token: {
    type: String,
    default: ''
  },
  password_token: {
    type: String,
    default: ''
  },
  provider: {
    type: String,
    default: ''
  },
  activation: {
    authCode: String,
    status: { type: Boolean, default: false }
  },
  level: {
    type: Number,
    default: 101
  },
  created_at: Date,
  updated_at: Date
});


const validatePresenceOf = value => value && value.length;

/**
 * Virtuals
 */

UserSchema
  .virtual('password')
  .set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

/**
 * Validations
 */

// the below 5 validations only apply if you are signing up traditionally

UserSchema.path('email').validate(function (email) {
  if (this.skipValidation()) return true;
  return email.length;
}, 'Email cannot be blank');

UserSchema.path('email').validate(function (email, fn) {
  const User = mongoose.model('User');
  if (this.skipValidation()) fn(true);

  // Check only when it is a new user or when email field is modified
  if (this.isNew || this.isModified('email')) {
    User.find({ email: email }).exec(function (err, users) {
      fn(!err && users.length === 0);
    });
  } else fn(true);
}, 'Email already exists');

UserSchema.path('username').validate(function (username) {
  if (this.skipValidation()) return true;
  return username.length;
}, 'Username cannot be blank');

UserSchema.path('hashed_password').validate(function (hashed_password) {
  if (this.skipValidation()) return true;
  return hashed_password.length && this._password.length;
}, 'Password cannot be blank');

UserSchema.path('name').validate(function (name) {
  if (this.skipValidation()) return true;
  return name.length;
}, 'Name cannot be blank');



/**
 * Pre-save hook
 */

UserSchema.pre('save', function (next) {
  if (!this.isNew) return next();

  // get the current date
  var currentDate = new Date();

  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;

  if (!validatePresenceOf(this.password) && !this.skipValidation()) {
    next(new Error('Invalid password'));
  } else {
    next();
  }
});

/**
 * Methods
 */

UserSchema.methods = {

  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */

  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */

  makeSalt: function () {
    return Math.round((new Date().valueOf() * Math.random())) + '';
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */

  encryptPassword: function (password) {
    if (!password) return '';
    try {
      return crypto
        .createHmac('sha1', this.salt)
        .update(password)
        .digest('hex');
    } catch (err) {
      return '';
    }
  },


  /**
   * Encrypt authCode
   *
   * @param {String} authcode
   * @return {String}
   * @api public
   */
  
  encryptAuthCode: function() {
    var timestamp = new Date()
    var stringVar = timestamp + ' '
    var authCode = crypto.createHash('sha512').update(stringVar).update(this.salt).digest('base64');
    return authCode;
  },

  /**
   * Validation is not required if using OAuth
   */

  skipValidation: function () {
    return ~oAuthTypes.indexOf(this.provider);
  }
};

/**
 * Statics
 */

UserSchema.statics = {

  /**
   * Load
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */

  load: function (options, cb) {
    options.select = options.select || 'name username';

    return this.findOne(options.criteria)
      .select(options.select)
      .exec(cb);
  },

  /**
   * Update password for temporary
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */

  temp_password: function (email, cb) {
    return this.findOne({"email": email}, function(err, user) {
      if (err) return cb(err);

      var token = crypto.randomBytes(64).toString('hex');
      var error = user.update({ password_token: token }, function(err, resp) {
        return err;
      });
      return cb(error, user, token);
    });
  },

  /**
   * Update password by user
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
  */
  
  update_password: function (id, cb) {
    return this.findOne({_id: id}, function(err, user) {
      if (err) return cb(err);
  
      var token = crypto.randomBytes(64).toString('hex');
      var error = user.update({ password_token: token }, function(err, resp) {
        return err;
      });
      return cb(error, user, token);
    });
  },

};


mongoose.model('User', UserSchema);
