'use strict';

/*
 * Module dependencies.
 */
const home          = require('../app/controllers/home');
const users         = require('../app/controllers/users');
const uploads       = require('../app/controllers/uploads');
const articles      = require('../app/controllers/articles');
const comments      = require('../app/controllers/comments');
const likes         = require('../app/controllers/likes');
const conversations = require('../app/controllers/conversations');
const messages      = require('../app/controllers/messages');

const auth      = require('./auth');
const menu      = require('./menu');


/**
 * Route middlewares
 */
const menuAuth = [menu.has_menu, menu.access_menu];
const articleAuth = [auth.requires_login, auth.article.authorization];
const commentAuth = [auth.requires_login, auth.comment.authorization];
const likeAuth = [auth.requires_login, auth.like.authorization];

const fail = {
  failureRedirect: '/login'
};

/**
 * Expose routes
 */
module.exports = function (app, passport) {
  const pauth = passport.authenticate.bind(passport);
  app.use(function (req, res, next) {
    auth.access_token(req, res, next);
  });


  app.get('/', function(req, res, next) {
    res.render('index', {
      title: 'Express'
    });
  });

  // app.get('', home.index);
  app.get('/test', home.test);
  // app.get('/test/:id/:sid:format(.json)?', home.test);


  // user routes
  app.post('/user/login', pauth('local'), users.session);
  app.post('/user/signup', users.create);
  app.get('/user/logout', auth.requires_login, users.logout);
  app.get('/user/activation', users.activation);
  app.get('/user/profile', auth.requires_login, users.profile);

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
    * Messaging Routes
    */
   app.param('conversation_id', conversations.load);
   app.route('/messages')
      .get(auth.requires_login, conversations.list)
      .post(auth.requires_login, conversations.create);

  app.post('/message', auth.requires_login, messages.send);

  app.route('/messages/:conversation_id')
     .get(auth.requires_login, messages.list)
     .post(auth.requires_login, messages.reply);


  /**
   * Articles Routes
   */
  app.param('article_id', articles.load);
  app.route('/:category/:menu')
     .get(menuAuth, articles.list)
     .post(menuAuth, articles.create);

  app.route('/:category/:menu/:article_id')
     .get(menuAuth, articles.detail)
     .put(menuAuth, articleAuth, articles.update)
     .delete(menuAuth, articleAuth, articles.destroy);

  /**
   * Comments Routes
   */
  app.param('comment_id', comments.load);
  app.route('/:category/:menu/:article_id/comments')
     .get(menuAuth, comments.list)
     .post(menuAuth, comments.create);

  app.route('/:category/:menu/:article_id/comments/:comment_id')
     .delete(menuAuth, commentAuth, comments.destroy);

  /**
   * Likes Routes
   */
  app.param('like_id', likes.load);
  app.route('/:category/:menu/:article_id/likes')
     .get(menuAuth, likes.list)
     .post(menuAuth, likes.create);

  app.route('/:category/:menu/:article_id/likes/:like_id')
     .put(menuAuth, likeAuth, likes.update)
     .delete(menuAuth, likeAuth, likes.destroy);




  app.post('/test', conversations.test);
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
