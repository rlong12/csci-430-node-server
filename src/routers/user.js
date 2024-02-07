const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { sendVerificationEmail } = require("../emails/account.js");
const router = express.Router();
const auth = require("../middleware/auth");

router.post("/user", async (req, res) => {
  delete req.body.email_verified;
  delete req.body.tokens;
  console.log(req.body);
  const user = new User(req.body);
  try {
    console.log(User);
    await user.save();
    const token = await user.generateAuthToken();
    sendVerificationEmail(user.email, user.username, token);
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/user/verification", auth, async (req, res) => {
  const user = req.user;
  const token = req.token;

  console.log(user);
  console.log(token);

  user.email_verified = true;
  user.save();

  res.send();
});

router.post("/user/login", async (req, res) => {
  console.log(req.body);

  try {
    let result;
    if (result = await User.findOne({ email: req.body.email })) {
      if (await bcrypt.compare(req.body.password, result.password)) {
        if (result.email_verified === true) {
          res.status(200).send(result);
        } else {
          res.status(401).send("Email not verified");
        }
      } else {
        res.status(400).send("Incorrect credentials");
      }
    }
    else {
      res.status(400).send("Incorrect credentials");
    }
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
