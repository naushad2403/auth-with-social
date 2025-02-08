const express = require('express');
const router = express.Router();
const User = require('../models/User');
const sendEmail = require('../services/emailService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { FRONTEND_BASE_URL } = process.env;

// Helper functions
const generateSecureToken = () => crypto.randomBytes(32).toString('hex');
const hashPassword = async (password) => bcrypt.hash(password, 10);
const comparePasswords = async (plain, hashed) => bcrypt.compare(plain, hashed);

// Error handling middleware
const handleErrors = (res, error, defaultMessage = 'An error occurred') => {
  console.error(error);
  res.status(500).json({ message: defaultMessage });
};

// Registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const verificationToken = generateSecureToken();
    const hashedPassword = await hashPassword(password);
    
    const user = new User({
      name,
      email,
      role,
      password: hashedPassword,
      verificationToken,
    });

    await user.save();

    // Send verification email
    const verificationLink = `${FRONTEND_BASE_URL}/auth/verify-email?token=${verificationToken}`;
    await sendEmail(
      email,
      'Email Verification Request',
      `Please verify your email: ${verificationLink}`
    );

    res.status(201).json({ message: 'Registration successful. Check email for verification.' });
  } catch (error) {
    handleErrors(res, error, 'Registration failed');
  }
});

// Email Verification
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ verificationToken: token });

    if (!user) return res.status(400).json({ message: 'Invalid verification token' });

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.json({ message: 'Email successfully verified' });
  } catch (error) {
    handleErrors(res, error, 'Email verification failed');
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await comparePasswords(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Account not verified' });
    }

    res.json({ token });
  } catch (error) {
    handleErrors(res, error, 'Login failed');
  }
});


function getJWTToken(user){
  const token = jwt.sign(
    { userId: user?._id, email: user?.email, role: user?.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

// Password Reset Flow
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = getJWTToken(user);

    const resetLink = `${FRONTEND_BASE_URL}/reset-password?token=${resetToken}`;
    await sendEmail(
      email,
      'Password Reset Request',
      `Reset your password: ${resetLink}`
    );

    res.json({ message: 'Password reset link sent to email' });
  } catch (error) {
    handleErrors(res, error, 'Password reset request failed');
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = await hashPassword(newPassword);
    await user.save();

    res.json({ message: 'Password successfully updated' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Reset token has expired' });
    }
    handleErrors(res, error, 'Password reset failed');
  }
});



router.get('/reset-password-url', async (req, res) => {
  const { token } = req.query; // Extract token from the query string

  if (!token) {
      return res.status(400).send('Invalid request. No token provided.');
  }

  // Render the HTML template (e.g., reset-password.ejs) with the token passed as a variable
  res.render('reset-password', { token: token });
});



module.exports = router;