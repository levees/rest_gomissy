'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const { wrap: async } = require('co');
const { respond, respondOrRedirect } = require('../../config/respond');
const User = mongoose.model('User');


/**
 * Load
 */

// exports.load = async(function* (req, res, next, _id) {
//   const criteria = { _id };
//   try {
//     req.profile = yield User.load({ criteria });
//     if (!req.profile) return next(new Error('User not found'));
//   } catch (err) {
//     return next(err);
//   }
//   next();
// });



/**
 * Show sign up form
 */

exports.signup = function (req, res) {
  if (req.user)
    res.redirect('/');
  else
    res.render('users/signup', {
      title: 'Sign up',
      user: new User()
    });
};

/**
 * Create user
 */

exports.create = async(function* (req, res) {
  const user = new User(req.body);
  user.provider = 'local';
  console.log(user);
  try {
    yield user.save();
    req.logIn(user, err => {
      if (err) req.flash('info', 'Sorry! We are not able to log you in!');
      return res.redirect('/');
    });
  } catch (err) {
    console.log('error')
    const errors = Object.keys(err.errors)
      .map(field => err.errors[field].message);
    
    respond(res, 'users/signup', {
      userinfo: user,
      error: errors
    });
  }
});




/**
 * Session
 */

exports.login = function(req, res, next) {
  if (req.user)
    res.redirect('/');
  else
    res.render('users/login', {
      title: 'Login'
    }); 

  // if (req.params.format == '.json')
  //   res.json('{aaa:bbb}');
  // else
  //   res.render('users/login'); 
};

exports.session = function (req, res) {
  var user = req.user;

  req.logIn(user, function(err) {
    // if (err) { return errorLogin(req, res); }
    // return res.send({ success: true, userinfo: user, message: 'authentication succeeded' });
    if (err) { 
      respond(res, 'login',{ success: false, message: 'Login failed. Check your login/password.' }); 
    }
    respondOrRedirect ({req, res}, '/', { userinfo: user }, 'authentication succeeded');
  });
}







var errorLogin = function(req, res) {
  if (req.params.format == '.json')
    res.json({ success: false, message: 'Login failed. Check your login/password.' });
  else
    res.render('users/login', { message: 'Login failed. Check your login/password.' }); 
};

