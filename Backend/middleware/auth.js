const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes - check if user is logged in
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please log in to get access.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Not authorized to access this route'
    });
  }
};

// Middleware to restrict access to certain roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check if user role is included in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

// Middleware to check if user is the creator of the resource or an admin
exports.isCreatorOrAdmin = (Model) => async (req, res, next) => {
  try {
    // Get resource ID from parameters
    const resourceId = req.params.id;
    
    // Find the resource
    const resource = await Model.findById(resourceId);
    
    // Check if resource exists
    if (!resource) {
      return res.status(404).json({
        status: 'fail',
        message: 'Resource not found'
      });
    }
    
    // Check if user is creator or admin
    if (
      (resource.creator && resource.creator.toString() === req.user.id) || 
      req.user.role === 'admin'
    ) {
      req.resource = resource; // Optionally attach resource to request
      return next();
    }
    
    // If not creator or admin, deny access
    return res.status(403).json({
      status: 'fail',
      message: 'You do not have permission to perform this action'
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Server error when checking permissions'
    });
  }
};
