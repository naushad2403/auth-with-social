const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true },
  // phone: { type: String, unique: true },
  password: { type: String },
  // socialId: { type: String, unique: true }, // For social logins
  provider: { type: String }, // For storing the provider (Google, Facebook, etc.)
  verificationToken: {type: String},
  isVerified: {type: Boolean}
});

const User = mongoose.model('User', userSchema);
module.exports = User;
