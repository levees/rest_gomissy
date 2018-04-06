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
    type: Boolean
  },
  post: {
    type: Number,
    default: 100  // Odinary user from 101, Admin user from 1001, If user level above this value then can be posted article
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

  // load: function (path) {
  //   var menus = this.findOne({ path: path }, function(err, obj) {
  //     return obj;
  //     // return {"err": err, "obj": obj};
  //     // req.currPage = obj;
  //     // return obj ? true : false;
  //     // console.log("Menu Obj");
  //     // console.log(err);
  //   });
  // },

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
