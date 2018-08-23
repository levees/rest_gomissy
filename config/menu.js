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
  console.log(req.params.category, req.params.menu)
  Menu.findOne({ "path": req.params.category, "sub_menu.path": req.params.menu }).exec(function(err, menu) {
    if (err) return res.status(403).send({ success: false, message: 'Invalid request.' });
    if (menu == null) return res.status(401).send({ success: false, message: 'Invalid request.' });
    req.menu = menu;
    next();
  });
};
