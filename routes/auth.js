const express = require('express');
const router = express.Router();
const User = require('../models/User');
const sendEmail = require('../services/emailService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// Email and password login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && user.isVerified && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(400).json({ message: 'Invalid credentials or not verified yet' });
  }
});

// Add similar routes for Facebook, Twitter, and Instagram

// Email Verification
router.post('/verify-email', async (req, res) => {
  const { token } = req.body;
  const user = await User.findOne({ verificationToken: token });
  if (!user) return res.status(400).json({ message: 'Invalid token' });

  user.isVerified = true;
  user.verificationToken = null;
  await user.save();
  res.json({ message: 'Email verified successfully' });
});

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  const verificationToken = Math.random().toString(36).substring(7);

  // Check if email is already registered
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: 'Email is already registered.' });
  }

  // Generate a salt to hash the password
  const salt = await bcrypt.genSalt(10);  // 10 is the number of salt rounds, adjust if needed

  // Hash the password with the salt
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = new User({ name, email, password: hashedPassword, verificationToken });
  await user.save();

  // Send reset link via email
  const subject = 'Email Verification Request';
  const text = `Please verify your email with verification code: ${verificationToken}`;
  console.log(sendEmail, typeof sendEmail);
  // await sendEmail?.(email, subject, text);
  res.json({ message: 'Registration successful. Please check your email for verification.' });
});



// Route to request a password reset
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a password reset token (expires in 1 hour)
    const resetToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Create reset password URL
    const resetUrl = `http://localhost:5000/api/auth/reset-password/${resetToken}`;

    // Send reset link via email
    const subject = 'Password Reset Request';
    const text = `You requested a password reset. Click on the following link to reset your password: ${resetUrl}`;

    await sendEmail(user.email, subject, text);

    res.status(200).json({ message: 'Password reset link has been sent to your email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to reset the password
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: 'New password is required' });
  }

  try {
    // Verify the reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by ID (from the decoded token)
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
});


module.exports = router;