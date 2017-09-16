'use strict';

/*
 * Module dependencies.
 */
const home      = require('../app/controllers/home');
const users     = require('../app/controllers/users');
const articles  = require('../app/controllers/articles');
const comments  = require('../app/controllers/comments');
const auth      = require('./auth');
const menu      = require('./menu');


/**
 * Route middlewares
 */
const hasMenu = [menu.hasMenu];
const articleAuth = [auth.requiresLogin, auth.article.hasAuthorization];
const commentAuth = [auth.requiresLogin, auth.comment.hasAuthorization];

const fail = {
  failureRedirect: '/login'
};

/**
 * Expose routes
 */ 
module.exports = function (app, passport) {
  const pauth = passport.authenticate.bind(passport);
  app.use(function (req, res, next) {
    res.locals.userinfo = req.user;
    next();
  });

  app.get('/', home.index);
  app.get('/test/:id/:sid:format(.json)?', home.test);


  // user routes
  app.get('/signup', users.signup);
  app.get('/login', users.login);
  app.post('/logout', users.logout);
  app.get('/auth', users.auth);
  // app.post('/users', users.create);
  // app.post('/users/session',
  //   pauth('local', {
  //     failureRedirect: '/login',
  //     failureFlash: 'Invalid email or password.'
  //   }), users.session);
  // app.get('/users/:userId', users.show);


  // app.get('/login', users.login);
  // app.post('/login:format(.json)?', passport.authenticate('local', {
  //   failureRedirect: '/login',
  //   failureFlash: 'Invalid email or password.'
  // }), users.session);

  // app.post('/users/session',
  //   pauth('local', {
  //     failureRedirect: '/login',
  //     failureFlash: 'Invalid email or password.'
  //   }), users.session);


  // app.post('/auth', users.auth);
  app.post('/signup', users.create);
  app.post('/login',
    pauth('local', {
      failureRedirect: '/login',
      failureFlash: 'Invalid email or password.'
    }), users.session);

  // app.post('/login', passport.authenticate('ldapauth', {session: false}), function(req, res) {
  //   console.log(req.user);
  //   res.send({status: 'ok'});
  // });

  // app.get('/message', auth.authToken, function(req, res) {
  //   console.log('message');
  //   res.send({status: 'ok'});
  // });

  // exports.format = function (req, res, next) {
  //   if (req.params[0] == '.json')
  //     app.reqFormat = 'json';
  //   else
  //     app.reqFormat = 'html'

  //   next();
  // };


  /**
   * Articles Routes
   */
  app.param('id', articles.load);
  app.get('/:menu',           hasMenu, articles.index);
  app.get('/:menu/new',       hasMenu, auth.requiresLogin, articles.new);
  app.post('/:menu',          hasMenu, auth.requiresLogin, articles.create);
  app.get('/:menu/:id',       hasMenu, articles.show);
  app.get('/:menu/:id/edit',  hasMenu, articleAuth, articles.edit);
  app.put('/:menu/:id',       hasMenu, articleAuth, articles.update);
  app.delete('/:menu/:id',    hasMenu, articleAuth, articles.destroy);



};



var format = function (req) {
  console.log('format')
    // if (req.params[0] == '.json')
    //   app.reqFormat = 'json';
    // else
    //   app.reqFormat = 'html'

  };