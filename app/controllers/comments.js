'use strict';

/**
 * Module dependencies.
 */

const { wrap: async } = require('co');
const func = require('../../config/function');
// const { respond, respondOrRedirect } = require('../../config/respond');

/**
 * Load comment
 */

exports.load = function (req, res, next, id) {
  req.comment = req.article.comments.find(comment => comment.id === id);
  if (!req.comment) return res.json({ result: false, errors: ['Comment not found'] });
  next();
};

/**
 * List comments
 */

exports.list = function (req, res) {
  const article = req.article;
  res.json({ result: true, comments: article.comments });
};

/**
 * Create comment
 */

exports.create = async(function* (req, res) {
  const article = req.article;
  var comment = {
    body: func.bodyWithImgs(req.body.body, req.menu.current.path),
    user: req.user.id,
    ip_address: func.getIPAddr()
  };
  yield article.addComment(comment);
  res.json({ result: true, comments: article.comments });
  // respondOrRedirect({ res }, `/articles/${article._id}`, article.comments[0]);
});

/**
 * Delete comment
 */

exports.destroy = async(function* (req, res) {
  yield req.article.removeComment(req.params.comment_id);
  res.json({ result: true, comment_id: req.params.comment_id });
});
