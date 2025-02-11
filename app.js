const express = require('express');
const session = require('express-session');
const cors = require('cors'); // Import the cors package
const connectDB = require('./config/db');
require('dotenv').config();
const checkRole = require('./middleware/checkRole');
const authenticate = require('./middleware/authMiddleware');
const app = express();
app.set('view engine', 'ejs');  // Make sure to set the view engine for your app

// Enable CORS for all routes
app.use(cors());
// Connect to MongoDB
connectDB();
// Middleware to parse URL-encoded data (e.g., form submissions)
app.use(express.urlencoded({ extended: true })); // This is necessary for form data
// Middleware
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
// Routes
app.use('/auth', require('./routes/auth'));
app.use('/api', require('./routes/ex'));
app.use('/api/user', require('./routes/user'));
app.use('/admin',authenticate, checkRole('admin'), require('./routes/admin'));


// Home Route
app.get('/', (req, res) => {
  res.send('Welcome to the Authentication API');
});

module.exports = app;