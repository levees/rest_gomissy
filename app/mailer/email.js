/**
 * Module dependencies.
 */

const mongoose = require('mongoose')
const nodemailer = require('nodemailer')
const env = process.env.NODE_ENV || 'development'
const config = require('../../config/config')

var smtpTransport = nodemailer.createTransport(config.smtp);

/**
 * Notification methods
 */

var Email = {

  /**
   * Activation notification
   *
   * @param {Object} options
   * @param {Function} cb
   * @api public
   */

  confirmation: function(options, callback) {
    var user = options;
    smtpTransport.sendMail({
      from: "noreply <noreply@goodfriends.co>", // sender address
      to: '"' + user.name + '" <' + user.email + '>', // comma separated list of receivers
      subject: "Welcome to Goodfriends", // Subject line
      html: generateHtml.activation(user)
    }, function(error, response){
      if(error){
        console.log(error);
      }else{
        console.log("Message sent: " + response.response);
      }
    });
    callback();
  },


  /**
   * Reset password
   *
   * @param {Object} options
   * @param {Function} cb
   * @api public
   */

  resetpassword: function(options, callback) {
    var user = options;
    smtpTransport.sendMail({
      from: "noreply <noreply@goodfriends.co>", // sender address
      to: '"' + user.name + '" <' + user.email + '>', // comma separated list of receivers
      subject: "Goodfriends account password reset", // Subject line
      html: generateHtml.resetpassword(user)
    }, function(error, response){
      if(error){
        console.log(error);
      }else{
        console.log("Message sent: " + response.response);
      }
    });
    callback();
  },


  /**
   * notification for Comment, Like, Request Friend
   *
   * @param {Object} user
   * @param {Object} data
   * @api public
   */

  notification: function(user, data) {
    var subject = ''
    switch (data.kind) {
      case 'comment':
        subject = data.from.name.first + ' ' + data.from.name.last + ' 님이 내 포스트에 덧글을 남겼습니다.'
        break;
      case 'like':
        subject = data.from.name.first + ' ' + data.from.name.last + ' 님이 내 포스트에 이모티콘을 보냈습니다.'
        break;
      case 'photolike':
        subject = data.from.name.first + ' ' + data.from.name.last + ' 님이 내 사진에 이모티콘을 보냈습니다.'
        break;
      case 'friend':
        subject = data.from.name.first + ' ' + data.from.name.last + ' 님으로 부터 친구신청을 받았습니다.'
        break;
    }

    smtpTransport.sendMail({
      from: "noreply <noreply@gomissy.com>", // sender address
      to: '"' + user.name.first + ' ' + user.name.last + '" <' + user.email + '>', // comma separated list of receivers
      subject: subject, // Subject line
      html: generateHtml.notification(data)
    }, function(error, response){
      if(error){
        console.log(error);
      }else{
        console.log("Message sent: " + response.message);
      }
    });
  },



  /**
   * Comment notification
   *
   * @param {Object} options
   * @param {Function} cb
   * @api public
   */

  comment: function (options, cb) {
    var article = options.article
    var author = article.user
    var user = options.currentUser
    var notifier = new Notifier(config.notifier)

    //var obj = {
    //  to: author.email,
    //  from: 'your@product.com',
    //  subject: user.name + ' added a comment on your article ' + article.title,
    //  alert: user.name + ' says: "' + options.comment,
    //  locals: {
    //    to: author.name,
    //    from: user.name,
    //    body: options.comment,
    //    article: article.name
    //  }
    //}

    // for apple push notifications
    /*notifier.use({
      APN: true
      parseChannels: ['USER_' + author._id.toString()]
    })*/

    //notifier.send('comment', obj, cb)
  }
}


/**
 * Generate Htmls
 */
var generateHtml = {
  activation: function(user) {
    var html = '<div style="margin-top:0;margin-bottom:0;margin-right:0;margin-left:0;border-width:0;padding-top:30px;padding-bottom:30px;padding-right:30px;padding-left:30px">'
             + '<span style="color:#040407;font-size:24px">Hi ' + user.name + ',</span>'
             + '<br><br>'
             + 'Thanks for signing up and <span class="il">welcome</span> to Goodfriends.co! Login with the following information:'
             + '<br><br>'
             + 'Username: <b style="color:#040407">' + user.username + ', or your email address</b>'
             + '<br>'
             + 'Password: the password you used to create this account'
             + '<br><br>'
             + '<a href="http://www.goodfriends.co/login" style="background-color:#2d6cbe;background-image:none;background-repeat:repeat;background-position:top left;border-radius:4px;color:white;display:inline-block;font-size:20px;font-weight:normal;padding:10px 20px;text-decoration:none" target="_blank">Login now</a>'
             + '<br><br>'
             + '<hr style="border:0;height:2px;background:#efefef">'
             + '<br>'
             + 'If at any point you forget your chosen password, just click the ‘<a href="">Forgot your password?</a>’ link on the login page. A link to reset your password will then be sent to you.'
             + '</div>'
    return html;
  },

  resetpassword: function(user) {
    var html = '<div style="margin-top:0;margin-bottom:0;margin-right:0;margin-left:0;border-width:0;padding-top:30px;padding-bottom:30px;padding-right:30px;padding-left:30px">'
             + '<span style="color:#040407;font-size:24px">Hi ' + user.name + ',</span>'
             + '<br><br>'
             + 'You recently requested a password reset for your Goodfriends ID. To complete the process, click the link below.'
             + '<br><br>'
             + '<a href="http://www.goodfriends.co/password/reset?token=' + user.password_token + '" style="background-color:#2d6cbe;background-image:none;background-repeat:repeat;background-position:top left;border-radius:4px;color:white;display:inline-block;font-size:20px;font-weight:normal;padding:10px 20px;text-decoration:none" target="_blank">Reset now</a>'
             + '<br><br>'
             + '<hr style="border:0;height:2px;background:#efefef">'
             + '<br>'
             + 'If you didn’t make this change or if you believe an unauthorized person has accessed your account, Pleae send email to support@goodfriends.co'
             + '</div>'
    return html;

  },

  notification: function(data) {
    var subject = ''
    switch (data.kind) {
      case 'comment':
        subject = data.from.name.first + ' ' + data.from.name.last + ' 님이 내 포스트에 덧글을 남겼습니다.'
        content = data.body;
        break;
      case 'like':
        subject = data.from.name.first + ' ' + data.from.name.last + ' 님이 내 포스트에 이모티콘을 보냈습니다.'
        content = '';
        break;
      case 'photolike':
        subject = data.from.name.first + ' ' + data.from.name.last + ' 님이 내 사진에 이모티콘을 보냈습니다.'
        content = '';
        break;
      case 'friend':
        subject = data.from.name.first + ' ' + data.from.name.last + ' 님으로 부터 친구신청을 받았습니다.'
        content = '';
        break;
    }

    var html = '<p></p>'
             + '<p>' + subject + '</p>'
             + '<p></p>'
             + '<p>' + data.body + '</p>'
             + '<p></p>'
             + '<p><a href="http://www.gomissy.com' + data.path + '" target="_blank">확인하기</a></p>'
             + '<p></p>'
             + '<p>GoMissy Inc.</p>'

    return html;
  }

}


/**
 * Expose
 */

module.exports = Email
