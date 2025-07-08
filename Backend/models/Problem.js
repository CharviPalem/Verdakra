const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Problem title is required'],
      trim: true,
      maxlength: [200, 'Problem title cannot exceed 200 characters']
    },
    slug: {
      type: String,
      required: [true, 'Problem slug is required'],
      unique: true,
      trim: true,
      lowercase: true
    },
    description: {
      type: String,
      required: [true, 'Problem description is required']
    },
    difficulty: {
      type: String,
      required: [true, 'Problem difficulty is required'],
      enum: ['easy', 'medium', 'hard']
    },
    constraints: {
      type: String,
      required: [true, 'Problem constraints are required']
    },
    inputFormat: {
      type: String,
      required: [true, 'Input format is required']
    },
    outputFormat: {
      type: String,
      required: [true, 'Output format is required']
    },
    sampleTestCases: [
      {
        input: String,
        output: String,
        explanation: String
      }
    ],
    testCases: [
      {
        input: String,
        output: String,
        isHidden: {
          type: Boolean,
          default: true
        }
      }
    ],
    timeLimit: {
      type: Number,
      required: [true, 'Time limit is required'],
      default: 1000 // in milliseconds
    },
    memoryLimit: {
      type: Number,
      required: [true, 'Memory limit is required'],
      default: 256 // in MB
    },
    tags: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Problem must have an author']
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    acceptedCount: {
      type: Number,
      default: 0
    },
    submissionCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Create text index for search functionality
ProblemSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual property for acceptance rate
ProblemSchema.virtual('acceptanceRate').get(function() {
  return this.submissionCount > 0 ? (this.acceptedCount / this.submissionCount * 100).toFixed(2) : 0;
});

module.exports = mongoose.model('Problem', ProblemSchema);
