const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
  getAllProblems,
  createProblem,
  getProblemById,
  getProblemBySlug,
  editProblem,
  deleteProblem,
  getLeaderboard,
  getSolvedProblems,
  getProblemsAddedData
} = require('../controllers/problemController');

// Public routes
router.get('/', getAllProblems);
router.get('/slug/:slug', getProblemBySlug);
router.get('/:id/leaderboard', getLeaderboard);

// Protected routes (require login)
router.get('/solved', protect, getSolvedProblems);
router.get('/stats', protect, getProblemsAddedData);
router.get('/:id', protect, getProblemById);

// Admin and creator routes
router.post('/', protect, restrictTo('admin', 'creator'), createProblem);
router.put('/:id', protect, editProblem); // Authorization handled in controller
router.delete('/:id', protect, deleteProblem); // Authorization handled in controller

module.exports = router;
