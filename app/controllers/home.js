'use strict';

/**
 * Module dependencies.
 */

const config = require('../../config/config');
const mongoose = require('mongoose');

exports.index = function(req, res, next) {
  req.breadcrumbs('test', '/test');
  console.log(JSON.stringify(req.breadcrumbs));
  res.render('home/index', {
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