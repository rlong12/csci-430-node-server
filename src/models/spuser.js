const validator = require("validator");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');

const Schema = mongoose.Schema;

const spUserSchema = new Schema({
  phone_number: {
    type: Number,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  ig_username: {
    type: String,
    trim: true,
  },
  ig_password: {
    type: String,
    trim: true,
  },
  tokens: [String],
  profile_pic: Buffer,
  twitter_refresh_token: String,
});

spUserSchema.methods.generateAuthToken = async function () {
  const user = this
 
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JSON_WEB_TOKEN_SECRET)

  user.tokens = user.tokens.concat(token)
  await user.save()

  return token
}

/* spUserSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next(); // run the save() method
}); */

spUserSchema.methods.toJSON = function () {
  const user = this;

  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.email_verified;
  delete userObject.__v;

  return userObject;
};

const SpUser = mongoose.model("SpUser", spUserSchema);

module.exports = SpUser;
