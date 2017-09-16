'use strict';

/*
 * Goodfriends web application : nodejs, express, mongodb
 * Copyright(c) Goodfriends 2017 Bryan.Oh 
 * MIT Licensed
 */

/**
 * Module dependencies
 */
require('dotenv').config();

const fs = require('fs');
const join = require('path').join;
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

// const load = require('express-load');

const models = join(__dirname, 'app/models');
const config = require('./config/config');
const port = process.env.PORT || 3000;
const app = express();
const secret = 'yourSuperSecretPassword'

// Expose
module.exports = app;


// Bootstrap models
fs.readdirSync(models)
  .filter(file => ~file.search(/^[^\.].*\.js$/))
  .forEach(file => require(join(models, file)));

// Bootstrap routes
require('./config/passport')(passport);
require('./config/express')(app, passport);
require('./config/routes')(app, passport);

connect()
  .on('error', console.log)
  .on('disconnected', connect)
  .once('open', listen);

function listen () {
  if (app.get('env') === 'test') return;
  app.listen(port);
  console.log('Express app started on port ' + port);
}

function connect () {
  var options = { promiseLibrary: require('bluebird'), server: { socketOptions: { keepAlive: 1 } } };
  return mongoose.connect(config.db, options).connection;
}







