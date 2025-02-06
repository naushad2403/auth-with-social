
const express = require('express');
const sendEmail = require('../services/emailService');
const User = require('../models/User');
const router = express.Router();


router.post('/create-user', async (req, res) => {
    const { email, role, name } = req.body;

    try {
        // Validate input
        if (!email || !role) {
            return res.status(400).json({ message: 'Email and role are required' });
        }

        // Create verification token (a random string)
        const verificationToken = Math.random().toString(36).substring(7);

        // Create user with provided details
        const newUser = new User({
            email,
            role,
            name,
            verificationToken,
            isVerified: true, // User is not verified initially
        });

        // Save the user to the database
        await newUser.save();

        // Create reset password URL
        //    const resetUrl = `http://localhost:5000/auth/reset-password/${verificationToken}`;


        //    const text = `Your account has been created for the role of ${role}. Click on the following link to reset your password: ${resetUrl}`;
        const resetUrl = `http://localhost:5000/auth/reset-password-url?token=${verificationToken}`;

        //    // Send reset link via email
        const subject = 'Password Reset Request';
        const text = `Your account has been created for the role of ${role}. Click on the following link to reset your password: ${resetUrl}`;

        const html = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <p style="font-size: 16px;">Your account has been created for the role of <strong style="color: #007bff;">${role}</strong>.</p>
    <p style="font-size: 16px;">Click on the following link to reset your password:</p>
    <p>
      <a href="${resetUrl}" style="font-size: 16px; color: #007bff; text-decoration: none; font-weight: bold;">
        ${resetUrl}
      </a>
    </p>
    <p style="font-size: 14px; color: #555;">If you did not request a password reset, please ignore this email.</p>
  </div>
`;

        await sendEmail(email, subject, text, html);

        res.status(201).json({
            message: `User created successfully`,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error, please try again later' });
    }
});


module.exports = router;