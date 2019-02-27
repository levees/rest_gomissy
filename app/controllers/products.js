'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const only = require('only');
const _ = require('underscore');
const { wrap: async } = require('co');
const config = require('../../config/config');
const func = require('../../config/function');
const Product = mongoose.model('Product');
const assign = Object.assign;
// const multer = require('multer')
// const upload = multer({ dest: 'uploads/' })
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const shortId = require('id-shorter');



/**
 * Load
 */

exports.load = async(function* (req, res, next, product_id) {
  try {
    req.product = yield Product.load(product_id);
    if (!req.product) return res.json({ result: false, errors: [new Error('Product not found')] });  
  } catch (err) {
    return next(err);
  }
  next();
});


/**
 * Index
 */

exports.index = async(function* (req, res) {
  respond(res, 'product/index', {
    pagetitle: res.locals.menu.current.title,
    breadcrumbs: req.breadcrumbs(),

  });
});

/**
 * View counting
 */

exports.viewcount = async(function* (req, res) {
  yield Product.viewcount(req.params.product_id);
  res.json({ result: true });
});

/**
 * List
 */

exports.list = async(function* (req, res) {
  const menu = req.params.menu;
  const page = (req.query.page > 0 ? req.query.page : 1) - 1;
  const _id = req.query.item;
  const limit = 20;
  const options = {
    criteria: { menu: req.menu.current._id },
    limit: limit,
    page: page
  };

  if (_id) options.criteria = { _id };

  const products = yield Product.list(options);
  const count = yield Product.count(options.criteria);

  return res.status(200).json({
    result: true,
    data: products,
    pageinfo: { current: page + 1, total: Math.ceil(count / limit), block: limit, totalitems: count }
  });
});


/**
 * Create an product
 * Upload an image
 */

exports.create = async(function* (req, res) {
  const product = new Product(only(req.body, 'title body tags'));
  _.extend(product, {
    user: req.user.id,
    menu: req.menu.current._id,
    body: func.bodyWithImgs(req.body.content, req.menu.current.path, 'http://localhost:8088/uploads'),
    ip_address: func.getIPAddr(),
    is_community: true
  });

  product.save(function (err) {
    if (err) return res.status(422).json({ result: false, message: err.errors });
    return res.status(200).json({ result: true, data: product });
  });
});


/**
 * Update product
 */

exports.update = async(function* (req, res){
  const product = req.product;
  assign(product, only(req.body, 'title body tags'));
  _.extend(product, {
    body: func.bodyWithImgs(req.body.content, req.menu.current.path, 'http://localhost:8088/uploads'),
    ip_address: func.getIPAddr(),
  });

  var updated_product = _detail(req);
  _.extend(product, { body: func.bodyWithImgs(req.body.content, req.menu.current.path, 'http://localhost:8088/uploads') });
  
  product.save(function (err) {
    if (err) return res.status(422).json({ result: false, message: err.errors });
    return res.status(200).json({ result: true, data: updated_product });
  });

  // try {
  //   yield product.uploadAndSave(req.file);
  //   return res.status(200).json({ result: true, data: product });
  // } catch (err) {
  //   return res.status(422).json({ result: false, errors: [err.toString()] });
  // }
});

/**
 * Detail
 */

exports.detail = async(function* (req, res){
  // var likes = { like: 0, dislike: 0 };
  // if (req.product.likes.length > 0) {
  //   likes = _.countBy(req.product.likes, function(obj) {
  //     return obj.like % 2 == 0 ? 'dislike': 'like';
  //   });
  // }

  // var product = {
  //   menu: req.product.menu,
  //   user: req.product.user,
  //   ip_address: req.product.ip_address,
  //   title: req.product.title,
  //   body: req.product.body,
  //   comments: req.product.comments,
  //   likes: likes,
  //   // likes: {
  //   //   like: likes.like,
  //   //   dislike: likes.dislike,
  //   //   posted: likes_posted
  //   // },
  //   tags: req.product.tags,
  //   views: req.product.views,
  //   created_at: req.product.created_at,
  //   owner: (req.user && req.product.user._id.toString() === req.user.id) ? true : false,
  //   level: (req.user) ? req.user.level : 0
  // };
  var product = _detail(req);
  return res.json ({ result: true, data: product });
});

var _detail = function(req) {
  var likes = { like: 0, dislike: 0 };
  if (req.product.likes.length > 0) {
    likes = _.countBy(req.product.likes, function(obj) {
      return obj.like % 2 == 0 ? 'dislike': 'like';
    });
  }

  return {
    menu: req.product.menu,
    user: req.product.user,
    ip_address: req.product.ip_address,
    title: req.product.title,
    body: req.product.body,
    comments: req.product.comments,
    likes: likes,
    // likes: {
    //   like: likes.like,
    //   dislike: likes.dislike,
    //   posted: likes_posted
    // },
    tags: req.product.tags,
    views: req.product.views,
    created_at: req.product.created_at,
    owner: (req.user && req.product.user._id.toString() === req.user.id) ? true : false,
    level: (req.user) ? req.user.level : 0
  };
}

/**
 * Delete an product
 */

exports.destroy = async(function* (req, res) {
  console.log(req.product);
  var product = req.product;
  console.log(product);
  product.remove(function (err){
    console.log('err', err)
    if (err) return res.json({ result: false, errors: [err.toString()] });
    return res.json({ result: true });
  });
});







