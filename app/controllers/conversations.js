'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const { wrap: async } = require('co');
const Conversation = mongoose.model('Conversation');

/**
 * Load conversation
 */
 exports.load = async(function* (req, res, next, conversation_id) {
   try {
     req.conversation = yield Conversation.load(conversation_id);
     if (!req.conversation) return res.json({ result: false, errors: [new Error('Conversation not found')] });
   } catch (err) {
     return next(err);
   }
   next();
 });


/**
 * List conversation
 */
exports.list = async(function* (req, res) {
  var criteria = { 'participants.user': req.user.id };
  const conversations = yield Conversation.list(criteria);

  return res.json({ result: true, data: conversations });
});


/**
 * Create conversation
 */
exports.create = async(function* (req, res) {
  var participants = req.body.users.split(',');
  const conversation = new Conversation({ participants: participants });

  conversation.save(function(err) {
    if (err) return res.status(422).json({ result: false, message: err.errors });
    return res.status(200).json({ result: true, data: conversation });
  });
});


/**
 * Test conversation
 */
exports.test = async(function* (req, res) {
  var participants = req.body.users.split(',');
  const conversation = yield Conversation.seek(participants);

  return res.status(200).json({ result: true, data: conversation });
});
