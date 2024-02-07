const mongoose = require('mongoose') 

const Schema = mongoose.Schema

const notificationSchema = new Schema({ 
    sender: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    receiver: { 
        type: String,
        required: true, 
        trim: true,
        lowercase: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
      },
    body: {
        type: String,
        required: true,
        trim: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    notificationType: {
        type: String,
        default: "Message Notification"
    },
    studyGroupId: {
        type: String
    }
})

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification