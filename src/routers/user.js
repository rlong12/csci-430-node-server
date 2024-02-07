const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { sendVerificationEmail } = require("../emails/account.js");
const router = express.Router();
const auth = require('../middleware/auth');


router.post("/user", async (req, res) => {
  delete req.body.email_verified;
  delete req.body.tokens;
  console.log(req.body);
  const user = new User(req.body);
  try {
    console.log(User)
    await user.save();
    const token = await user.generateAuthToken();
    sendVerificationEmail(user.email, user.username, token);
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/user/verification', auth, async (req, res) => {
  const user = req.user
  const token = req.token

  console.log(user)
  console.log(token)

  user.email_verified = true
  user.save()
  
  res.send()
})

/*router.post("/user/login", async (req, res) => {
  console.log(req.body);

  const pw = await bcrypt.hash(req.body.password, 8);
  console.log("hashed pw: " + pw);
  let result;
  let accountFound = false;
  try {
    result = await User.find();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
  for (let i = 0; i < result.length; i++) {
    if (req.body.email.localeCompare(result[i].email) === 0) {
      accountFound = true;
      console.log("request email: " + req.body.email);
      console.log("user in db: " + result[i]);
      if (await bcrypt.compare(req.body.password, result[i].password)) {
        if (result[i].email_verified === true) {
          /*remove req.body.password;
                remove req.body.tokens;
                remove req.body.email_verified; 
          res.status(200).send(req.body); //this will be the user object
        } else {
          res.status(401).send("Email not verified");
        }
      }
      else {
        res.status(400).send("PW invalid");
      }
    }
  }
  if (!accountFound) {
    res.status(400).send("Incorrect credentials");
  } 
});
*/
module.exports = router;
