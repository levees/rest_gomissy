'use strict';

/**
 * Module dependencies.
 */

const config = require('../../config/config');
const { respond, respondOrRedirect } = require('../../config/respond');
const mongoose = require('mongoose');

// for test
const mailer = require('../mailer/email')


exports.index = function(req, res, next) {
  // req.breadcrumbs('test', '/test');
  // console.log(res.locals);
  respond(res, 'home/index', {
    pagetitle: 'Home',
    breadcrumbs: req.breadcrumbs()
  });

};

exports.test = function(req, res, next) {
  // console.log(req.params);
  var user = {
    name: 'test',
    email: 'leveess@gmail.com'
  }
  mailer.confirmation(user, function(err) {
    if (err) return res.render('users/error', { signup_errors: 'err.errors', login_errors: '', user: user })
    return res.render('users/complete', { title:'SignUp Complete', signup_errors: '', login_errors: '', user: user });
  });

  // if (req.params.format == '.json')
  //   res.json('{aaa:bbb}');
  // else
  //   res.render('home/test');
};
