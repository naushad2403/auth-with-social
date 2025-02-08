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
     const verificationLink = `${FRONTEND_BASE_URL}/auth/verify-email?token=${verificationToken}`;

const emailContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding: 20px 0;
    }
    .header h1 {
      color: #333333;
      font-size: 24px;
      margin: 0;
    }
    .content {
      padding: 20px;
      text-align: center;
    }
    .content p {
      color: #555555;
      font-size: 16px;
      line-height: 1.6;
    }
    .button {
      display: inline-block;
      margin: 20px 0;
      padding: 12px 24px;
      font-size: 16px;
      color: #ffffff;
      background-color: #007bff;
      border-radius: 4px;
      text-decoration: none;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 14px;
      color: #888888;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Email Verification</h1>
    </div>
    <div class="content">
      <p>Thank you for signing up! Please verify your email address to complete your registration.</p>
      <a href="${verificationLink}" class="button">Verify Email</a>
      <p>If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
      <p><a href="${verificationLink}">${verificationLink}</a></p>
    </div>
    <div class="footer">
      <p>If you did not request this email, you can safely ignore it.</p>
    </div>
  </div>
</body>
</html>
`;


   
    await sendEmail(
      email,
      'Email Verification Request',
      `Please verify your email: ${verificationLink}`,
      emailContent
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
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f7fa;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
        }
        .container {
          text-align: center;
          background-color: #fff;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
        }
        h1 {
          color: #4CAF50;
          font-size: 2em;
        }
        p {
          color: #555;
          font-size: 1.1em;
          margin-top: 20px;
        }
        .message {
          margin-top: 20px;
          font-size: 1.2em;
          color: #4CAF50;
        }
        .button {
          margin-top: 30px;
          padding: 12px 20px;
          font-size: 1.1em;
          color: white;
          background-color: #4CAF50;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          text-decoration: none;
        }
        .button:hover {
          background-color: #45a049;
        }
      </style>
    </head>
    <body>

      <div class="container">
        <h1>Email Verified</h1>
        <p>Thank you for verifying your email address.</p>
        <p class="message">Your email has been successfully verified!</p>
      </div>

    </body>
    </html>
  `;

  res.send(htmlContent);
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

    const token = jwt.sign(
              { userId: user._id, email: user.email, role: user.role },
              process.env.JWT_SECRET,
              { expiresIn: '1h' }
            );

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