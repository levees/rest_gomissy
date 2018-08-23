'use strict';

/*!
 * Module dependencies.
 */
const mongoose = require('mongoose');
const User = mongoose.model('User');

const local = require('./passport/local');
// const google = require('./passport/google');
// const facebook = require('./passport/facebook');
// const twitter = require('./passport/twitter');
// const linkedin = require('./passport/linkedin');
// const github = require('./passport/github');

// const config = require('./config');
// const jwt = require('jsonwebtoken');
// const mongoose = require('mongoose');
// const LocalStrategy = require('passport-local').Strategy;
// const JWTStrategy = require('passport-jwt').Strategy;
// const User = mongoose.model('User');


/**
 * Expose
 */
module.exports = function (passport) {

  // serialize sessions
  // passport.serializeUser(function(user, cb) {
  //   cb(null, user.id);
  // });

  // passport.deserializeUser(function(id, cb) {
  //   User.findById(id, function (err, user) {
  //     if (err) { return cb(err); }
  //     cb(null, user);
  //   });
  // });

  // serialize sessions
  passport.serializeUser((user, cb) => cb(null, user.id));
  passport.deserializeUser((id, cb) => User.load({ criteria: { _id: id } }, cb));
  
  // use these strategies
  passport.use(local);
  // passport.use(google);
  // passport.use(facebook);
  // passport.use(twitter);
  // passport.use(linkedin);
  // passport.use(github);
};

var createJWT = function(userinfo) {
  // return jwt.sign(userinfo, config.secret, {
  //   expiresIn: '7 days'
  // });
  return jwt.sign(userinfo, config.secret);
};
