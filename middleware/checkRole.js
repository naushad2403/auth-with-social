// middleware/checkRole.js
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
      const userRole = req.user.role; // Assuming the user info is attached to req.user by JWT authentication
      // Check if the user's role is one of the allowed roles
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          message: 'Access denied. You do not have permission to access this resource.',
        });
      }
      next(); // Proceed to the next middleware or route handler if the role matches
    };
  };
  
  module.exports = checkRole;
  