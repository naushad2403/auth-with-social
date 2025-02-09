const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic user info
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String },
  password: { type: String, required: true },
  socialId: { type: String }, // For social logins
  provider: { type: String }, // For storing the provider (Google, Facebook, etc.)
  verificationToken: { type: String },
  isVerified: { type: Boolean, default: false }, // Default is false

  // User roles and permissions
  role: {
    type: String,
    enum: ['user', 'reporter', 'author', 'editor', 'admin'], // Allowed roles
    default: 'user', // Default role if not specified
  },

  // Fields for different user types
  bio: { type: String }, // Short bio for reporters or authors
  profilePicture: { type: String }, // URL to profile picture
  website: { type: String }, // Personal website or blog URL (for reporters/authors)
  
  // Reporter specific fields
  publication: { type: String }, // The news publication they are working for
  expertise: { type: String }, // Specialization or beat (e.g., politics, sports, tech)

  // Editor specific fields
  teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // List of users under this editor's team
  assignedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }], // List of articles assigned to the editor

  // Admin specific fields
  permissions: {
    type: [String], // Array of permissions like ['create', 'edit', 'delete']
    default: ['manage_users', 'manage_content']
  },

  // Timestamps for tracking ban/activation/deactivation events
  bannedAt: { type: Date }, // Timestamp when the user was banned
  activatedAt: { type: Date }, // Timestamp when the user was activated
  deactivatedAt: { type: Date }, // Timestamp when the user was deactivated

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Pre-save hook to update `updatedAt`
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to set `isBanned` and `bannedAt` fields
userSchema.methods.banUser = function() {
  this.isBanned = true;
  this.bannedAt = Date.now();
  this.save();
};

// Method to set `isActive` and `activatedAt` fields
userSchema.methods.activateUser = function() {
  this.isActive = true;
  this.activatedAt = Date.now();
  this.save();
};

// Method to set `isActive` and `deactivatedAt` fields
userSchema.methods.deactivateUser = function() {
  this.isActive = false;
  this.deactivatedAt = Date.now();
  this.save();
};


// Create and export the User model
const User = mongoose.model('User', userSchema);
module.exports = User;
