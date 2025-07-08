const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const Contest = require('../models/Contest');
const mongoose = require('mongoose');
const { judgeSubmission } = require('../code-execution/judge');

// Get all submissions (admin only)
const getAllSubmissions = async (req, res) => {
  try {
    // Check admin permissions
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource'
      });
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Apply filters if provided
    if (req.query.problem) {
      filter.problem = req.query.problem;
    }
    
    if (req.query.user) {
      filter.user = req.query.user;
    }
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.contest) {
      filter.contest = req.query.contest;
    }
    
    if (req.query.language) {
      filter.language = req.query.language;
    }
    
    const submissions = await Submission.find(filter)
      .skip(skip)
      .limit(limit)
      .populate('user', 'name')
      .populate('problem', 'title slug')
      .populate('contest', 'title slug')
      .sort(req.query.sort || '-createdAt');
   
    // Filter out submissions with missing problem reference
    const filteredSubmissions = submissions.filter(sub => sub.problem);
    const total = await Submission.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: filteredSubmissions.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: filteredSubmissions
    });
  } catch (error) {
    console.error('Error getting all submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve submissions',
      error: error.message
    });
  }
};

// Create new submission
const createSubmission = async (req, res) => {
  try {
    // Add user info
    req.body.user = req.user.id;
    
    // Verify problem exists
    const problem = await Problem.findById(req.body.problem);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }
    // Ensure the correct problem ID is used for creating the submission
    req.body.problem = problem._id;
    
    // Verify contest if provided
    if (req.body.contest) {
      const contest = await Contest.findById(req.body.contest);
      if (!contest) {
        return res.status(404).json({
          success: false,
          message: 'Contest not found'
        });
      }
      
      // Check if contest is active
      const now = new Date();
      if (now < contest.startTime || now > contest.endTime) {
        return res.status(400).json({
          success: false,
          message: 'Contest is not active'
        });
      }
      
      // Check if user is registered for the contest
      if (!contest.registeredUsers.includes(req.user.id)) {
        return res.status(403).json({
          success: false,
          message: 'You are not registered for this contest'
        });
      }
    }
    
    // Make submission public by default
    req.body.isPublic = true;

    // Create submission
    const submission = await Submission.create(req.body);
    
    // Update problem submission count
    await Problem.findByIdAndUpdate(req.body.problem, {
      $inc: { submissionCount: 1 }
    });
    
    // Set initial status to pending and save
    submission.status = 'pending';
    await submission.save();

    // Asynchronously judge the submission
    judgeSubmission(submission._id);
    
    res.status(201).json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Error creating submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create submission',
      error: error.message
    });
  }
};

// Get user's submissions
const getUserSubmissions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const filter = { user: req.user.id };
    
    // Apply filters if provided
    if (req.query.problem) {
      filter.problem = req.query.problem;
    }
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.contest) {
      filter.contest = req.query.contest;
    }
    
    if (req.query.language) {
      filter.language = req.query.language;
    }
    
    const submissions = await Submission.find(filter)
      .skip(skip)
      .limit(limit)
      .populate('problem', 'title slug')
      .populate('contest', 'title slug')
      .sort(req.query.sort || '-createdAt');
    
    const total = await Submission.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: submissions.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: submissions
    });
  } catch (error) {
    console.error('Error getting user submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve submissions',
      error: error.message
    });
  }
};

// Get all submissions for a specific user (admin or own submissions)
const getAllUserSubmissions = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check if user has permission to view these submissions
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view these submissions'
      });
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const filter = { user: userId };
    
    // Apply filters if provided
    if (req.query.problem) {
      filter.problem = req.query.problem;
    }
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    const submissions = await Submission.find(filter)
      .skip(skip)
      .limit(limit)
      .populate('problem', 'title slug')
      .populate('contest', 'title slug')
      .sort(req.query.sort || '-createdAt');
    
    const total = await Submission.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: submissions.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: submissions
    });
  } catch (error) {
    console.error('Error getting all user submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve submissions',
      error: error.message
    });
  }
};

// Get single submission
const getSingleSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('user', 'name') // Keep user population
      .populate('problem', 'title slug') // Ensure problem is populated
      .populate('contest', 'title slug'); // Keep contest population
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    // Check if user has permission to view this submission
    if (!submission.isPublic && 
        req.user.id !== submission.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this submission'
      });
    }
    
    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Error getting submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve submission',
      error: error.message
    });
  }
};

// Edit submission (only admin)
const editSubmission = async (req, res) => {
  try {
    // Only admins can edit submissions
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit submissions'
      });
    }
    
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    // Update submission status
    const updatedSubmission = await Submission.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    // If status changed to accepted, update problem accepted count
    if (req.body.status === 'accepted' && submission.status !== 'accepted') {
      await Problem.findByIdAndUpdate(submission.problem, {
        $inc: { acceptedCount: 1 }
      });
    }
    
    res.status(200).json({
      success: true,
      data: updatedSubmission
    });
  } catch (error) {
    console.error('Error updating submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update submission',
      error: error.message
    });
  }
};

// Delete submission (admin only)
const deleteSubmission = async (req, res) => {
  try {
    // Only admins can delete submissions
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete submissions'
      });
    }
    
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    await Submission.findByIdAndDelete(req.params.id);
    
    // Update problem counts if needed
    if (submission.status === 'accepted') {
      await Problem.findByIdAndUpdate(submission.problem, {
        $inc: { acceptedCount: -1, submissionCount: -1 }
      });
    } else {
      await Problem.findByIdAndUpdate(submission.problem, {
        $inc: { submissionCount: -1 }
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete submission',
      error: error.message
    });
  }
};

// Get submissions data for statistics
const getSubmissionsData = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get submissions per day for the last 30 days
    const submissionsPerDay = await Submission.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get submissions by status
    const submissionsByStatus = await Submission.aggregate([
      { $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get submissions by language
    const submissionsByLanguage = await Submission.aggregate([
      { $group: {
          _id: '$language',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        recentTrend: submissionsPerDay,
        byStatus: submissionsByStatus,
        byLanguage: submissionsByLanguage
      }
    });
  } catch (error) {
    console.error('Error getting submissions data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve submissions data',
      error: error.message
    });
  }
};

// Retrieve last submitted code for a problem
const retrieveLastSubmittedCode = async (req, res) => {
  try {
    const userId = req.user.id;
    const problemId = req.params.problemId;
    
    // Find the most recent submission for this problem by the user
    const submission = await Submission.findOne({
      user: userId,
      problem: problemId
    })
    .sort('-createdAt')
    .select('code language createdAt');
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'No previous submissions found for this problem'
      });
    }
    
    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Error retrieving last submitted code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve last submitted code',
      error: error.message
    });
  }
};

module.exports = {
  getAllSubmissions,
  createSubmission,
  getUserSubmissions,
  getAllUserSubmissions,
  getSingleSubmission,
  editSubmission,
  deleteSubmission,
  getSubmissionsData,
  retrieveLastSubmittedCode
};
