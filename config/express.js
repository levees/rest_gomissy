'use strict';

/**
 * Module dependencies.
 */

const express = require('express');
const session = require('express-session');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const csrf = require('csurf');
const cors = require('cors');
const sass = require('node-sass-middleware');
const engine = require('ejs-locals')
const i18n = require('i18n-light');
const breadcrumbs = require('express-breadcrumbs');

const mongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const winston = require('winston');
const config = require('./config');
const pkg = require('../package.json');

const env = process.env.NODE_ENV || 'development';

/**
 * Expose
 */

module.exports = function (app, passport) {

  // Compression middleware (should be placed before express.static)
  app.use(compression({
    threshold: 512
  }));

  // i18n initialize
  i18n.configure({
    defaultLocale: 'en',
    // locales: ['en', 'kr'],
    dir: config.root + '/config/locales',
    extension: 'json'
  })
  app.use(i18n.init());  
  app.use(function(req,res,next) {
    var lang = req.headers["accept-language"].split('-')[0];
    i18n.setLocale(lang);
    next();
  });

  // adding the sass middleware
  app.use(
   sass({
     src: config.root + '/scss', 
     dest: config.root + '/public/css',
     prefix: '/css',
     outputStyle: 'compressed',
     debug: true,       
   })
  ); 

  // Static files middleware
  app.use(express.static(config.root + '/public'));

  // Use winston on production
  let log = 'dev';
  if (env !== 'development') {
    log = {
      stream: {
        write: message => winston.info(message)
      }
    };
  }

  // Don't log during tests
  // Logging middleware
  if (env !== 'test') app.use(morgan(log));

  // set views path, template engine and default layout
  app.engine('ejs', engine);
  app.set('views', config.root + '/app/views'); // general config
  app.set('view engine', 'ejs');

  // expose package.json to views
  app.use(function (req, res, next) {
    res.locals.pkg = pkg;
    res.locals.env = env;
    next();
  });

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

  // CookieParser should be above session
  app.use(cookieParser());
  app.use(cookieSession({ secret: 'secret' }));
  app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: pkg.name,
    store: new mongoStore({
      url: config.db,
      collection : 'sessions'
    })
  }));

  // Cors
  app.use(cors({
    origin: ['http://localhost:3000', 'https://cdnet-push.herokuapp.com'],
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    credentials: true
  }));
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'POST, GET, UPDATE, DELETE, PUT');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  // use passport session
  app.use(passport.initialize());
  app.use(passport.session());

  // connect flash for flash messages - should be declared after sessions
  app.use(flash());

  // Breadcrumb init
  app.use(breadcrumbs.init());

  // Set Breadcrumbs home information 
  app.use(breadcrumbs.setHome());

  // should be declared after session and flash
  // app.use(helpers(pkg.name));

  if (env !== 'test') {
    app.use(csrf());

    // This could be moved to view-helpers :-)
    app.use(function (req, res, next) {
      res.locals.csrf_token = req.csrfToken();
      next();
    });
  }

  if (env === 'development') {
    app.locals.pretty = true;
  }
};
