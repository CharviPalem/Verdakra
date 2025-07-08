const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all dashboard stats for the logged-in user
// @route   GET /api/dashboard/stats
// @access  Private
router.get('/stats', protect, getDashboardStats);

module.exports = router;
