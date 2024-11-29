// roleMiddleware.js
function checkRole(requiredRole) {
  return (req, res, next) => {
      // Check if req.user exists, indicating the user is authenticated
      if (!req.user) {
          return res.status(403).json({ message: 'Access forbidden: user not authenticated' });
      }

      // Check if user has the required role
      if (req.user.role !== requiredRole) {
          return res.status(403).json({ message: 'Access forbidden: insufficient permissions' });
      }

      // User is authenticated and has the correct role
      next();
  };
}

module.exports = checkRole;
