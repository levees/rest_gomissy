'use strict';

/**
 * Module dependencies.
 */

const express = require('express');
// const session = require('express-session');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
// const csrf = require('csurf');
const cors = require('cors');

// const mongoStore = require('connect-mongo')(session);
// const flash = require('connect-flash');
// const winston = require('winston');
const config = require('./');
const pkg = require('../package.json');

const env = process.env.NODE_ENV || 'development';

/**
 * Expose
 */

module.exports = function (app, passport) {

  app.set('secret', config.secret);

  app.use(cors({
    origin: ['http://localhost:3000', 'https://cdnet-push.herokuapp.com'],
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    credentials: true
  }));

  // Static files middleware
  app.use(express.static(config.root + '/public'));

  // Don't log during tests
  // Logging middleware
  app.use(morgan('dev'));

  // bodyParser should be above methodOverride
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(methodOverride(function (req) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      var method = req.body._method;
      delete req.body._method;
      return method;
    }
  }));

  // Cors
  app.use(cors());
  app.use(function(req, res, next) {
     res.header("Access-Control-Allow-Origin", "*");
     res.header('Access-Control-Allow-Methods', 'POST, GET, UPDATE, DELETE, PUT');
     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
     next();
  });

  // use passport session
  app.use(passport.initialize());
  app.use(passport.session());

};
