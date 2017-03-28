'use strict';

/*!
 * Module dependencies.
 */

const mongoose = require('mongoose');
const LocalStrategy = require('passport-local').Strategy;
const LdapStrategy = require('passport-ldapauth').Strategy
const User = mongoose.model('User');


/**
 * Expose
 */

var ldap_options = {
  server: {
    url: 'ldap://kdc3.cdnetworks.kr:3268',
    bindDn: 'CN=fmslog_ldap,OU=System Account,OU=CDNetworks,dc=cdnetworks,dc=kr',
    bindCredentials: 'Fms#$admin',
    searchBase: 'dc=cdnetworks,dc=kr',
    searchFilter: '(&(objectcategory=person)(objectclass=user)(|(samaccountname={{username}})(mail={{username}})))'
  },
  usernameField: 'username',
  passwordField: 'password'
};

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


  passport.use(new LdapStrategy(ldap_options));

  passport.use(new LocalStrategy(
    function (username, deviceToken, done) {
      console.log('LocalStrategy - username');
      console.log(username)
      console.log(deviceToken);

      User.findOne({ username: username }, function (err, user) {
        if (err) { return done(err); }
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        if (!user.validPassword(password)) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
      });
    }
  ));
};
