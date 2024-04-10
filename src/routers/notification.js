const express = require("express");
const Notification = require("../models/notification");
const User = require("../models/user");
const StudyGroup = require("../models/studyGroup");
const router = express.Router();
const auth = require("../middleware/auth");

router.post("/user/notification", auth, async (req, res) => {
  let sender = req.user._id;
  let senderName = req.user.username;
  let receiverId = req.body.receiver;
  let receiverEmail = req.body.receiver;
  let receiver;
  let receiverName = "";
  let studyGroupID = req.body.studyGroupId;
  let studyGroup;

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
  if (receiverName.localeCompare("") === 0) {
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

  if (req.body.notificationType.localeCompare("Invite") === 0) {
    try {
      studyGroup = await StudyGroup.findOne({ _id: studyGroupID });
      console.log(studyGroup);
    } catch (e) {
      res.status(400).send("Invalid study group");
    }

    if (sender != null && receiver != null) {
      let data = {
        sender: sender,
        sender_name: senderName,
        receiver: receiverId,
        receiver_name: receiverName,
        subject: "You have been invited to join a study group!",
        body: "You've been invited to join " + studyGroup.name + "!",
        notificationType: req.body.notificationType,
        studyGroupId: req.body.studyGroupId,
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
  }

  if (req.body.notificationType.localeCompare("Message") === 0) {
    if (sender != null && receiver != null) {
      let data = {
        sender: sender,
        sender_name: senderName,
        receiver: receiverId,
        receiver_name: receiverName,
        subject: req.body.subject,
        body: req.body.body,
        notificationType: req.body.notificationType,
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
  }
});

router.get("/notifications", auth, async (req, res) => {
  let user = req.user;
  console.log(user);
  let notificationIDs = user.notifications;
  let notifications = [];
  console.log(notificationIDs);
  console.log(notificationIDs.length);

  for (let i = 0; i < notificationIDs.length; i++) {
    try {
      console.log(notificationIDs[i]);
      let notification = await Notification.findOne({
        _id: notificationIDs[i],
      });
      console.log(notification);
      notifications.push(notification);
    } catch (e) {
      console.log("Unable to get notification: " + notificationIDs[i]);
      console.log(e);
    }
  }

  console.log(notifications);

  if (notifications.length === notificationIDs.length) {
    res.status(200).send(notifications);
  } else if (notifications.length > 0) {
    res.status(202).send(notifications);
  } else {
    res.status(400).send("Unable to get notifications...");
  }
});

router.patch("/notification/dealtWithStatus", auth, async (req, res) => {
  try {
    let notification = await Notification.findOne({ _id: req.notificationId });
    notification.dealtWith = true;
    await notification.save();

    res.send();
  } catch (e) {}
});

module.exports = router;
