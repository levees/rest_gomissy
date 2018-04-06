'use strict';

/**
 * Module dependencies.
 */

const path = require('path');

/**
 * Expose
 */

const defaults = {
  baseUrl: 'www.goodfriends.co',
  root: path.join(__dirname, '..'),
  secret: 'goodfriends',
  db: 'mongodb://appadmin:appadmin0328@ds143900.mlab.com:43900/heroku_dkh2tkbf',
  // db: 'mongodb://localhost/goodfriends',
  notifier: {
    service: 'postmark', // or 'sendgrid'
    APN: false,
    email: true,
    tplType: 'ejs', // if you want to use ejs as templating system
    actions: ['activation', 'comment'],
    tplPath: path.join(__dirname, '../app/mailer/templates'), //require('path').resolve(__dirname, './templates'),
    key: 'SERVICE_KEY',
    sendgridUser: 'SENDGRID_USER',
    parseAppId: 'APP_ID',
    parseApiKey: 'MASTER_KEY'
  },
  smtp: {
    service: "Gmail",
    host: 'smtp.gmail.com',
    //secureConnection: true,
    //port: 465,
    auth: {
      user: 'reafy.team@gmail.com',
      pass: 'Reafy0426'
      //user: "noreply@gmail.com",
      //pass: "gomissyinc"
    }
  }
};


module.exports = {
  development: Object.assign({

  }, defaults),
  test: Object.assign({

  }, defaults),
  production: Object.assign({
    // db: 'mongodb://appadmin:appadmin0328@ds143900.mlab.com:43900/heroku_dkh2tkbf'
  }, defaults)
}[process.env.NODE_ENV || 'development'];
