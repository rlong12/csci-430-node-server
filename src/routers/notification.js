const express = require("express");
const Notification = require("../models/notification");
const User = require("../models/user");
const router = express.Router();
const auth = require("../middleware/auth");

router.post("/user/notification", auth, async (req, res) => {
  let sender = req.user._id;
  let senderName = req.user.username;
  let receiverId = req.body.receiver;
  let receiverEmail = req.body.receiver;
  let receiver;
  let receiverName = '';

  //get receiver name if receiver is an id
  try {
    receiver = await User.findById(receiverId);
    console.log(receiver);
    receiverName = receiver.username;
  } catch (e) {
    console.log("receiver is not an id");
  }

  console.log("receiverName: " + receiverName);

  //get receiver name if receiver is an email
  if (receiverName.localeCompare('') === 0) {
    try {
      receiver = await User.findOne({ email: receiverEmail });
      console.log(receiver);
      receiverName = receiver.username;
      receiverId = receiver._id;
    } catch (e) {
      console.log("receiver is not an email");
    }
  }
  console.log(receiverName);

  if (sender != null && receiver != null) {
    //const notification = new Notification(sender, receiver, req.body.subject, req.body.body, req.body.notificationType);
    let data = {
      sender: sender,
      sender_name: senderName,
      receiver: receiverId,
      receiver_name: receiverName,
      subject: req.body.subject,
      body: req.body.body,
    };
    const notification = new Notification(data);
    try {
      await notification.save();
      receiver.notifications.push(notification._id);
      await receiver.save();
      res.status(201).send(notification);
    } catch (e) {
      res.status(400).send(e);
    }
  }
});

module.exports = router;
