'use strict';

/**
 * Module dependencies.
 */


const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { wrap: async } = require('co');
const User = mongoose.model('User');


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
  user.provider = 'local';
  try {
    yield user.save();
    req.logIn(user, err => {
      if (err) req.flash('info', 'Sorry! We are not able to log you in!');
      return res.redirect('/');
    });
  } catch (err) {
    const errors = Object.keys(err.errors)
      .map(field => err.errors[field].message);

    res.render('users/signup', {
      title: 'Sign up',
      errors,
      user
    });
  }
});


/**
 * Show sign up form
 */

exports.signup = function (req, res) {
  res.render('users/signup', {
    title: 'Sign up',
    user: new User()
  });
};



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

exports.login = function(req, res, next) {
  if (req.params.format == '.json')
    res.json('{aaa:bbb}');
  else
    res.render('users/login'); 
};



exports.session = function (req, res, next) {
  passport.authenticate('local', {session: false},
    function (err, userinfo, info) {
      // console.log(err);
      if (err) { return errorLogin(req, res); } // will generate a 500 error
      
      // Generate a JSON response reflecting authentication status
      if (!userinfo) { return errorLogin(req, res); }

      User.findOne({ username: userinfo.name }, function (err, user) {
        if (err) { return errorLogin(req, res); }

        if (!user) {
          user = createUser(req, userinfo);
        }
        else if (user.deviceToken != req.body.deviceToken) {
          user.deviceToken = req.body.deviceToken;
          user.authToken = createJWT(user.deviceToken);
          user.save();
        }

        req.logIn(user, function(err) {
          if (err) { return errorLogin(req, res); }
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
  // return jwt.sign(userinfo, config.secret, {
  //   expiresIn: '7 days'
  // });
  return jwt.sign(userinfo, config.secret);
};

var errorLogin = function(req, res) {
  if (req.params.format == '.json')
    res.json({ success: false, message: 'Login failed. Check your login/password.' });
  else
    res.render('users/login', { message: 'Login failed. Check your login/password.' }); 
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
