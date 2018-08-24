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
const { respond, respondOrRedirect } = require('../../config/respond');
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

exports.load = async(function* (req, res, next, id) {
  var ids = id.split('-');
  var id = ids[ids.length - 1];
  var shortid = shortId({ isFullId: true });
  var decoded_id = shortid.decode(id);

  try {
    req.article = yield Article.load(decoded_id);
    if (!req.article) return next(new Error('Article not found'));
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
    criteria: { menu: req.menu._id },
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
    menu: req.menu._id,
    body: bodyWithImgs(req.body.body, req.menu.path),
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
  respond(res, 'articles/show', {
    pagetitle: res.locals.menu.current.title,
    breadcrumbs: req.breadcrumbs(),
    article: req.article,
    moment: moment
  });
});

/**
 * Delete an article
 */

exports.destroy = async(function* (req, res) {
  yield req.article.remove();
  respondOrRedirect({ req, res }, '/articles', {}, {
    type: 'info',
    text: 'Deleted successfully'
  });
});


/**
 * body with image tag from summernode data
 */

var bodyWithImgs = function(htmlText, board, pathToSaveImg = 'public/uploads', baseUrl = '', append = true) {
  var htmlWithImgUrls  = htmlText.replace(/src=\"data:([^\"]+)\"/gi,function(matches){
    var splitted =  (matches).split(';');
    var contentType = splitted[0];
    var encContent = splitted[1];
    var imgBase64 = encContent.substr(6);
    if (encContent.substr(0,6) != 'base64') {
      return matches;
    }
    // var imgFilename = imgBase64.substr(1,8).replace(/[^\w\s]/gi, '') + Date.now() + String(Math.random() * (900000000)).replace('.',''); // Generate a unique filename
    var imgFilename = board.toLowerCase() + moment().format('YYYYMMDD') + String(Math.random() * (900000000)).replace('.','');
    var imgExt = '';
    switch(contentType.split(':')[1]) {
        case 'image/jpeg': imgExt = 'jpg'; break;
        case 'image/gif': imgExt = 'gif'; break;
        case 'image/png': imgExt = 'png'; break;
        default: return matches;
    }
    if (!fs.existsSync(pathToSaveImg)){
        fs.mkdirSync(pathToSaveImg);
    }
    var imgPath = path.join(path.join(process.cwd(), pathToSaveImg), imgFilename + '.' + imgExt);
    var base64Data = encContent.replace(/^base64,/, "");
    fs.writeFile(imgPath, base64Data, 'base64', function(err) {
      console.log(err); // Something went wrong trying to save Image
    });

    if(baseUrl){
      var formattedBaseUrl = (((baseUrl[baseUrl.len - 1]) == '/')? baseUrl : (baseUrl+'/'));
    }
    else{
      var formattedBaseUrl = '/';
    }
    if (append){
      return 'src="'+formattedBaseUrl+pathToSaveImg+'/'+imgFilename+'.'+imgExt+'"';
    }
    else {
      return 'src="'+formattedBaseUrl+imgFilename+'.'+imgExt+'"';
    }
  });
  return htmlWithImgUrls;
};
