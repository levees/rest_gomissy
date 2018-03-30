'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const { wrap: async } = require('co');
const { respond, respondOrRedirect } = require('../../config/respond');
const User = mongoose.model('User');
const mailer = require('../mailer/index')


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
  // console.log(user);
  try {
    yield user.save();

    // send email validation
    mailer.activation(user, function(err) {
      if (err) return res.render('users/error', { signup_errors: err.errors, login_errors: '', user: user })
      return res.render('signup/complete', { title:'SignUp Complete', signup_errors: '', login_errors: '', user: user });
    })

    req.logIn(user, err => {
      if (err) req.flash('info', 'Sorry! We are not able to log you in!');
      return res.redirect('/');
    });
  } catch (err) {
    // console.log('error')
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
    respondOrRedirect ({req, res}, '/', user, 'authentication succeeded');
  });
}



exports.auth = function(req, res, next) {
  // verify the incoming JWT

  try {
    var incomingToken = jwt.verify(req.query.token, secret);
  } catch (ex) {
    console.error("ex.stack");
    console.error(ex.stack);
    return res.status(401).send('jwt error');
  }

  // do whatever auth stuff you want with the users details

  var email = incomingToken.data.email;
  var password = incomingToken.data.password;
  var user_id;

  if(email == 'me@test.com' && password == 'password'){

    // user authentication was successful, assign whatever data you want
    user_id = '123';
  }

  // construct JWT and redirect to the redirect_uri

  var outgoingToken = jwt.sign({"user_id": user_id}, secret);
  var url = req.query.redirect_uri +
      '&token=' + encodeURIComponent(outgoingToken) +
      '&state=' + encodeURIComponent(req.query.state);

  return res.redirect(url);

}

exports.logout = function(req, res, next) {
  var access_token = req.headers['x-auth-token'];
  console.log(access_token);
}



var errorLogin = function(req, res) {
  if (req.params.format == '.json')
    res.json({ success: false, message: 'Login failed. Check your login/password.' });
  else
    res.render('users/login', { message: 'Login failed. Check your login/password.' });
};
