const express = require("express");
const User = require("../models/user");
const SpUser = require("../models/spuser");
const bcrypt = require("bcrypt");
const { sendVerificationEmail } = require("../emails/account.js");
const router = express.Router();
const auth = require("../middleware/auth")
const spAuth = require("../middleware/spAuth.js")

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
    if (await User.findOne({ email: req.body.email })) {
      res.status(400).send("Email is already associated with an account");
    }
    res.status(400).send(error);
  }
});

router.get("/user", auth, async (req,res) => {
  let user = req.user;

  if(user) {
    res.send(user);
  }
  else {
    res.status(400).send("User not found");
  }
});

router.get("/user/verification", auth, async (req, res) => {
  const user = req.user;
  const token = req.token;

  console.log(user);
  console.log(token);

  user.email_verified = true;
  user.tokens = user.tokens.filter((token) => {
    return token !== req.token;
  });
  console.log(user.tokens)
  user.save();

  res.send();
});

router.post("/user/login", async (req, res) => {
  console.log(req.body);

  try {
    let user;
    if ((user = await User.findOne({ email: req.body.email }))) {
      if (await bcrypt.compare(req.body.password, user.password)) {
        if (user.email_verified === true) {
          const token = await user.generateAuthToken();
          console.log(token);
          res.status(200).send({ user, token });
        } else {
          res.status(401).send("Email not verified");
        }
      } else {
        res.status(400).send("Incorrect pw");
      }
    } else {
      res.status(400).send("Incorrect email");
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/user/logout', auth, async (req, res) => {
  const user = req.user

  try {
      user.tokens = user.tokens.filter((token) => {
          return token !== req.token
      })
      await user.save()

      res.send()
  }
  catch (e) {
      res.status(500).send()
  }
})


//SP Code
router.post("/user/sp", async (req, res) => {
  delete req.body.tokens;
  console.log(req.body);
  const user = new SpUser(req.body);
  try {
    console.log(SpUser);
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send(user);
  } catch (error) {
    if (await SpUser.findOne({ ig_username: req.body.ig_username })) {
      res.status(400).send("Phone number is already associated with an account");
    }
    res.status(400).send(error);
  }
});

router.post("/user/sp/login", async (req, res) => {
  console.log(req.body);

  try {
    let user;
    if ((user = await SpUser.findOne({ phone_number: req.body.phone_number }))) {
      if (req.body.password.localeCompare(user.password) === 0) {
          const token = await user.generateAuthToken();
          console.log(token);
          res.status(200).send({ user, token });
      } else {
        res.status(400).send("Incorrect pw");
      }
    } else {
      res.status(400).send("Incorrect phone");
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/user/sp/logout', spAuth, async (req, res) => {
  const user = req.user

  try {
      user.tokens = user.tokens.filter((token) => {
          return token !== req.token
      })
      await user.save()

      res.send()
  }
  catch (e) {
      res.status(500).send()
  }
})

router.get('/user/:id', async (req, res) => {
  let user;
  if((user = (await User.findOne({ _id: req.params.id})) )) {
    res.status(200).send(user);
  }
  else {
    res.status(400).send("no user found");
  }
})

module.exports = router;
