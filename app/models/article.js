'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const notify = require('../mailer');

// const Imager = require('imager');
// const config = require('../../config');
// const imagerConfig = require(config.root + '/config/imager.js');

const Schema = mongoose.Schema;
const getTags = tags => tags.join(',');
const setTags = tags => tags.split(',');


/**
 * Comment Schema
 */

const CommentSchema = new Schema({
  body: {
    type: String,
    default: ''
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    index: true
  },
  ip_address: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

/**
 * Like Schema
 */

const LikeSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    index: true
  },
  like: {
    type: Number,
    default: 0
  },
  ip_address: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

/**
 * Article Schema
 */

const ArticleSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    index: true
  },
  menu: {
    type: Schema.ObjectId,
    ref: 'Menu.sub_menu',
    index: true
  },
  title: {
    type: String,
    default: '',
    required: true,
    trim: true
  },
  body: {
    type: String,
    default: '',
    trim: true
  },
  comments: [CommentSchema],
  likes: [LikeSchema],
  tags: {
    type: [],
    get: getTags,
    set: setTags,
    trim: true
  },
  is_community: {
    type: Boolean,
    default: true
  },
  is_log: {
    type: Boolean,
    default: false
  },
  ip_address: {
    type: String,
    default: ''
  },
  created_at  : {
    type : Date,
    default : Date.now
  }
});

/**
 * Event Schema
 */

const EventSchema = new Schema({
  place: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  location: {
    lattitude: { type: Number },
    longitude: { type: Number }
  },
  begin_at: {
    type: Date
  },
  period: {
    type: Number
  },
  price: {
    type: Number,
    default: 0
  },
  limit: {
    type: Number
  },
  attendee: [{
    user: {
      type: Schema.ObjectId,
      ref: 'User',
      index: true
    }
  }]
});

/**
 * Validations
 */

ArticleSchema.path('title').required(true, 'Article title cannot be blank');
ArticleSchema.path('body').required(true, 'Article body cannot be blank');
EventSchema.path('address').required(true, 'Address cannot be blank');
EventSchema.path('begin_at').required(true, 'Event date cannot be blank');


/**
 * Pre-remove hook
 */

ArticleSchema.pre('remove', function (next) {
  // const imager = new Imager(imagerConfig, 'S3');
  // const files = this.image.files;

  // if there are files associated with the item, remove from the cloud too
  // imager.remove(files, function (err) {
  //   if (err) return next(err);
  // }, 'article');

  next();
});

/**
 * Methods
 */

ArticleSchema.methods = {

  /**
   * Add comment
   *
   * @param {User} user
   * @param {Object} comment
   * @api private
   */

  addComment: function (user, comment) {
    this.comments.push({
      body: comment.body,
      user: user._id
    });

    if (!this.user.email) this.user.email = 'email@product.com';

    notify.comment({
      article: this,
      currentUser: user,
      comment: comment.body
    });

    return this.save();
  },

  /**
   * Remove comment
   *
   * @param {commentId} String
   * @api private
   */

  removeComment: function (commentId) {
    const index = this.comments
      .map(comment => comment.id)
      .indexOf(commentId);

    if (~index) this.comments.splice(index, 1);
    else throw new Error('Comment not found');
    return this.save();
  }
};

/**
 * Statics
 */

ArticleSchema.statics = {

  /**
   * Find article by id
   *
   * @param {ObjectId} id
   * @api private
   */

  load: function (_id) {
    return this.findOne({ _id })
      .populate('user', 'name email username')
      .populate('event')
      .populate('comments.user')
      .exec();
  },

  /**
   * List articles
   *
   * @param {Object} options
   * @api private
   */

  list: function (options) {
    const criteria = options.criteria || {};
    const page = options.page || 0;
    const limit = options.limit || 30;
    return this.find(criteria)
      .populate('event')
      .populate('user')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * page)
      .exec();
  }
};

mongoose.model('Article', ArticleSchema);
mongoose.model('Event',   EventSchema);
mongoose.model('Comment', CommentSchema);
