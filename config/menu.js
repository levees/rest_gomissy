'use strict';

/*
 * Module dependencies.
 */

const mongoose = require('mongoose');
const Menu = mongoose.model('Menu');


/*
 *  Generic require login routing middleware
 */

exports.has_menu = function (req, res, next) {
  Menu.findOne({ "path": req.params.category }).populate("sub_menus").exec(function(err, menus) {
    if (err || menus == null) return res.status(403).send({ success: false, errors: ['Invalid request.'] });
    if (req.params.menu) {
      var menu = menus.sub_menus.find(function(e){ return e.path == req.params.menu })
      if (menu) {
        req.menu = { "parent": menus, "current": menu }
        return next();
      }
      else {
        return res.status(403).json({ success: false, errors: ['Invalid request.'] });
      }
    }
    req.menu = { "parent": null, "current": menus }
    return next();
  });
};

exports.access_menu = function (req, res, next) {
  if (!req.menu.current.auth) return next();
  if (req.user) return next();
  return res.status(401).json({ result: false, errors: ['No permission.'] });
};


exports.topmenu = function (req, res, next) {
  Menu.find({ "used_in": true }).exec(function(err, menus) {
    if (err) return res.status(403).send({ success: false, errors: ['Invalid request.'] });
    return res.json({ menus: menus });
  });
};

exports.submenu = function (req, res, next) {
  Menu.findOne({ "path": req.params.menu_path, "used_in": true }).populate("sub_menus").exec(function(err, menus) {
    if (err) return res.status(403).send({ success: false, errors: ['Invalid request.'] });
    return res.json({ menus: menus.sub_menus });
  });
};
