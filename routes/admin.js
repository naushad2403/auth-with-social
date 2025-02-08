
const express = require('express');
const sendEmail = require('../services/emailService');
const User = require('../models/User');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const checkExisitngUser = require('../middleware/checkExistingUser');
const { AccountCreationHTML } = require('../Utils/HtmlResponse');

router.post('/create-user', checkExisitngUser, async (req, res) => {
    const { email, role, name } = req.body;
    try {
        // Validate input
        if (!email || !role) {
            return res.status(400).json({ message: 'Email and role are required' });
        }

        const hashedPwd = await bcrypt.hash("password", Math.floor(Math.random() * 10));
        // Create user with provided details
        const newUser = new User({
            email,
            role,
            name,
            password: hashedPwd,
            isVerified: true, // User is not verified initially
        });

        // Save the user to the database
        await newUser.save();



        const verificationToken = jwt.sign(
            { userId: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Create reset password URL
        //    const resetUrl = `http://localhost:5000/auth/reset-password/${verificationToken}`;


        //    const text = `Your account has been created for the role of ${role}. Click on the following link to reset your password: ${resetUrl}`;
        const resetUrl = `http://localhost:5000/auth/reset-password-url?token=${verificationToken}`;

        //    // Send reset link via email
        const subject = 'Password Reset Request';
        const text = `Your account has been created for the role of ${role}. Click on the following link to reset your password: ${resetUrl}`;

        await sendEmail(email, subject, text, AccountCreationHTML(resetUrl, role));

        res.status(201).json({
            message: `User created successfully`,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error, please try again later' });
    }
});

// Route to fetch user list with pagination
router.get('/users', async (req, res) => {
    try {
        // Extract query parameters for pagination
        const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
        const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not provided
        const skip = (page - 1) * limit; // Calculate the number of documents to skip

        // Fetch users from the database with pagination and specific fields
        const users = await User.find()
            .skip(skip)
            .limit(limit)
            .select('name email role bio profilePicture website expertise isBanned isActive bannedAt activatedAt deactivatedAt ') // Select specific fields
            .exec();


        // Get the total number of users for pagination metadata
        const totalUsers = await User.countDocuments();

        // Calculate total pages
        const totalPages = Math.ceil(totalUsers / limit);

        // Send the response with users and pagination metadata
        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                page,
                limit,
                totalUsers,
                totalPages
            }
        });
    } catch (error) {
        // Handle any errors
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
});

// Middleware for checking if the user exists
const userExists = async (req, res, next) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  req.user = user; // Store the user object in the request for later use
  next();
};

// 1. Ban User
router.put('/ban/:userId', userExists, async (req, res) => {
  const { user } = req;

  if (user.isBanned) {
    return res.status(400).json({ message: 'User is already banned' });
  }

  user.banUser(); // Call the method to ban the user
  res.status(200).json({ message: 'User has been banned', bannedAt: user.bannedAt });
});

// 2. Activate User
router.put('/activate/:userId', userExists, async (req, res) => {
  const { user } = req;

  if (user.isActive) {
    return res.status(400).json({ message: 'User is already active' });
  }

  user.activateUser(); // Call the method to activate the user
  res.status(200).json({ message: 'User has been activated', activatedAt: user.activatedAt });
});

// 3. Deactivate User
router.put('/deactivate/:userId', userExists, async (req, res) => {
  const { user } = req;

  if (!user.isActive) {
    return res.status(400).json({ message: 'User is already inactive' });
  }

  user.deactivateUser(); // Call the method to deactivate the user
  res.status(200).json({ message: 'User has been deactivated', deactivatedAt: user.deactivatedAt });
});


module.exports = router;