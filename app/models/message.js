'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


/**
 * Message Group Schema
 */
const ConversationSchema = new Schema({
  participants: [{
    type: Schema.ObjectId,
    ref: 'User'
  }]
});


/**
 * Message Users Schema
 */
const ParticipantSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  read: {
    type: Boolean,
    default: false
  },
  trash: {
    type: Boolean,
    default: false
  }
});


/**
 * Message Schema
 */
const MessageSchema = new Schema({
  conversation: {
    type: Schema.ObjectId,
    ref: 'Conversation',
    index: true
  },
  sender: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  message: {
    type: String
  },
  status: [ParticipantSchema],
  created_at: {
    type: Date,
    default: Date.now
  }
});





/**
 * Statics
 */

ConversationSchema.statics = {

  /**
   * Find Conversation by id
   *
   * @param {ObjectId} id
   * @api private
   */

  load: function (_id) {
    return this.findOne({ _id })
      .populate('message')
      .populate('user', 'username name photo')
      .exec();
  },

  /**
   * List Conversations
   *
   * @param {Object} options
   * @api private
   */

  list: function (options) {
    const criteria = options.criteria || {};
    return this.find(criteria)
      .populate('participants', 'username name photo')
      .sort({ createdAt: -1 })
      .exec();
  },

  /**
   * Seek Conversations
   *
   * @param {Object} options
   * @api private
   */

  seek: function (participants) {
    return this.find({ participants: participants }).exec();
  },
};


/**
 * Statics
 */

MessageSchema.statics = {

  /**
   * Find message by id
   *
   * @param {ObjectId} id
   * @api private
   */

  load: function (_id) {
    return this.findOne({ _id })
      .populate('message')
      .populate('sender', 'username name photo')
      .populate('status.user', 'username name photo')
      .exec();
  },

  /**
   * List messages
   *
   * @param {Object} options
   * @api private
   */

  list: function (options) {
    const criteria = options.criteria || {};
    return this.find(criteria)
      .populate('sender', 'username name photo')
      .sort({ createdAt: -1 })
      .exec();
  },

  /**
   * Add message
   *
   * @param {Object} options
   * @api private
   */

  create: function (conversation, sender, message, participants) {
    var status = [];
    for (var i in participants) { status.push({ user: participants[i] }); }

    const message_item = new this({
      conversation: conversation._id,
      sender: sender,
      message: message,
      status: status,
    });

    return message_item.save();
  },

};

mongoose.model('Conversation', ConversationSchema);
mongoose.model('Message', MessageSchema);
