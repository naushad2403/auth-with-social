const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  // Extract the token from the Authorization header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // If no token is provided, return an unauthorized error
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token using the secret key from environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Store the decoded user information (e.g., user ID) in the request object
    req.user = decoded;

    // Call the next middleware or route handler
    next();
  } catch (err) {
    // If token is invalid or expired
    return res.status(400).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = authenticate;
