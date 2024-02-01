const express = require("express");
const User = require("../models/user");
const router = express.Router();

router.post("/user", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/user/login", (req, res) => {
  console.log(req.body);
  res.status(200).send(req.body); //this will be the user object
});

module.exports = router;