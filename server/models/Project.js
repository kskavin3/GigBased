const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },
  completedAt: Date
});

const ProjectSchema = new mongoose.Schema({
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
  clientId: {
    type: String,
    required: true
  },
  clientWallet: {
    type: String,
    required: true
  },
  assignedDeveloper: {
    developerId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    avatar: String,
    githubUsername: String,
    walletAddress: String
  },
  timeline: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    milestones: [MilestoneSchema]
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'on_hold', 'cancelled'],
    default: 'in_progress'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  originalListingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProjectListing'
  },
  contractAddress: String, // Smart contract address for escrow
  transactionHash: String, // Initial funding transaction
  paymentHistory: [{
    amount: Number,
    transactionHash: String,
    milestone: String,
    paidAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
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

// Update progress based on completed milestones
ProjectSchema.methods.updateProgress = function() {
  const totalMilestones = this.timeline.milestones.length;
  if (totalMilestones === 0) {
    this.progress = 0;
    return;
  }
  
  const completedMilestones = this.timeline.milestones.filter(
    milestone => milestone.status === 'completed'
  ).length;
  
  this.progress = Math.round((completedMilestones / totalMilestones) * 100);
  
  // Auto-complete project if all milestones are done
  if (this.progress === 100 && this.status === 'in_progress') {
    this.status = 'completed';
  }
};

// Update the updatedAt field before saving
ProjectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.updateProgress();
  next();
});

module.exports = mongoose.model('Project', ProjectSchema); 