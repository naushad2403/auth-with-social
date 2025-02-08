
const express = require('express');
const sendEmail = require('../services/emailService');
const User = require('../models/User');
const router = express.Router();


// 4. Update Profile
router.post('/update', async (req, res) => {
    const user = await User.findById(req.user.userId);
    const { name, email, phone, bio, profilePicture, website } = req.body;
  
    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
  
    // Update the user's profile fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.bio = bio || user.bio;
    user.profilePicture = profilePicture || user.profilePicture;
    user.website = website || user.website;
  
    try {
      await user.save();
      res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (err) {
      res.status(500).json({ message: 'Error updating profile', error: err.message });
    }
  });

  module.exports = router;