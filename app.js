const express = require('express');
const session = require('express-session');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();

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

// Home Route
app.get('/', (req, res) => {
  res.send('Welcome to the Authentication API');
});

module.exports = app;