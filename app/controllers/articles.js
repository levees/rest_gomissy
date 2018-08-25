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
// const { respond, respondOrRedirect } = require('../../config/respond');
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
 * List
 */

exports.list = async(function* (req, res) {
  const menu = req.params.menu;
  const page = (req.query.page > 0 ? req.query.page : 1) - 1;
  const _id = req.query.item;
  const limit = 30;
  const options = {
    criteria: { menu: req.menu.current._id },
    limit: limit,
    page: page
  };

  if (_id) options.criteria = { _id };

  const articles = yield Article.list(options);
  const count = yield Article.count(options.criteria);

  return res.json({
    articles: articles,
    page: { current: page + 1, total: Math.ceil(count / limit), block: limit }
  });
});


/**
 * Create an article
 * Upload an image
 */

exports.create = async(function* (req, res) {
  const article = new Article(only(req.body, 'title body tags'));
  _.extend(article, {
    user: req.user_id,
    menu: req.menu.current._id,
    body: func.bodyWithImgs(req.body.body, req.menu.current.path),
    ip_address: func.getIPAddr(),
    is_community: true
  });

  article.save(function(err) {
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
  try {
    yield article.uploadAndSave(req.file);
    return res.status(200).json({ result: true, data: article });
  } catch (err) {
    return res.status(422).json({ result: false, errors: [err.toString()] });
  }
});

/**
 * Detail
 */

exports.detail = async(function* (req, res){
  return res.json ({ result: true, data: req.article });
});

/**
 * Delete an article
 */

exports.destroy = async(function* (req, res) {
  try {
    yield req.article.remove();
    return res.status(200).json({ result: true });
  } catch (err) {
    return res.status(422).json({ result: false, errors: [err.toString()] });
  }
});



