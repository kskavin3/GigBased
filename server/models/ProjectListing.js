const mongoose = require('mongoose');

const ProjectListingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  budget: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'ETH'
  },
  duration: {
    type: String,
    required: true
  },
  skillsRequired: [{
    type: String,
    required: true
  }],
  projectType: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: 'Remote'
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'draft'
  },
  timeline: {
    startDate: {
      type: String,
      required: true
    },
    endDate: {
      type: String,
      required: true
    },
    milestones: [{
      title: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      dueDate: {
        type: String,
        required: true
      },
      timeInWeeks: {
        type: Number,
        required: true,
        min: 1
      },
      budgetPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },
      approvalTime: {
        type: Number,
        required: true,
        min: 24,
        max: 72
      },
      stageType: {
        type: String,
        required: true,
        enum: ['Documentation', 'Code Submission', 'Approval']
      }
    }]
  },
  clientId: {
    type: String,
    required: true
  },
  clientWallet: {
    type: String,
    required: true
  },
  applicants: [{
    developerId: String,
    developerWallet: String,
    githubUsername: String,
    appliedAt: {
      type: Date,
      default: Date.now
    },
    proposal: String,
    proposedBudget: Number
  }],
  postedDate: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
ProjectListingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ProjectListing', ProjectListingSchema); 