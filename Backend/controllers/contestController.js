const Contest = require('../models/Contest');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const User = require('../models/User');
const mongoose = require('mongoose');
const slugify = require('slugify');

// Get all contests
const getAllContests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Apply filters for contest status
    if (req.query.status) {
      const now = new Date();
      if (req.query.status === 'upcoming') {
        filter.startTime = { $gt: now };
      } else if (req.query.status === 'ongoing') {
        filter.startTime = { $lte: now };
        filter.endTime = { $gte: now };
      } else if (req.query.status === 'completed') {
        filter.endTime = { $lt: now };
      }
    }
    
    // Only show public contests for non-admin users
    if (!req.user || req.user.role !== 'admin') {
      filter.visibility = 'public';
    }
    
    const contests = await Contest.find(filter)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name')
      .sort(req.query.sort || 'startTime');
    
    const total = await Contest.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: contests.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: contests
    });
  } catch (error) {
    console.error('Error getting all contests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve contests',
      error: error.message
    });
  }
};

// Create new contest
const createContest = async (req, res) => {
  try {
    // Add creator info
    req.body.createdBy = req.user.id;
    
    // Generate slug from title if not provided
    if (!req.body.slug) {
      req.body.slug = slugify(req.body.title, { lower: true });
    }
    
    const contest = await Contest.create(req.body);
    
    res.status(201).json({
      success: true,
      data: contest
    });
  } catch (error) {
    console.error('Error creating contest:', error);
    
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({
        success: false,
        message: 'A contest with that slug already exists',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create contest',
      error: error.message
    });
  }
};

// Get single contest by ID or slug
const getSingleContest = async (req, res) => {
  try {
    const query = mongoose.isValidObjectId(req.params.id) 
      ? { _id: req.params.id } 
      : { slug: req.params.id };
      
    const contest = await Contest.findOne(query)
      .populate('createdBy', 'name')
      .populate('problems.problem', 'title slug difficulty');
      
    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found'
      });
    }
    
    // Check if contest is public or user is creator/admin
    if (contest.visibility !== 'public' && 
        (!req.user || 
         (req.user.id !== contest.createdBy._id.toString() && 
          req.user.role !== 'admin'))) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this contest'
      });
    }
    
    // If contest is ongoing, don't send problem details
    const now = new Date();
    if (now < contest.startTime) {
      // Contest hasn't started yet, remove problem details
      contest.problems = [];
    }
    
    res.status(200).json({
      success: true,
      data: contest
    });
  } catch (error) {
    console.error('Error getting contest:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve contest',
      error: error.message
    });
  }
};

// Edit contest
const editContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    
    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found'
      });
    }
    
    // Check if user has permission to edit
    if (req.user.id !== contest.createdBy.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this contest'
      });
    }
    
    // If title is changed, update the slug
    if (req.body.title && req.body.title !== contest.title) {
      req.body.slug = slugify(req.body.title, { lower: true });
    }
    
    const updatedContest = await Contest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedContest
    });
  } catch (error) {
    console.error('Error updating contest:', error);
    
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({
        success: false,
        message: 'A contest with that slug already exists',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update contest',
      error: error.message
    });
  }
};

// Delete contest
const deleteContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    
    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found'
      });
    }
    
    // Check if user has permission to delete
    if (req.user.id !== contest.createdBy.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this contest'
      });
    }
    
    await Contest.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Contest deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contest:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contest',
      error: error.message
    });
  }
};

// Get recent contests
const getRecentContests = async (req, res) => {
  try {
    const now = new Date();
    const limit = parseInt(req.query.limit) || 5;
    
    // Get upcoming and ongoing contests
    const upcomingContests = await Contest.find({
      startTime: { $gt: now },
      visibility: 'public'
    })
    .populate('createdBy', 'name')
    .sort('startTime')
    .limit(limit);
    
    const ongoingContests = await Contest.find({
      startTime: { $lte: now },
      endTime: { $gte: now },
      visibility: 'public'
    })
    .populate('createdBy', 'name')
    .sort('endTime')
    .limit(limit);
    
    res.status(200).json({
      success: true,
      data: {
        upcoming: upcomingContests,
        ongoing: ongoingContests
      }
    });
  } catch (error) {
    console.error('Error getting recent contests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve recent contests',
      error: error.message
    });
  }
};

