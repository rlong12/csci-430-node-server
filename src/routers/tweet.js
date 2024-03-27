const express = require('express')
const spAuth = require('../middleware/spAuth')
require('dotenv').config({ debug: true });

const router = express.Router()

router.post('/twitter/send-tweet', spAuth, async (req, res) => {
    const user = req.user
    console.log(req.body)

    const auth_code = req.body.auth_code
    let text = req.body.text
    text ??= "Something strange happended. :)"
    

    const access_token = (user.twitter_refresh_token) ?
        await getRefreshToken(user) :
        await getAccessToken(auth_code, user)

    if (access_token) {
        console.log('have access token')
        console.log(access_token)
        console.log("calling postTweet")

        if (postTweet(access_token, text)) {
            console.log('sending response status 201')
            res.status(201).send()
            return
        }
        else {
            console.log('sending response status 400')
            res.status(400).send()
            return
        }
    }
    else {
        console.log('cannot get access token from twitter')
        res.status(400).send()
    }

})

async function getAccessToken(auth_code, user) {
    console.log("client id: " + process.env.TWITTER_CLIENT_ID)
    console.log("auth_code: " + auth_code)

    const details = {
        'grant_type': 'authorization_code',
        'client_id': process.env.TWITTER_CLIENT_ID,
        'redirect_uri': 'https://ambitious-ocean-09c0b6d0f.4.azurestaticapps.net/twitter-redirect.html',
        'code_verifier': 'challenge',
        'code': auth_code
    }

    console.log(details)

    let formBody = [];
    for (let property in details) {
        let encodedKey = encodeURIComponent(property);
        let encodedValue = encodeURIComponent(details[property]);
        formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    console.log(formBody)

    const url = `https://api.twitter.com/2/oauth2/token`

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formBody
    }

    let response = await fetch(url, options)
    console.log("fetch twitter access token: " + response.status)
    const obj = await response.json()
    console.log(obj)

    if (response.status === 200) {
        try {
            console.log(obj.access_token)
            console.log(obj.refresh_token)

            user.twitter_refresh_token = obj.refresh_token
            user.save()
        }
        catch (error) {
            console.log('unable to save twitter refresh token')
            return null
        }

        return obj.access_token
    }
    else {
        return null
    }

}

async function getRefreshToken(user) {
    const refresh_token = user.twitter_refresh_token

    console.log("client id: " + process.env.TWITTER_CLIENT_ID)
    console.log("twitter refresh token: " + refresh_token)

    const details = {
        'grant_type': 'refresh_token',
        'client_id': process.env.TWITTER_CLIENT_ID,
        'refresh_token': refresh_token
    }

    console.log(details)

    let formBody = [];
    for (let property in details) {
        let encodedKey = encodeURIComponent(property);
        let encodedValue = encodeURIComponent(details[property]);
        formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    console.log(formBody)

    const url = `https://api.twitter.com/2/oauth2/token`

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formBody
    }

    let response = await fetch(url, options)
    console.log("fetch twitter auth token: " + response.status)
    const obj = await response.json()
    console.log(obj)

    if (response.status === 200) {
        try {
            console.log(obj.access_token)
            console.log(obj.refresh_token)

            user.twitter_refresh_token = obj.refresh_token
            user.save()
        }
        catch (error) {
            console.log('unable to save twitter access token')
            return null
        }

        return obj.access_token
    }
    else {
        return null
    }
}

async function postTweet(access_token, text) {

    console.log('access_token:' + access_token)

    const url = `https://api.twitter.com/2/tweets`

    const data = {
        text
    }

    const options = {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${access_token}`,
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(data)
    }

    console.log("posting tweet")
    let response = await fetch(url, options)

    console.log("response from twitter")
    const obj = await response.json()
    console.log(obj)

    if (response.status === 201) {
        console.log("tweet successful")
        return true
    }
    else {
        console.log("error sending tweet")
        return false
    }
}

module.exports = router