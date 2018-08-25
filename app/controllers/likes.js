'use strict';

/**
 * Module dependencies.
 */

const { wrap: async } = require('co');
const func = require('../../config/function');
const only = require('only');
const assign = Object.assign;
// const { respond, respondOrRedirect } = require('../../config/respond');

/**
 * Load like
 */

exports.load = function (req, res, next, id) {
  req.like = req.article.likes.find(like => like.id === id);
  if (!req.like) return res.json({ result: false, errors: ['Like not found'] });
  next();
};

/**
 * List likes
 */

exports.list = function (req, res) {
  const article = req.article;
  res.json({ result: true, likes: article.likes });
};

/**
 * Create like
 */

exports.create = async(function* (req, res) {
  const article = req.article;
  var like = {
    like: req.body.like,
    user: req.user.id,
    ip_address: func.getIPAddr()
  };
  yield article.addLike(like);
  res.json({ result: true, likes: article.likes });
});


/**
 * Update like
 */

exports.update = async(function* (req, res) {
  const article = req.article;
  yield article.updateLike(req.like.id, req.body.like);
  res.json({ result: true, likes: article.likes });
});

/**
 * Delete like
 */

exports.destroy = async(function* (req, res) {
  yield req.article.removeLike(req.params.like_id);
  res.json({ result: true, like_id: req.params.like_id });
});
