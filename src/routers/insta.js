const express = require("express");
const spAuth = require("../middleware/spAuth")

const router = express.Router();

const { IgApiClient } = require('instagram-private-api');
const { get } = require('request-promise');

const postToInsta = async (user, data) => {
    data = JSON.parse(data);
    console.log(user.ig_username)
    console.log(user.ig_password)
    console.log(data.caption)
    console.log(data.image_url)

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
}

router.post('/user/sp/insta-post', spAuth, (req, res) => {
    let user = req.user
    let data = req.body

    if(postToInsta(user.toJSON(), JSON.stringify(data))) {
        res.status(201).send("instagram post created!")
    }
    else {
        res.status(400).send("unable to post to instagram");
    }
})

module.exports = router;