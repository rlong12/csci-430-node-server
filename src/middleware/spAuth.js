const jwt = require('jsonwebtoken')
const SpUser = require('../models/spuser')

const auth = async (req, res, next) => {
  try {
    console.log("in sp auth method")
    console.log(req.header)
    let token = req.header('Authorization')
    //console.log(token)
    token = token.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JSON_WEB_TOKEN_SECRET)
    console.log(decoded)
    console.log(token)
    console.log(SpUser)
    const user = await SpUser.findOne({_id: decoded._id, 'tokens': token})
    console.log(user)
    if (!user) {
      throw new Error()
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