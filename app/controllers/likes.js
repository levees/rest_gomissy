'use strict';

/**
 * Module dependencies.
 */

const { wrap: async } = require('co');
const func = require('../../config/function');
const only = require('only');
const _ = require('underscore');
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
 * Get # of likes 
 */

exports.get = function(req, res) {
  var likes = { like: 0, dislike: 0 };
  if (req.article.likes.length > 0) {
    likes = _.countBy(req.article.likes, function(obj) {
      return obj.like % 2 == 0 ? 'dislike': 'like';
    });
  }

  res.json({ result: true, data: likes });
}

/**
 * List likes
 */

exports.list = function (req, res) {
  const article = req.article;
  res.json({ result: true, data: article.likes });
};

/**
 * Create like
 */

exports.create = async(function* (req, res) {
  const article = req.article;
  var liked = false;

  liked = _.find(article.likes, function(item) {
    console.log(item.user._id.toString(), req.user.id)
    return item.user._id.toString() == req.user.id;
  });

  var like = {
    like: req.body.like,
    user: req.user.id,
    ip_address: func.getIPAddr()
  };

  if (liked) 
    yield article.updateLike(liked.id, like);
  else 
    yield article.addLike(like);

  var likes = { like: 0, dislike: 0 };
  likes = _.countBy(req.article.likes, function(obj) {
    return obj.like % 2 == 0 ? 'dislike': 'like';
  });

  res.json({ result: true, data: likes });
});


/**
 * Update like
 */

exports.update = async(function* (req, res) {
  const article = req.article;
  yield article.updateLike(req.like.id, req.body.like);
  res.json({ result: true, data: article.likes });
});

/**
 * Delete like
 */

exports.destroy = async(function* (req, res) {
  yield req.article.removeLike(req.params.like_id);
  res.json({ result: true, like_id: req.params.like_id });
});
