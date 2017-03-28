'use strict';

/*
 * Module dependencies.
 */
const users = require('../app/controllers/users');
const auth = require('./auth');


/**
 * Expose routes
 */ 





module.exports = function (app, passport) {

  app.post('/auth', users.auth);
  // app.post('/session', passport.authenticate('local', {
  //     failureRedirect: '/login',
  //     failureFlash: 'Invalid email or password.'
  //   }), users.session);

  app.post('/session', users.session);
  // app.post('/login', passport.authenticate('ldapauth', {session: false}), function(req, res) {
  //   console.log(req.user);
  //   res.send({status: 'ok'});
  // });

  app.get('/message', auth.authToken, function(req, res) {
    console.log('message');
    res.send({status: 'ok'});
  });
};