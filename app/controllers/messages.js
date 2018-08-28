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
const Conversation = mongoose.model('Conversation');
const Message = mongoose.model('Message');
const assign = Object.assign;



// /**
//  * Load conversation
//  */
//  exports.conversation_load = async(function* (req, res, next, conversation_id) {
//    try {
//      req.conversation = yield Conversation.load(conversation_id);
//      if (!req.conversation) return res.json({ result: false, errors: [new Error('Conversation not found')] });
//    } catch (err) {
//      return next(err);
//    }
//    next();
//  });
//
//
//  /**
//   * Create Conversations
//   */
//  exports.conversation_create = async(function* (req, res) {
//    var participants = req.body.users.split(',');
//    const conversation = new Conversation({ participants: participants });
//
//    conversation.save(function(err) {
//      if (err) return res.status(422).json({ result: false, message: err.errors });
//      return res.status(200).json({ result: true, data: conversation });
//    });
//  });
//
//
// /**
//  * Conversations
//  */
// exports.conversations = async(function* (req, res) {
//   var criteria = { 'participants.user': req.user.id };
//   const conversations = yield Conversation.list(criteria);
//
//   return res.json({ result: true, data: conversations });
// });


/**
 * Messages
 */
exports.list = async(function* (req, res) {
  console.log(req.conversation);
  var criteria = { 'conversation': req.conversation };
  const messages = yield Message.list(criteria);

  return res.json({ result: true, data: messages });
});


/**
 * Send Message
 */
exports.send = async(function* (req, res) {
  var to_user = req.body.to_user.split(',');
  var message = req.body.message;
  var participants = [req.user.id];

  for (var i in to_user) {
    participants.push(to_user[i]);
  }

  const conversation = yield Conversation.seek(participants);
  if (conversation) {
    const msg = Message.create(conversation, req.user.id, message, participants);
    console.log(msg);

  }
  else {
    conversation = new Conversation({ participants: participants });

    conversation.save(function (err) {
      if (err) return res.status(422).json({ result: false, errors: err.errors });
      const msg = Message.create(conversation, req.user.id, message, participants);
    });
  }
  return res.json({ result: true, data: msg });
});

/**
 * Reply Message
 */
exports.reply = async(function* (req, res) {
  var message = req.body.message;
  var conversation = req.conversation;
  var participants = [];

  for (var i=0; i<conversation.participants.length; i++) {
    participants.push(conversation.participants[i]);
  }

  try {
    const msg = yield Message.create(conversation, req.user.id, message, participants);
    console.log(msg);
    return res.json({ result: true, data: msg });
  } catch(err) {
    return res.json({ result: false, errors: err.errors });
  }
});
