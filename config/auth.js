'use strict';

/*
 * Module dependencies.
 */
const jwt = require('jsonwebtoken');
const config = require('./config');


/*
 *  Token authorization routing middleware
 */

exports.accessToken = function(req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, config.secret, function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.user_id = decoded.data;
        next();
      }
    });
  } 
  else {
    return res.status(403).send({ success: false, message: 'No token provided.' });
  }
};

/*
 *  Generic require login routing middleware
 */

exports.requiresLogin = function (req, res, next) {
  // if (req.isAuthenticated()) return next();
  // if (req.method == 'GET') req.session.returnTo = req.originalUrl;
  // res.redirect('/login');
};

/*
 *  User authorization routing middleware
 */

exports.user = {
  hasAuthorization: function (req, res, next) {
    if (req.profile.id != req.user.id) {
      req.flash('info', 'You are not authorized');
      return res.redirect('/users/' + req.profile.id);
    }
    next();
  }
};

/*
 *  Article authorization routing middleware
 */

exports.article = {
  hasAuthorization: function (req, res, next) {
    if (req.article.user.id != req.user.id) {
      req.flash('info', 'You are not authorized');
      return res.redirect('/articles/' + req.article.id);
    }
    next();
  }
};

/**
 * Comment authorization routing middleware
 */

exports.comment = {
  hasAuthorization: function (req, res, next) {
    // if the current user is comment owner or article owner
    // give them authority to delete
    if (req.user.id === req.comment.user.id || req.user.id === req.article.user.id) {
      next();
    } else {
      req.flash('info', 'You are not authorized');
      res.redirect('/articles/' + req.article.id);
    }
  }
};







exports.deviceToken = function(req, res, next) {
  var username = req.body.username || req.query.username || req.headers['x-username'];
  var device_token = req.body.devicetoken || req.query.devicetoken || req.headers['x-device-token'];

  if (username && device_token) {
    console.log('check username and device token');
    next();
  }
  else {
    return res.status(403).send({ success: false, message: 'No information provided.' });    
  }
};


