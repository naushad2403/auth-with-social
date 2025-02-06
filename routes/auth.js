const express = require('express');
const router = express.Router();
const User = require('../models/User');
const sendEmail = require('../services/emailService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


router.get('/reset-password-url', async (req, res) => {
    const { token } = req.query; // Extract token from the query string

    if (!token) {
        return res.status(400).send('Invalid request. No token provided.');
    }

    // Render the HTML template (e.g., reset-password.ejs) with the token passed as a variable
    res.render('reset-password', { token: token });
});


// Email and password login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && user.isVerified && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({email: user.email, role: user.role}, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(400).json({ message: 'Invalid credentials or not verified yet' });
  }
});

// Add similar routes for Facebook, Twitter, and Instagram

// Email Verification
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  const user = await User.findOne({ verificationToken: token });
  if (!user) return res.status(400).json({ message: 'Invalid token' });

  user.isVerified = true;
  user.verificationToken = null;
  await user.save();
  res.json({ message: 'Email verified successfully' });
});

router.post('/register', async (req, res) => {
  const { email, password, name, role } = req.body;
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

  const user = new User({ name, email, password: hashedPassword,role, verificationToken });
  await user.save();

  const subject = 'Email Verification Request';
  const verificationLink = `http://localhost:5000/auth/verify-email?token=${verificationToken}`;
  const text = `Please verify your email by clicking the following link: ${verificationLink}`;
  await sendEmail?.(email, subject, text);
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

// Handle password reset form submission (POST)
router.post('/reset-password', async (req, res) => {
  const { newPassword, confirmPassword, token } = req.body;

  if (!token) {
      return res.status(400).send('Invalid request. No token provided.');
  }

  // Verify the token again before allowing password change
  try {
      const user =await User.findOne({ verificationToken: token });

      if (!user) {
          return res.status(400).send('Invalid or expired token.');
      }

      // Check if passwords match
      if (newPassword !== confirmPassword) {
          return res.status(400).send('Passwords do not match. Please try again.');
      }

      // You can add more password validation (e.g., password strength check)

      // Update the password in the database
      await updateUserPassword(user.id, newPassword);

      res.send('Your password has been reset successfully.');
  } catch (error) {
      console.error(error);
      return res.status(500).send('An error occurred while resetting your password.');
  }
});

// Function to update the user's password
async function updateUserPassword(userId, newPassword) {
  try {
    // Hash the new password
    const saltRounds = 10; // Number of rounds for bcrypt to generate a salt
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Find the user by ID and update the password
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Update the password
    user.password = hashedPassword;

    // Save the updated user to the database
    await user.save();

    console.log('Password updated successfully');
    return user;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error; // Propagate the error for handling at a higher level
  }
}



module.exports = router;