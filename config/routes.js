'use strict';

/*
 * Module dependencies.
 */
const home      = require('../app/controllers/home');
const users     = require('../app/controllers/users');
const uploads   = require('../app/controllers/uploads');
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

  app.get('', home.index);
  app.get('/test', home.test);
  // app.get('/test/:id/:sid:format(.json)?', home.test);


  // user routes
  app.post('/user/login', pauth('local',{session: false}), users.session);
  app.post('/user/signup', users.create);
  app.get('/user/logout', auth.accessToken, users.logout);
  app.get('/user/activation', users.activation);
  app.get('/user/profile', auth.accessToken, users.profile);

  app.post('/pass/forgot', users.forgot_password);
  app.post('/pass/reset', users.reset_password);

  // app.get('/me', auth.accessToken, users.profile);
  // app.get('/me1', users.profile);




  // app.route('/board/:menu/:id')
  //     .get(boards.detail)
  //     .put(boards.update)
  //     .delete(boards.delete)


  /**
   * File uploads
   */
   app.post('/upload', uploads.index)

  /**
   * Articles Routes
   */
  app.param('article_id', articles.load);
  app.route('/:category/:menu')
     .get(hasMenu, articles.list)
     .post(hasMenu, auth.accessToken, articles.create);

  app.route('/:category/:menu/:article_id')
     .get(articles.detail)
     .put(hasMenu, articleAuth, articles.update)
     .delete(hasMenu, articleAuth, articles.destroy);



  // app.get('/:category(board)/:menu/:id',      hasMenu, articles.show);
  // app.delete('/:category(board)/:menu/:id',   hasMenu, articleAuth, articles.destroy);



  // app.get('/:category/*', function(req, res){
  //   res.send('what???', 404);
  // });

};



var format = function (req) {
  console.log('format')
    // if (req.params[0] == '.json')
    //   app.reqFormat = 'json';
    // else
    //   app.reqFormat = 'html'

  };
