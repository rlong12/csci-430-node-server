const express = require("express");
const spAuth = require("../middleware/spAuth");
const mongoose = require("mongoose");
const SpUser = require('../models/spuser');

const router = express.Router();

const { IgApiClient } = require("instagram-private-api");
const { get } = require("request-promise");

const postToInsta = async (user, data) => {
  data = JSON.parse(data);
  console.log(user.ig_username);
  console.log(user.ig_password);
  console.log(data.caption);
  console.log(data.image_url);

  const ig = new IgApiClient();
  ig.state.generateDevice(user.ig_username);
  await ig.account.login(user.ig_username, user.ig_password);

  const imageBuffer = await get({
    url: data.image_url,
    encoding: null,
  });

  await ig.publish.photo({
    file: imageBuffer,
    caption: data.caption, // nice caption (optional)
  });
};

router.post("/user/sp/insta-post", spAuth, (req, res) => {
  let user = req.user;
  let data = req.body;

  if (postToInsta(user.toJSON(), JSON.stringify(data))) {
    res.status(201).send("instagram post created!");
  } else {
    res.status(400).send("unable to post to instagram");
  }
});

router.patch("/user/sp/insta", spAuth, async (req, res) => {
  let user = req.user;
  let body = req.body;
    console.log(user)
    console.log(body)
  if (!mongoose.isValidObjectId(user._id)) {
    res.status(400).send("Invalid request");
    return;
  }

  console.log("sp user is valid");

  try {
    console.log(user._id)
    let spUser = await SpUser.findById(user._id);
    console.log(spUser);

    if (!spUser) {
      res.status(400).send("User not found");
      return;
    }

    spUser.ig_username = body.ig_username.toString();
    spUser.ig_password = body.ig_password.toString();

    console.log("ig username: " + spUser.ig_username);
    console.log("ig password: " + spUser.ig_password);

    await spUser.save();
    res.send("Instagram info updated!");
  } catch (e) {
    res.status(400).send("unable to add instagram info")
  }
});

router.get("/user/sp/insta-feed", spAuth, (req, res) => {
  let user = req.user;

  if (getFeed(user.toJSON())) {
    res.status(200).send("got insta feed");
  } else {
    console.log("unable to get insta feed");
  }
});

//get feed
const getFeed = async (user) => {
  const ig = new IgApiClient();
  ig.state.generateDevice(user.ig_username);
  const auth = await ig.account.login(user.ig_username, user.ig_password);
  const followersFeed = ig.feed.accountFollowers(auth.pk);
  const wholeResponse = await followersFeed.request();
  console.log(wholeResponse); // You can reach any properties in instagram response
  const items = await followersFeed.items();
  console.log(items); // Here you can reach items. It's array.
  const thirdPageItems = await followersFeed.items();
  // Feed is stateful and auto-paginated. Every subsequent request returns results from next page
  console.log(thirdPageItems); // Here you can reach items. It's array.
  const feedState = followersFeed.serialize(); // You can serialize feed state to have an ability to continue get next pages.
  console.log(feedState);
  followersFeed.deserialize(feedState);
  const fourthPageItems = await followersFeed.items();
  console.log(fourthPageItems);
  // You can use RxJS stream to subscribe to all results in this feed.
  // All the RxJS powerful is beyond this example - you should learn it by yourself.
  followersFeed.items$.subscribe(
    (followers) => console.log(followers),
    (error) => console.error(error),
    () => console.log("Complete!")
  );
};

module.exports = router;
