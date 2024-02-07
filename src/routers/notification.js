const express = require("express");
const Notification = require("../models/notification");
const User = require("../models/user")
const router = express.Router();

router.post("/user/notification", async (req, res) => {
  let sender = "";
  let receiver = "";
  let result;
  try {
    result = await User.find();
  } catch (e) {
    res.status(500).json({error: e.message});
  }
  for (let i = 0; i < result.length; i++) {
    if (req.body.sender.localeCompare(result[i].email) === 0) {
        console.log(req.body.sender);
      sender = result[i]._id;
      console.log(sender);
    }
    if (req.body.receiver.localeCompare(result[i].email) === 0) {
        console.log(req.body.receiver);
      receiver = result[i]._id;
      console.log(receiver);
    }
  }
  if (sender != null && receiver != null) {
    //const notification = new Notification(sender, receiver, req.body.subject, req.body.body, req.body.notificationType);
    let data = {
        "sender": sender,
        "receiver": receiver,
        "subject": req.body.subject,
        "body": req.body.body
    }
    const notification = new Notification(data);
    try {
      await notification.save();
      res.status(201).send(notification);
    } catch (e) {
      res.status(400).send(e);
    }
  } 
});

module.exports = router;
