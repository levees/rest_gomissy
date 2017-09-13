'use strict';

/**
 * Module dependencies.
 */

const config = require('../../config/config');
const { respond, respondOrRedirect } = require('../../config/respond');
const mongoose = require('mongoose');

exports.index = function(req, res, next) {
  // req.breadcrumbs('test', '/test');
  // console.log(res.locals);
  respond(res, 'home/index', {
    pagetitle: 'Home',
    breadcrumbs: req.breadcrumbs()
  });

};

exports.test = function(req, res, next) {
  console.log(req.params);

  

  if (req.params.format == '.json')
    res.json('{aaa:bbb}');
  else
    res.render('home/test'); 
};




var list = function() {

};