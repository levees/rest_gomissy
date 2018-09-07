'use strict';

/*
 * Goodfriends web application : node.js, express, mongodb
 * Copyright(c) Gomissy 2017 Bryan.Oh
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
const port = process.env.PORT || 8088;
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
  var options = {
    useMongoClient: true,
    reconnectTries: Number.MAX_VALUE,
    poolSize: 10,
    // useNewUrlParser: true,
    // server: {
    //   socketOptions: {
    //     socketTimeoutMS: 0,
    //     keepAlive: true
    //   },
    //   reconnectTries: 30
    // }
  };
  mongoose.Promise = global.Promise;
  mongoose.connect(config.db, options);
  return mongoose.connection;
}
