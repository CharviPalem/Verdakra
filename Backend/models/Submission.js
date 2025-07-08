const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: [true, 'Problem reference is required']
    },
    contest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contest'
      // Not required as submissions can be made outside of contests
    },
    language: {
      type: String,
      required: [true, 'Programming language is required'],
      enum: ['c', 'cpp', 'java', 'python', 'javascript']
    },
    code: {
      type: String,
      required: [true, 'Code submission is required']
    },
    status: {
      type: String,
      enum: ['pending', 'judging', 'accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'runtime_error', 'compilation_error'],
      default: 'pending'
    },
    testCaseResults: [
      {
        testCaseNumber: Number,
        passed: Boolean,
        executionTime: Number, // in milliseconds
        memoryUsage: Number, // in KB
        errorMessage: String
      }
    ],
    executionTime: {
      type: Number,
      default: 0 // in milliseconds
    },
    memoryUsage: {
      type: Number,
      default: 0 // in KB
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Create index for faster queries
SubmissionSchema.index({ user: 1, problem: 1, submittedAt: -1 });
SubmissionSchema.index({ contest: 1, submittedAt: -1 });

module.exports = mongoose.model('Submission', SubmissionSchema);
