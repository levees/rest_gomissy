'use strict';

/*!
 * Module dependencies.
 */
const config = require('./config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const LocalStrategy = require('passport-local').Strategy;
// const LdapStrategy = require('passport-ldapauth').Strategy
const User = mongoose.model('User');


/**
 * Expose
 */

// var ldap_options = {
//   server: {
//     url: 'ldap://kdc3.cdnetworks.kr:3268',
//     bindDn: 'CN=fmslog_ldap,OU=System Account,OU=CDNetworks,dc=cdnetworks,dc=kr',
//     bindCredentials: 'Fms#$admin',
//     searchBase: 'dc=cdnetworks,dc=kr',
//     searchFilter: '(&(objectcategory=person)(objectclass=user)(|(samaccountname={{username}})(mail={{username}})))'
//   },
//   usernameField: 'username',
//   passwordField: 'password'
// };

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


  // passport.use(new LdapStrategy(ldap_options));

  passport.use(new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password'
    },
    function (username, password, done) {
      const options = {
        criteria: { username: username },
        select: 'name username email hashed_password salt'
      };

      User.findOne(options.criteria, function(err, user) {
        console.log(user);
        if (err) return done(err);
        if (!user) {
          return done(null, false, { message: 'Unknown user' });
        }
        if (!user.authenticate(password)) {
          return done(null, false, { message: 'Invalid password' });
        }

        user.authToken = createJWT(user.username);
        user.save();
        return done(null, user);
      });

      // User.load(options, function (err, user) {
      //   if (err) return done(err);
      //   if (!user) {
      //     return done(null, false, { message: 'Unknown user' });
      //   }
      //   if (!user.authenticate(password)) {
      //     return done(null, false, { message: 'Invalid password' });
      //   }
      //   return done(null, user);
      // });
    }
  ));
};

var createJWT = function(userinfo) {
  // return jwt.sign(userinfo, config.secret, {
  //   expiresIn: '7 days'
  // });
  return jwt.sign(userinfo, config.secret);
};