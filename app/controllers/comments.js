'use strict';

/**
 * Module dependencies.
 */

const _ = require('underscore');
const { wrap: async } = require('co');
const func = require('../../config/function');
// const { respond, respondOrRedirect } = require('../../config/respond');

/**
 * Load comment
 */

exports.load = function (req, res, next, id) {
  req.comment = req.article.comments.find(comment => comment.id === id);
  if (!req.comment) {
    var replies = _.flatten(_.pluck(req.article.comments, 'replies'));
    req.comment = _.find(replies,function(child){ return child.id == id });
  }

  if (!req.comment) {
    return res.json({ result: false, errors: ['Comment not found'] });
  }
  next();
};

/**
 * List comments
 */

exports.list = function (req, res) {
  const article = req.article;
  res.json({ result: true, data: article.comments });
};

/**
 * Create comment
 */

exports.create = async(function* (req, res) {
  const article = req.article;
  var comment = {
    body: func.bodyWithImgs(req.body.body, req.menu.current.path, 'http://localhost:8088/uploads'),
    user: _.extend(req.user, {_id: req.user.id}),
    ip_address: func.getIPAddr()
  };
  
  yield article.addComment(comment);
  res.json({ result: true, data: article.comments });
  // respondOrRedirect({ res }, `/articles/${article._id}`, article.comments[0]);
});

/**
 * Reply comment
 */

exports.reply = async(function* (req, res) {
  const article = req.article;
  var comment = {
    body: func.bodyWithImgs(req.body.body, req.menu.current.path, 'http://localhost:8088/uploads'),
    user: _.extend(req.user, {_id: req.user.id}),
    ip_address: func.getIPAddr()
  };
  
  yield article.replyComment(req.params.comment_id, comment);
  res.json({ result: true, data: article.comments });
});

/**
 * Delete comment
 */

exports.destroy = async(function* (req, res) {
  // console.log('comment', req.comment);

  if (req.comment.parent)
    yield req.article.removeReply(req.params.comment_id, req.comment.parent);
  else
    yield req.article.removeComment(req.params.comment_id);
  
  // res.json({ result: true, comment_id: req.params.comment_id });
  res.json({ result: true, data: req.article.comments });
});

/**
 * Like comment
 */

exports.like = async(function* (req, res) {
  var liked = true, parent_idx = null, index = null;

  if (req.comment.parent) {
    parent_idx = _.map(req.article.comments, function(item) { return item.id }).indexOf(req.comment.parent.toString());
    var index = _.map(req.article.comments[parent_idx].replies, function(item) { return item.id }).indexOf(req.params.comment_id);

    if (~parent_idx && ~index) {
      liked = _.map(req.article.comments[parent_idx].replies[index].likes, function(item) { return item.user.toString() }).indexOf(req.user.id);
      // liked = _.find(req.article.comments[parent_idx].replies[index].likes, function(item) {
      //   return item.user.toString() == req.user.id;
      // });
    }
  }
  else {
    index = _.map(req.article.comments, function(item) { return item.id }).indexOf(req.params.comment_id);

    liked = _.map(req.article.comments[index].likes, function(item) { return item.user.toString() }).indexOf(req.user.id);
    // liked = _.find(req.article.comments[index].likes, function(item) {
    //   return item.user.toString() == req.user.id;
    // });
  }

  if (~liked) 
    res.json({ result: false, data: req.article.comments });
  else {
    var like = {
      like: 1,
      user: req.user.id,
      ip_address: func.getIPAddr()
    };

    yield req.article.likeComment(req.params.comment_id, like, index, parent_idx);
    res.json({ result: true, data: req.article.comments });
  }
});
