const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const Contest = require('../models/Contest');
const mongoose = require('mongoose');
const { judgeSubmission } = require('../code-execution/judge');
const { GoogleGenerativeAI } = require('@google/generative-ai');

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

// Analyze submission with AI
// const analyzeSubmission = async (req, res) => {
//   try {
//     console.log('Starting AI analysis for submission:', req.params.id);
    
//     const submissionId = req.params.id;
//     if (!mongoose.Types.ObjectId.isValid(submissionId)) {
//       console.error('Invalid submission ID format:', submissionId);
//       return res.status(400).json({ success: false, message: 'Invalid submission ID format' });
//     }

//     const submission = await Submission.findById(submissionId)
//       .populate("user", "username")
//       .populate("problem");

//     if (!submission) {
//       console.error('Submission not found:', submissionId);
//       return res.status(404).json({ success: false, message: 'Submission not found' });
//     }

//     if (!submission.problem) {
//       console.error('Problem not found for submission:', submissionId);
//       return res.status(404).json({ success: false, message: 'Problem not found for this submission' });
//     }

//     const apiKey = process.env.GEMINI_API_KEY;
//     if (!apiKey) {
//       console.error('GEMINI_API_KEY is not set');
//       return res.status(500).json({ 
//         success: false, 
//         message: 'AI service is not configured. Missing API key.' 
//       });
//     }

//     try {
//       console.log('Initializing GoogleGenerativeAI...');
//       console.log('API Key starts with:', apiKey ? `${apiKey.substring(0, 5)}...` : 'undefined');
      
//       const genAI = new GoogleGenerativeAI(apiKey.trim());
//       console.log('GoogleGenerativeAI initialized successfully');
      
//       console.log('Getting model...');
//       // Use the correct model name and API version
//       const model = genAI.getGenerativeModel({ 
//         model: 'gemini-2.0-flash',
//         apiVersion: 'v1beta'
//       });
//       console.log('Model loaded successfully');

//       console.log('Generating AI prompt...');
//       const prompt = [
//         `Role: You are an expert programming judge and mentor. Your task is to analyze a user's code submission for a competitive programming problem.`,
//         `Problem Title: ${submission.problem?.title || 'N/A'}`,
//         `Problem Description: ${submission.problem?.description || 'N/A'}`,
//         `Problem Constraints: ${submission.problem?.constraints || 'N/A'}`,
//         `User's Code (Language: ${submission.language || 'N/A'}):\n${submission.code || 'No code provided'}`,
//         `Please analyze this code and provide feedback on:
//         1. Time complexity
//         2. Space complexity
//         3. Potential optimizations
//         4. Alternative approaches
        
//         Format your response in clear, well-structured markdown.`
//       ].filter(Boolean).join("\n\n");

//       console.log('Sending request to Gemini API...');
//       console.log('Prompt length:', prompt.length);
      
//       try {
//         console.log('Calling model.generateContent...');
//         // Use the correct API format for the Gemini 2.0 Flash model
//         const result = await model.generateContent({
//           contents: [{
//             role: 'user',
//             parts: [{
//               text: prompt
//             }]
//           }]
//         });
//         console.log('generateContent completed, getting response...');
        
//         const response = await result.response;
//         console.log('Response received. Response structure:', Object.keys(response));
        
//         // Log the full response for debugging
//         console.log('Full response:', JSON.stringify(response, null, 2));
        
//         // Handle the response from Gemini 2.0 Flash
//         let analysisText = '';
        
//         // The response should have candidates array with content
//         if (response.candidates && response.candidates.length > 0) {
//           const candidate = response.candidates[0];
//           if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
//             analysisText = candidate.content.parts[0].text || '';
//             console.log('Extracted analysis text from response');
//           }
//         }
        
//         if (!analysisText) {
//           console.error('Could not extract text from the AI response. Response structure:', 
//             JSON.stringify(response, null, 2));
//           throw new Error('The AI response did not contain any analysis text.');
//         }
        
