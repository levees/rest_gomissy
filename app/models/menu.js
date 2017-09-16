'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Menu Schema
 */

const MenuSchema = new Schema({
  title: {
    type: String
  },
  sub_menu: [
    {
      type: Schema.ObjectId,
      ref: 'Menu'
    }
  ],
  path: {
    type: String
  },
  auth: {
    type: String
  },
  used_in: {
    type: Boolean,
    default: true
  }
});


MenuSchema.statics = {

  /**
   * Find menu by path
   *
   * @param String path
   * @api private
   */

  load: function (path) {
    return this.findOne({ path: path }, function(err, obj) {
      console.log(obj);
    });
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
      .populate('user', 'name username')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * page)
      .exec();
  }
};

mongoose.model('Menu', MenuSchema);
