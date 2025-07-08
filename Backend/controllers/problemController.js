const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const mongoose = require('mongoose');
const slugify = require('slugify');

// Get all problems
const getAllProblems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Apply filters if provided
    if (req.query.difficulty) {
      filter.difficulty = req.query.difficulty;
    }
    
    if (req.query.tags) {
      filter.tags = { $in: Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags] };
    }
    
    // Only show public problems unless user is admin
    if (!req.user || req.user.role !== 'admin') {
      filter.isPublic = true;
    }
    
    const problems = await Problem.find(filter)
      .skip(skip)
      .limit(limit)
      .select('title slug difficulty acceptedCount submissionCount tags createdAt')
      .sort(req.query.sort || '-createdAt');
    
    const total = await Problem.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: problems.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: problems
    });
  } catch (error) {
    console.error('Error getting all problems:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve problems',
      error: error.message
    });
  }
};

// Create new problem
const createProblem = async (req, res) => {
  try {
    // Add creator info
    req.body.createdBy = req.user.id;
    
    // Generate slug from title if not provided
    if (!req.body.slug) {
      req.body.slug = slugify(req.body.title, { lower: true });
    }
    
    const problem = await Problem.create(req.body);
    
    res.status(201).json({
      success: true,
      data: problem
    });
  } catch (error) {
    console.error('Error creating problem:', error);
    
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({
        success: false,
        message: 'A problem with that slug already exists',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create problem',
      error: error.message
    });
  }
};

// Get problem by ID
const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id)
      .populate('createdBy', 'name');
      
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }
    
    // Check if problem is public or user is creator/admin
    if (!problem.isPublic && 
        (!req.user || 
         (req.user.id !== problem.createdBy.toString() && 
          req.user.role !== 'admin'))) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this problem'
      });
    }
    
    res.status(200).json({
      success: true,
      data: problem
    });
  } catch (error) {
    console.error('Error getting problem by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve problem',
      error: error.message
    });
  }
};

// Get problem by slug
const getProblemBySlug = async (req, res) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug })
      .populate('createdBy', 'name');
      
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }
    
    // Check if problem is public or user is creator/admin
    if (!problem.isPublic && 
        (!req.user || 
         (req.user.id !== problem.createdBy.toString() && 
          req.user.role !== 'admin'))) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this problem'
      });
    }
    
    res.status(200).json({
      success: true,
      data: problem
    });
  } catch (error) {
    console.error('Error getting problem by slug:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve problem',
      error: error.message
    });
  }
};

// Edit problem
const editProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }
    
    // Check if user has permission to edit
    if (req.user.id !== problem.createdBy.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this problem'
      });
    }
    
    // If title is changed, update the slug
    if (req.body.title && req.body.title !== problem.title) {
      req.body.slug = slugify(req.body.title, { lower: true });
    }
    
    const updatedProblem = await Problem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedProblem
    });
  } catch (error) {
    console.error('Error updating problem:', error);
    
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({
        success: false,
        message: 'A problem with that slug already exists',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update problem',
      error: error.message
    });
  }
};

// Delete problem
const deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }
    
    // Check if user has permission to delete
    if (req.user.id !== problem.createdBy.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this problem'
      });
    }
    
    await Problem.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Problem deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting problem:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete problem',
      error: error.message
    });
  }
};

// Get problem leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const problemId = req.params.id;
    
    // Verify problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }
    
    // Get successful submissions grouped by user
    const leaderboard = await Submission.aggregate([
      { $match: { 
          problem: mongoose.Types.ObjectId(problemId),
          status: 'accepted'
        }
      },
      { $sort: { executionTime: 1, memoryUsage: 1, submittedAt: 1 } },
      { $group: {
          _id: '$user',
          executionTime: { $first: '$executionTime' },
          memoryUsage: { $first: '$memoryUsage' },
          language: { $first: '$language' },
          submittedAt: { $first: '$submittedAt' }
        }
      },
      { $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      { $project: {
          user: { _id: '$_id', name: '$userInfo.name' },
          executionTime: 1,
          memoryUsage: 1,
          language: 1,
          submittedAt: 1
        }
      },
      { $sort: { executionTime: 1, memoryUsage: 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      count: leaderboard.length,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error getting problem leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve leaderboard',
      error: error.message
    });
  }
};

// Get solved problems for current user
const getSolvedProblems = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all problems solved by user
    const solvedProblems = await Submission.aggregate([
      { $match: { 
          user: mongoose.Types.ObjectId(userId),
          status: 'accepted'
        }
      },
      { $group: { _id: '$problem' } },
      { $lookup: {
          from: 'problems',
          localField: '_id',
          foreignField: '_id',
          as: 'problemInfo'
        }
      },
      { $unwind: '$problemInfo' },
      { $project: {
          _id: '$problemInfo._id',
          title: '$problemInfo.title',
          slug: '$problemInfo.slug',
          difficulty: '$problemInfo.difficulty'
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      count: solvedProblems.length,
      data: solvedProblems
    });
  } catch (error) {
    console.error('Error getting solved problems:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve solved problems',
      error: error.message
    });
  }
};

// Get problems added data (statistics)
const getProblemsAddedData = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get problems added per day for the last 30 days
    const problemsAddedData = await Problem.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Count problems by difficulty
    const problemsByDifficulty = await Problem.aggregate([
      { $group: {
          _id: '$difficulty',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Count problems by tags
    const problemsByTags = await Problem.aggregate([
      { $unwind: '$tags' },
      { $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        recentTrend: problemsAddedData,
        byDifficulty: problemsByDifficulty,
        byTags: problemsByTags
      }
    });
  } catch (error) {
    console.error('Error getting problems added data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve problems data',
      error: error.message
    });
  }
};

module.exports = {
  getAllProblems,
  createProblem,
  getProblemById,
  getProblemBySlug,
  editProblem,
  deleteProblem,
  getLeaderboard,
  getSolvedProblems,
  getProblemsAddedData
};