//         console.log('Successfully extracted analysis text. Length:', analysisText?.length || 0);
//         return analysisText;
//       } catch (apiError) {
//         console.error('Error in Gemini API call:', {
//           name: apiError.name,
//           message: apiError.message,
//           stack: apiError.stack,
//           response: apiError.response?.data || 'No response data'
//         });
//         throw new Error(`AI service error: ${apiError.message}`);
//       }
      
//       console.log('AI Analysis successful');

//       return res.status(200).json({
//         success: true,
//         data: { analysis: analysisText }
//       });
//     } catch (aiError) {
//       console.error('Error in AI analysis:', aiError);
//       return res.status(500).json({
//         success: false,
//         message: 'Error processing AI analysis',
//         error: aiError.message
//       });
//     }
//   } catch (error) {
//     console.error('Error in analyzeSubmission:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'An error occurred while analyzing the submission.',
//       error: error.message,
//     });
//   }
// };
const analyzeSubmission = async (req, res) => {
  console.log('Analyze submission endpoint hit');
  try {
    console.log('Submission ID:', req.params.id);
    const submissionId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      console.error('Invalid submission ID format');
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid submission ID format' 
      });
    }

    console.log('Fetching submission from database...');
    const submission = await Submission.findById(submissionId)
      .populate("user", "username")
      .populate("problem");

    if (!submission) {
      console.error('Submission not found');
      return res.status(404).json({ 
        success: false, 
        message: 'Submission not found' 
      });
    }

    console.log('Checking for problem...');
    if (!submission.problem) {
      console.error('Problem not found for submission');
      return res.status(404).json({ 
        success: false, 
        message: 'Problem not found for this submission' 
      });
    }

    console.log('Getting API key...');
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set');
      return res.status(500).json({ 
        success: false, 
        message: 'AI service is not configured. Missing API key.' 
      });
    }

    console.log('Initializing GoogleGenerativeAI...');
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    console.log('Getting model...');
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      apiVersion: 'v1beta'
    });
    console.log('Model loaded successfully');

    console.log('Generating prompt...');
    const prompt = [
      `Role: You are an expert programming judge and mentor. Your task is to analyze a user's code submission for a competitive programming problem.`,
      `Problem Title: ${submission.problem?.title || 'N/A'}`,
      `Problem Description: ${submission.problem?.description || 'N/A'}`,
      `Problem Constraints: ${submission.problem?.constraints || 'N/A'}`,
      `User's Code (Language: ${submission.language || 'N/A'}):\n${submission.code || 'No code provided'}`,
      `Please analyze this code and provide feedback on:
      1. Time complexity
      2. Space complexity
      3. Potential optimizations
      4. Alternative approaches
      
      Format your response in clear, well-structured markdown.`
    ].filter(Boolean).join("\n\n");

    console.log('Sending request to Gemini API...');
    console.log('Prompt length:', prompt.length);
    
    try {
      console.log('Calling model.generateContent...');
      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [{
            text: prompt
          }]
        }]
      });
      
      console.log('Got response from Gemini API');
      const response = await result.response;
      console.log('Response received. Response keys:', Object.keys(response));
      
      // Log the full response for debugging
      console.log('Full response:', JSON.stringify(response, null, 2));
      
      let analysisText = '';
      
      // Handle the response from Gemini 2.0 Flash
      if (response.candidates && response.candidates.length > 0) {
        const candidate = response.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          analysisText = candidate.content.parts[0].text || '';
          console.log('Extracted analysis text from response');
        }
      }
      
      if (!analysisText) {
        console.error('Could not extract text from the AI response. Response structure:', 
          JSON.stringify(response, null, 2));
        throw new Error('The AI response did not contain any analysis text.');
      }
      
      console.log('Sending success response');
      return res.status(200).json({
        success: true,
        data: { analysis: analysisText }
      });
      
    } catch (apiError) {
      console.error('Error in Gemini API call:', {
        name: apiError.name,
        message: apiError.message,
        stack: apiError.stack,
        response: apiError.response?.data || 'No response data'
      });
      throw apiError;
    }

  } catch (error) {
    console.error('Error in analyzeSubmission:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing AI analysis',
      error: error.message,
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
  analyzeSubmission,
};
