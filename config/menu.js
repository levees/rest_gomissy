'use strict';

/*
 * Module dependencies.
 */

const mongoose = require('mongoose');
const Menu = mongoose.model('Menu');


/*
 *  Generic require login routing middleware
 */

exports.hasMenu = function (req, res, next) {
  const menus = Menu.load(req.params.menu);
  console.log(menus);
  // if (req.isAuthenticated()) return next();
  // if (req.method == 'GET') req.session.returnTo = req.originalUrl;
  // res.redirect('/login');
  next();
};

