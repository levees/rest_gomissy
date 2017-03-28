'use strict';

/*
 * Module dependencies.
 */
const jwt = require('jsonwebtoken');
const config = require('./');


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

exports.authToken = function(req, res, next) {
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
        req.decoded = decoded;
        next();
      }
    });
  } 
  else {
    return res.status(403).send({ success: false, message: 'No token provided.' });
  }
};
