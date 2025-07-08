const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
  getAllContests,
  createContest,
  getSingleContest,
  editContest,
  deleteContest,
  getRecentContests,
  registerContest,
  getContestLeaderboard,
  getAllContestsLeaderboard
} = require('../controllers/contestController');

// Public routes
router.get('/', getAllContests);
router.get('/recent', getRecentContests);
router.get('/leaderboard', getAllContestsLeaderboard);
router.get('/:id', getSingleContest);
router.get('/:id/leaderboard', getContestLeaderboard);

// Protected routes (require login)
router.post('/:id/register', protect, registerContest);

// Admin and creator routes
router.post('/', protect, restrictTo('admin', 'creator'), createContest);
router.put('/:id', protect, editContest); // Authorization handled in controller
router.delete('/:id', protect, deleteContest); // Authorization handled in controller

module.exports = router;
