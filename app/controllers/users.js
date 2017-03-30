'use strict';

/**
 * Module dependencies.
 */

const config = require('../../config');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('User');



/**
 * Session
 */

// exports.session = login;
// exports.auth = function (req, res, next) {
//   passport.authenticate('local', 
//     function(err, user, info) {
//       console.log(user)
//       if (err) { return next(err); } // will generate a 500 error
      
//       // Generate a JSON response reflecting session status
//       if (!user) {
//         return res.send({success: false, message: 'session failed'});
//       }

//       req.logIn(user, function(err) {
//         if (err) { return next(err); }
//         return res.send({success: true, message: 'session succeeded'});
//       });
//     }
//   )(req, res, next);
// }

exports.auth = function(req, res, next) {

};

exports.session = function (req, res, next) {
  passport.authenticate('ldapauth', {session: false},
    function (err, userinfo, info) {
      if (err) { return errorLogin(); } // will generate a 500 error
      
      // Generate a JSON response reflecting authentication status
      if (!userinfo) { return errorLogin(); }

      User.findOne({ username: userinfo.name }, function (err, user) {
        if (err) { return errorLogin(); }

        if (!user) {
          user = createUser(req, userinfo);
        }
        else if (user.deviceToken != req.body.deviceToken) {
          user.deviceToken = req.body.deviceToken;
          user.authToken = createJWT(user.deviceToken);
          user.save();
        }

        req.logIn(user, function(err) {
          if (err) { return errorLogin(); }
          return res.send({ success: true, userinfo: user, message: 'authentication succeeded' });
        });
      });

    }
  )(req, res, next);
}

var createUser = function(req, userinfo) {
  var user = new User({
    name: userinfo.displayName,
    username: userinfo.name,
    email: userinfo.mail,
    office: userinfo.company,
    department: userinfo.department,
    title: userinfo.title,
    mobile: userinfo.mobile,
    deviceToken: req.body.deviceToken
  });
  user.authToken = createJWT(user.deviceToken);

  user.save(function(err) {
    if (err) { console.log(err); }
  })
  return user;
};

//var secret = 'cdnetworks'
var createJWT = function(userinfo) {
  return jwt.sign(userinfo, config.secret);
};

var errorLogin = function() {
  return res.send({ success: false, message: 'authentication failed' });
};

/**
 * Login
 */

function login (req, res) {
  const redirectTo = req.session.returnTo
    ? req.session.returnTo
    : '/';
  delete req.session.returnTo;
  res.redirect(redirectTo);
}
