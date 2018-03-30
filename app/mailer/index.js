'use strict';

/**
 * Module dependencies.
 */

const Notifier = require('notifier');
const config = require('../../config/config');

/**
 * Process the templates using swig - refer to notifier#processTemplate method
 *
 * @param {String} tplPath
 * @param {Object} locals
 * @return {String}
 * @api public
 */

Notifier.prototype.processTemplate = function (tplPath, locals) {
  locals.filename = tplPath;
  return jade.renderFile(tplPath, locals);
};

/**
 * Expose
 */

module.exports = {

  /**
   * Activation notification
   *
   * @param {Object} options
   * @param {Function} cb
   * @api public
   */

   activation: function(options, callback) {
     var user = options
     const notifier = new Notifier(config.notifier);

     const obj = {
       to: user.email,
       from: 'noreply@goodfriends.co',
       subject: 'Congrat! Welcome to Goodfriends.',
       // alert: user.name + ' says: "' + options.comment,
       locals: {
         to: user.name,
         from: "goodfriends team",
         body: "test body"
       }
     };

     // for apple push notifications
     /*notifier.use({
       APN: true
       parseChannels: ['USER_' + author._id.toString()]
     })*/

     try {
       notifier.send('activation', obj, cb);
     } catch (err) {
       console.log(err);
     }
   },



  /**
   * Comment notification
   *
   * @param {Object} options
   * @param {Function} cb
   * @api public
   */

  comment: function (options, cb) {
    const article = options.article;
    const author = article.user;
    const user = options.currentUser;
    const notifier = new Notifier(config.notifier);

    const obj = {
      to: author.email,
      from: 'your@product.com',
      subject: user.name + ' added a comment on your article ' + article.title,
      alert: user.name + ' says: "' + options.comment,
      locals: {
        to: author.name,
        from: user.name,
        body: options.comment,
        article: article.name
      }
    };

    // for apple push notifications
    /*notifier.use({
      APN: true
      parseChannels: ['USER_' + author._id.toString()]
    })*/

    try {
      notifier.send('comment', obj, cb);
    } catch (err) {
      console.log(err);
    }
  }
};
