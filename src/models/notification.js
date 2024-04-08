const mongoose = require("mongoose");
const NOTIFICATIONTYPE = require('./notificationtype');

const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectID,
    ref: "User",
    required: true,
  },
  sender_name: {
    type: String,
    required: true,
    trim: true,
  },
  receiver: {
    type: Schema.Types.ObjectID,
    ref: "User",
    required: true,
  },
  receiver_name: {
    type: String,
    required: true,
    trim: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  body: {
    type: String,
    required: true,
    trim: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  notificationType: {
    type: String,
    enum: NOTIFICATIONTYPE,
    default: "Message",
    required: true,
  },
  studyGroupId: {
    type: Schema.Types.ObjectID,
    ref: "StudyGroup",
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
