const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
  getAllSubmissions,
  createSubmission,
  getUserSubmissions,
  getAllUserSubmissions,
  getSingleSubmission,
  editSubmission,
  deleteSubmission,
  getSubmissionsData,
  retrieveLastSubmittedCode
} = require('../controllers/submissionController');

// Protected routes (require login)
router.get('/me', protect, getUserSubmissions);
router.get('/user/:userId', protect, getAllUserSubmissions); // Authorization handled in controller
router.get('/stats', protect, restrictTo('admin'), getSubmissionsData);
router.get('/:id', protect, getSingleSubmission); // Authorization handled in controller
router.post('/', protect, createSubmission);
router.get('/problem/:problemId/last-code', protect, retrieveLastSubmittedCode);

// Admin routes
router.get('/', protect, restrictTo('admin'), getAllSubmissions);
router.put('/:id', protect, restrictTo('admin'), editSubmission);
router.delete('/:id', protect, restrictTo('admin'), deleteSubmission);

module.exports = router;
