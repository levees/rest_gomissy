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
  // const menus = Menu.load(req.params.menu);
  console.log(req.params.menu)
  Menu.findOne({ "path": req.params.category, "sub_menu.path": req.params.menu }).populate("sub_menu").exec(function(err, menu) {
    // req.breadcrumbs(menu.title, menu.path + '/' + menu.sub_menu[0].path);
    // console.log(menu)

    var currMenu = Menu.findOne({"sub_menu": {"$elemMatch": {"path": req.params.menu}}}, {"sub_menu.$": 1, _id: 0})
    console.log(currMenu.sub_menu)

    if (menu) {
      // req.currentMenu = menu.sub_menu[0];
      // req.parentMenu = menu
      req.breadcrumbs(menu.sub_menu[0].title, menu.path + '/' + menu.sub_menu[0].path );
      res.locals.menu = { "parent": menu, "current": menu.sub_menu[0] }
      // console.log("### res.locals.menu")
      // console.log(res.locals.menu)
      next();
    }
    else {
      res.redirect('/');
    }
  });
};
