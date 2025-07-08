const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  resetPassword,
  verifyResetToken,
  completePasswordReset 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/reset-password', resetPassword);
router.get('/reset-password/:token', verifyResetToken);
router.post('/reset-password/:token', completePasswordReset);

// Protected route
router.get('/me', protect, getMe);

module.exports = router;
