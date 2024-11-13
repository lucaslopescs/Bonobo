// roleMiddleware.js
function checkRole(requiredRole) {
    return (req, res, next) => {
      if (req.user && req.user.role === requiredRole) {
        next(); // User has the required role, proceed
      } else {
        res.status(403).send('Access forbidden: insufficient permissions');
      }
    };
  }
  
  module.exports = checkRole;