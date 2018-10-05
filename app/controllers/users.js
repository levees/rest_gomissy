'use strict';

/**
 * Module dependencies.
 */

const _ = require('underscore');
const mongoose = require('mongoose');
const { wrap: async } = require('co');
// const { respond, respondOrRedirect } = require('../../config/respond');
const User = mongoose.model('User');
const mailer = require('../mailer/email')
const func = require('../../config/function')



/**
 * Load
 */

exports.load = async(function* (req, res, next, _id) {
  const criteria = { _id };
  try {
    req.profile = yield User.load({ criteria });
    if (!req.profile) return next(new Error('User not found'));
  } catch (err) {
    return next(err);
  }
  next();
});


/**
 * Create user
 */

exports.create = async(function* (req, res) {
  const user = new User(req.body);

  // Need to modify when goto production
  // var geo = func.getLocation_postal('95008');
  var ipaddress = '73.223.236.152';
  var geo = func.getLocation_IP(ipaddress);

  try {
    _.extend(user, {
      provider: 'local',
      activation: {
        token: user.encryptAuthCode(),
        status: false
      },
      location: {
        zipcode: geo.postal,
        city: geo.city,
        state: geo.state,
        country: geo.country,
        latitude: geo.location.latitude,
        longitude: geo.location.longitude
      }
    });
    yield user.save();

    // send email confirmation
    mailer.confirmation(user, function(err) {
      if (err) return res.json({ result: false, errors: err.errors })
      return res.json({ result: true, user: user });
    });
  } catch (err) {
    const errors = Object.keys(err.errors).map(field => err.errors[field].message);
    res.json({ result: false, userinfo: user, error: errors });
  }
});


/**
 * Account Activation
 */

exports.activation = function (req, res) {
  var authcode = req.query['p'];
  User
    .findOne({ 'activation.token': authcode }).exec(function(err, user) {
      if (err) return res.json({ result: false, errors: ['SignUp Activation Failure'] });
      if (!user) return res.json({ result: false, errors: ['SignUp Activation Failure'] });
      if (user.activation.status) {
        return res.json({ result: false, errors: ['Already been activated.'] });
      }
      else {
        user.activation.status = true;
        user.update(user, { 'user.activation.status': true }).exec(function(err) {
          if (err) return res.json({ result: false, errors: ['Occurred error during the activation.\nPlease try again.']});
          return res.json({ result: true });
        });
      }
    });
    // .findOneAndUpdate({ 'activation.token': authcode, 'activation.status': false }, { 'activation.status': true }, function(err, user){
    //   if (err) return res.json({ status: false, title:'SignUp Activation Failure', status: false, user: user, login_errors:'' })
    //   if (!user) return res.json({ status: false, title:'SignUp Activation Failure', status: false, user: user, login_errors:'' })
    //   return res.json({ status: true, title:'SignUp Activation Successful', status: true, user: user, login_errors:'' })
    // })
};



/**
 * Session
 */

exports.session = function (req, res) {
  var user = req.user;
  req.logIn(user, { session: false }, function(err) {
    if (err) {
      return res.json({ result: false, errors: err.errors });
    }
    return res.json({ result: true, token: user.access_token });
  });
};


/**
 * Logout
 */
exports.logout = function(req, res) {
  // var access_token = req.headers['x-access-token'];
  console.log(req.user.id);
  User.findOneAndUpdate({ _id:req.user.id }, { access_token: '' }, function(err, user){
    if (err) return res.json({ result: false });
    req.logout();
    return res.json({ result: true });
  })
};


/**
 * Forgot password
 */

exports.forgot_password = function(req, res) {
  var email = req.body.email;

  User.temp_password(email, function(err, user, token) {
    if (err) return res.json({ result: false, errors: err.errors });
    user.password_token = token;
    mailer.resetpassword(user, function(err) {
      if (err) return res.json({ result: false, errors: err.errors })
      return res.json({ result: true, token: token });
    });
  });
};


/**
 * Reset password
 */

exports.reset_password = function(req, res, next) {
  var token = req.body.token;
  var password = req.body.password;

  User.findOne({ password_token: token}, function(err, user) {
    user.password = password;
    user.password_token = '';
    user.save(function(err, user) {
      if (err) return res.json({ result: false, errors: err.errors });
      return res.json({ result: true });
    });
  });
};


/* Get user profile
 *
 */

exports.profile = function(req, res) {
  User.load({ _id: req.user.id }, function(err, user) {
    if (err) return res.json({ errors: err.errors }, 403);
    return res.json({ data: user });
  });
};
