'use strict';

/**
 * Module dependencies.
 */

const path = require('path');


/**
 * Expose
 */

const defaults = {
  root: path.join(__dirname, '..'),
  secret: 'cdnetworks',
  db: 'mongodb://localhost/notification'
};


module.exports = {
  development: Object.assign({

  }, defaults),
  test: Object.assign({

  }, defaults),
  production: Object.assign({

  }, defaults)
}[process.env.NODE_ENV || 'development'];
