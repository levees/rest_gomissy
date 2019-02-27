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
const Article = mongoose.model('Article');
const Event = mongoose.model('Event');
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

exports.load = async(function* (req, res, next, article_id) {
  try {
    req.article = yield Article.load(article_id);
    if (!req.article) return res.json({ result: false, errors: [new Error('Article not found')] });  
  } catch (err) {
    return next(err);
  }
  next();
});


/**
 * Index
 */

exports.index = async(function* (req, res) {
  respond(res, 'articles/index', {
    pagetitle: res.locals.menu.current.title,
    breadcrumbs: req.breadcrumbs(),

  });
});

/**
 * View counting
 */

exports.viewcount = async(function* (req, res) {
  yield Article.viewcount(req.params.article_id);
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

  const articles = yield Article.list(options);
  const count = yield Article.count(options.criteria);

  return res.status(200).json({
    result: true,
    data: articles,
    pageinfo: { current: page + 1, total: Math.ceil(count / limit), block: limit, totalitems: count }
  });
});


/**
 * Create an article
 * Upload an image
 */

exports.create = async(function* (req, res) {
  const article = new Article(only(req.body, 'title body tags'));
  _.extend(article, {
    user: req.user.id,
    menu: req.menu.current._id,
    body: func.bodyWithImgs(req.body.content, req.menu.current.path, 'http://localhost:8088/uploads'),
    ip_address: func.getIPAddr(),
    is_community: true
  });

  article.save(function (err) {
    if (err) return res.status(422).json({ result: false, message: err.errors });
    return res.status(200).json({ result: true, data: article });
  });
});


/**
 * Update article
 */

exports.update = async(function* (req, res){
  const article = req.article;
  assign(article, only(req.body, 'title body tags'));
  _.extend(article, {
    body: func.bodyWithImgs(req.body.content, req.menu.current.path, 'http://localhost:8088/uploads'),
    ip_address: func.getIPAddr(),
  });

  var updated_article = _detail(req);
  _.extend(article, { body: func.bodyWithImgs(req.body.content, req.menu.current.path, 'http://localhost:8088/uploads') });
  
  article.save(function (err) {
    if (err) return res.status(422).json({ result: false, message: err.errors });
    return res.status(200).json({ result: true, data: updated_article });
  });

  // try {
  //   yield article.uploadAndSave(req.file);
  //   return res.status(200).json({ result: true, data: article });
  // } catch (err) {
  //   return res.status(422).json({ result: false, errors: [err.toString()] });
  // }
});

/**
 * Detail
 */

exports.detail = async(function* (req, res){
  // var likes = { like: 0, dislike: 0 };
  // if (req.article.likes.length > 0) {
  //   likes = _.countBy(req.article.likes, function(obj) {
  //     return obj.like % 2 == 0 ? 'dislike': 'like';
  //   });
  // }

  // var article = {
  //   menu: req.article.menu,
  //   user: req.article.user,
  //   ip_address: req.article.ip_address,
  //   title: req.article.title,
  //   body: req.article.body,
  //   comments: req.article.comments,
  //   likes: likes,
  //   // likes: {
  //   //   like: likes.like,
  //   //   dislike: likes.dislike,
  //   //   posted: likes_posted
  //   // },
  //   tags: req.article.tags,
  //   views: req.article.views,
  //   created_at: req.article.created_at,
  //   owner: (req.user && req.article.user._id.toString() === req.user.id) ? true : false,
  //   level: (req.user) ? req.user.level : 0
  // };
  var article = _detail(req);
  return res.json ({ result: true, data: article });
});

var _detail = function(req) {
  var likes = { like: 0, dislike: 0 };
  if (req.article.likes.length > 0) {
    likes = _.countBy(req.article.likes, function(obj) {
      return obj.like % 2 == 0 ? 'dislike': 'like';
    });
  }

  return {
    menu: req.article.menu,
    user: req.article.user,
    ip_address: req.article.ip_address,
    title: req.article.title,
    body: req.article.body,
    comments: req.article.comments,
    likes: likes,
    // likes: {
    //   like: likes.like,
    //   dislike: likes.dislike,
    //   posted: likes_posted
    // },
    tags: req.article.tags,
    views: req.article.views,
    created_at: req.article.created_at,
    owner: (req.user && req.article.user._id.toString() === req.user.id) ? true : false,
    level: (req.user) ? req.user.level : 0
  };
}

/**
 * Delete an article
 */

exports.destroy = async(function* (req, res) {
  console.log(req.article);
  var article = req.article;
  console.log(article);
  article.remove(function (err){
    console.log('err', err)
    if (err) return res.json({ result: false, errors: [err.toString()] });
    return res.json({ result: true });
  });
});







