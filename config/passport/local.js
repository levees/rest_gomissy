'use strict';

/**
 * Module dependencies.
 */

const config = require('../config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const User = mongoose.model('User');

/**
 * Expose
 */

module.exports = new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
  function (username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) return done(err);
      if (!user) {
        return done(null, false, { message: 'Incorrect username or password.' });
      }
      if (!user.authenticate(password)) {
        return done(null, false, { message: 'Incorrect username or password.' });
      }

      var access_token = user.access_token = createJWT(user._id);
      User.updateOne(user, {$set: {'access_token': access_token}}).exec();
      return done(null, user);
    });
  }
);

var createJWT = function(userinfo) {
  return jwt.sign({
    // exp: 1534952623, //Math.floor(Date.now() / 1000) + (60 * 60 * 24),
    data: userinfo
  }, config.secret);
  // return jwt.sign(userinfo, config.secret, { expiresIn: 7*24*60*60 });
  // return jwt.sign(userinfo, config.secret);
};