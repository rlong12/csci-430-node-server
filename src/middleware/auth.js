const jwt = require('jsonwebtoken')
const User = require('../models/user')
require('dotenv').config({ debug: true });

const auth = async (req, res, next) => {
  try {
    console.log(req.header)
    let token = req.header('Authorization')
    console.log(token)
    token = token.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JSON_WEB_TOKEN_SECRET)
    console.log("decoded: " + decoded)
    console.log("decoded id: " + decoded._id);
    console.log("token " + token)
    console.log("decoded tokens: " + decoded.tokens);
    console.log("Model: " + User)
    const user = await User.findOne({_id: decoded._id, 'tokens': token})
    console.log("User: " + user)
    if (!user) {
      console.log('unable to find user')
      throw new Error();
    }

    req.token = token
    req.user = user
    next()
 
  } catch (e) {
    console.log("failure in auth")
    res.status(401).send({error: 'Please authenticate.'})
  }
}

module.exports = auth