const mongoose = require('mongoose');

const ContestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Contest title is required'],
      trim: true,
      maxlength: [200, 'Contest title cannot exceed 200 characters']
    },
    slug: {
      type: String,
      required: [true, 'Contest slug is required'],
      unique: true,
      trim: true,
      lowercase: true
    },
    description: {
      type: String,
      required: [true, 'Contest description is required']
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required']
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required']
    },
    problems: [
      {
        problem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Problem',
          required: [true, 'Problem reference is required']
        },
        points: {
          type: Number,
          required: [true, 'Points for problem are required'],
          min: [0, 'Points cannot be negative']
        }
      }
    ],
    visibility: {
      type: String,
      enum: ['public', 'private', 'password-protected'],
      default: 'public'
    },
    password: {
      type: String,
      select: false // Don't send password in API responses
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Contest must have an author']
    },
    registeredUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    isActive: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Virtual property for contest status
ContestSchema.virtual('status').get(function() {
  const now = new Date();
  if (now < this.startTime) return 'upcoming';
  if (now >= this.startTime && now <= this.endTime) return 'ongoing';
  return 'completed';
});

// Virtual property for contest duration in minutes
ContestSchema.virtual('durationMinutes').get(function() {
  return Math.ceil((this.endTime - this.startTime) / (1000 * 60));
});

module.exports = mongoose.model('Contest', ContestSchema);
