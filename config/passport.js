'use strict';

/*!
 * Module dependencies.
 */
const config = require('./config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const User = mongoose.model('User');


/**
 * Expose
 */
module.exports = function (passport) {

  // serialize sessions
  passport.serializeUser(function(user, cb) {
    cb(null, user.id);
  });

  passport.deserializeUser(function(id, cb) {
    User.findById(id, function (err, user) {
      if (err) { return cb(err); }
      cb(null, user);
    });
  });

  passport.use(new LocalStrategy({
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

        var access_token = user.access_token = createJWT(user.username);
        User.updateOne(user, {$set: {'access_token': access_token}}).exec();
        return done(null, user);
      });
    }
  ));
};

var createJWT = function(userinfo) {
  // return jwt.sign(userinfo, config.secret, {
  //   expiresIn: '7 days'
  // });
  return jwt.sign(userinfo, config.secret);
};
