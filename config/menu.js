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
  console.log(req.params.category)
  Menu.findOne({ "path": req.params.category }).populate("sub_menu").exec(function(err, menus) {
    if (req.params.menu !== undefined) {
      var menu = menus.sub_menu.find(function(e){ return e.path == req.params.menu })
      if (menu) {
        req.breadcrumbs(menu.title, menus.path + '/' + menu.path );
        res.locals.menu = { "parent": menus, "current": menu }
        // console.log(res.locals.menu)
        return next();
      }
    }
    req.breadcrumbs(menus.title, menus.path );
    res.locals.menu = { "parent": null, "current": menus }
    return next();
  });
};
