'use strict';

/*
 * Module dependencies.
 */
const jwt = require('jsonwebtoken');
const config = require('./config');


/*
 *  Token authorization routing middleware
 */

exports.access_token = function(req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, config.secret, function(err, decoded) {
      if (err) {
        return res.status(498).json({ success: false, errors: ['Failed to authenticate token.'] });    
      } else {
        // if everything is good, save to request for use in other routes
        req.user = decoded.data;
        next();
      }
    });
  }
  else {
    next();
    // return res.status(403).send({ success: false, errors: ['No token provided.'] });
  }
};



/*
 *  Generic require login routing middleware
 */

exports.requires_login = function (req, res, next) {
  if (req.user) return next();
  return res.status(401).json({ result: false, errors: ["No permission."] });
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
  authorization: function (req, res, next) {
    if (req.article.user._id != req.user.id) {
      return res.json({ result: false, errors: ['You are not authorized'] });
    }
    next();
  }
};

/*
 *  Market authorization routing middleware
 */

exports.product = {
  authorization: function (req, res, next) {
    if (req.market.user._id != req.user.id) {
      return res.json({ result: false, errors: ['You are not authorized'] });
    }
    next();
  }
};
/**
 * Comment authorization routing middleware
 */

exports.comment = {
  authorization: function (req, res, next) {
    if (req.comment.user._id != req.user.id) {
      return res.json({ result: false, errors: ['You are not authorized'] });
    }
    next();
  }
};

/**
 * Like authorization routing middleware
 */

exports.like = {
  authorization: function (req, res, next) {
    if (req.like.user._id != req.user.id) {
      return res.json({ result: false, errors: ['You are not authorized'] });
    }
    next();
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
    return res.status(403).send({ success: false, errors: ['No information provided.'] });    
  }
};


