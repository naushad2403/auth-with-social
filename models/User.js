const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true },
  // phone: { type: String, unique: true },
  password: { type: String },
  // socialId: { type: String, unique: true }, // For social logins
  provider: { type: String }, // For storing the provider (Google, Facebook, etc.)
  verificationToken: {type: String},
  isVerified: {type: Boolean},
  // Adding a 'role' field to the schema
  role: {
    type: String,
    enum: ['user', 'author', 'editor', 'admin'], // Allowed roles
    default: 'user', // Default role if not specified
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
