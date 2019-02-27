'use strict';

/**
 * Module dependencies.
 */

const path = require('path');

/**
 * Expose
 */

const defaults = {
  baseUrl: 'api.gomissy.com',
  root: path.join(__dirname, '..'),
  secret: 'gomissy',
  db: 'mongodb://54.215.185.175/gomissy_dev',
  // db: 'mongodb://localhost/goodfriends',
  // notifier: {
  //   service: 'postmark', // or 'sendgrid'
  //   APN: false,
  //   email: true,
  //   tplType: 'ejs', // if you want to use ejs as templating system
  //   actions: ['activation', 'comment'],
  //   tplPath: path.join(__dirname, '../app/mailer/templates'), //require('path').resolve(__dirname, './templates'),
  //   key: 'SERVICE_KEY',
  //   sendgridUser: 'SENDGRID_USER',
  //   parseAppId: 'APP_ID',
  //   parseApiKey: 'MASTER_KEY'
  // },
  smtp: {
    service: "Zoho",
    host: 'smtp.zoho.com',
    secureConnection: true,
    port: 465,
    auth: {
      user: "noreply@gomissy.com",
      pass: "@g0missy"
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