// Register for contest
const registerContest = async (req, res) => {
  try {
    const userId = req.user.id;
    const contestId = req.params.id;
    const { password } = req.body;
    
    const contest = await Contest.findById(contestId);
    
    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found'
      });
    }
    
    // Check if contest is password protected
    if (contest.visibility === 'password-protected' && contest.password !== password) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contest password'
      });
    }
    
    // Check if user is already registered
    if (contest.registeredUsers.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this contest'
      });
    }
    
    // Add user to registered users
    contest.registeredUsers.push(userId);
    await contest.save();
    
    res.status(200).json({
      success: true,
      message: 'Successfully registered for contest'
    });
  } catch (error) {
    console.error('Error registering for contest:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register for contest',
      error: error.message
    });
  }
};

// Get contest leaderboard
const getContestLeaderboard = async (req, res) => {
  try {
    const contestId = req.params.id;
    
    // Verify contest exists
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found'
      });
    }
    
    // Get all submissions for this contest
    const submissions = await Submission.find({ 
      contest: contestId,
      submittedAt: { $gte: contest.startTime, $lte: contest.endTime }
    })
    .populate('user', 'name')
    .populate('problem', 'title slug');
    
    // Process submissions to create leaderboard
    const userPoints = {};
    const userSolvedProblems = {};
    const userLastAcceptedTime = {};
    
    submissions.forEach(submission => {
      const userId = submission.user._id.toString();
      const problemId = submission.problem._id.toString();
      
      // Initialize user data if not exists
      if (!userPoints[userId]) {
        userPoints[userId] = 0;
        userSolvedProblems[userId] = new Set();
        userLastAcceptedTime[userId] = 0;
      }
      
      // Only count if problem is not already solved by user
      if (submission.status === 'accepted' && !userSolvedProblems[userId].has(problemId)) {
        const problemPoint = contest.problems.find(p => 
          p.problem.toString() === problemId
        )?.points || 0;
        
        userPoints[userId] += problemPoint;
        userSolvedProblems[userId].add(problemId);
        
        // Update last accepted submission time
        const submissionTime = new Date(submission.submittedAt).getTime();
        if (submissionTime > userLastAcceptedTime[userId]) {
          userLastAcceptedTime[userId] = submissionTime;
        }
      }
    });
    
    // Format leaderboard data
    const leaderboard = await Promise.all(Object.keys(userPoints).map(async (userId) => {
      const user = await User.findById(userId).select('name');
      return {
        user: {
          _id: userId,
          name: user.name
        },
        points: userPoints[userId],
        solvedCount: userSolvedProblems[userId].size,
        lastAcceptedAt: new Date(userLastAcceptedTime[userId])
      };
    }));
    
    // Sort leaderboard by points (desc) and lastAcceptedAt (asc)
    leaderboard.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return a.lastAcceptedAt - b.lastAcceptedAt;
    });
    
    res.status(200).json({
      success: true,
      count: leaderboard.length,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error getting contest leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve contest leaderboard',
      error: error.message
    });
  }
};

// Get all contests leaderboard (combined data for user rankings)
const getAllContestsLeaderboard = async (req, res) => {
  try {
    // Get all completed contests
    const now = new Date();
    const completedContests = await Contest.find({
      endTime: { $lt: now },
      visibility: 'public'
    }).select('_id');
    
    const contestIds = completedContests.map(contest => contest._id);
    
    // Get all accepted submissions for completed contests
    const submissions = await Submission.aggregate([
      { $match: { 
          contest: { $in: contestIds },
          status: 'accepted'
        }
      },
      { $lookup: {
          from: 'contests',
          localField: 'contest',
          foreignField: '_id',
          as: 'contestInfo'
        }
      },
      { $unwind: '$contestInfo' },
      { $lookup: {
          from: 'problems',
          localField: 'problem',
          foreignField: '_id',
          as: 'problemInfo'
        }
      },
      { $unwind: '$problemInfo' },
      { $group: {
          _id: {
            user: '$user',
            contest: '$contest'
          },
          totalPoints: { $sum: 1 }, // Count unique problems solved
          contestCount: { $first: 1 } // Count participation
        }
      },
      { $group: {
          _id: '$_id.user',
          totalScore: { $sum: '$totalPoints' },
          contestsParticipated: { $sum: '$contestCount' }
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
          _id: 1,
          name: '$userInfo.name',
          totalScore: 1,
          contestsParticipated: 1
        }
      },
      { $sort: { totalScore: -1, contestsParticipated: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    console.error('Error getting all contests leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve all contests leaderboard',
      error: error.message
    });
  }
};

module.exports = {
  getAllContests,
  createContest,
  getSingleContest,
  editContest,
  deleteContest,
  getRecentContests,
  registerContest,
  getContestLeaderboard,
  getAllContestsLeaderboard
};
