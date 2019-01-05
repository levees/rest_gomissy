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
        return done(null, false, { errors: ['Incorrect username or password.'] });
      }
      if (!user.authenticate(password)) {
        return done(null, false, { errors: ['Incorrect username or password.'] });
      }

      var access_token = user.access_token = createJWT({ id: user._id, username: user.username, name:user.name, level: user.level, photo: user.photo });
      User.updateOne(user, {$set: {'access_token': access_token}}).exec();
      return done(null, user);
    });
  }
);

var createJWT = function(userinfo) {
  return jwt.sign({
    // exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
    data: userinfo
  }, config.secret);
};
