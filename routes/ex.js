const express = require('express');
const router = express.Router();
const checkRole = require('../middleware/checkRole');
const authenticate = require("./../middleware/authMiddleware");
// Example Route: Only 'editor' or 'author' can access
router.get('/editor', authenticate, checkRole(['editor', 'author']), (req, res) => {
    res.json({ message: 'Welcome to the editor dashboard!' });
  });
  
  // Example Route: Only 'author' can access
  router.get('/author', authenticate, checkRole(['author']), (req, res) => {
    res.json({ message: 'Welcome to the author dashboard!' });
  });
  
  // Example Route: Only 'user' can access
  router.get('/user', authenticate, checkRole(['user']), (req, res) => {
    res.json({ message: 'Welcome to the user dashboard!' });
  });

  
module.exports = router;