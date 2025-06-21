const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const developerSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  githubUsername: {
    type: String,
    required: [true, 'GitHub username is required'],
    unique: true,
    trim: true
  },
  walletAddress: {
    type: String,
    required: [true, 'Wallet address is required'],
    unique: true,
    trim: true,
    match: [/^0x[a-fA-F0-9]{40}$/, 'Please provide a valid Ethereum wallet address']
  },
  userType: {
    type: String,
    required: true,
    enum: ['developer'],
    default: 'developer'
  },
  authMethod: {
    type: String,
    required: true,
    enum: ['email', 'wallet'],
    default: 'email'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isWalletVerified: {
    type: Boolean,
    default: false
  },
  profile: {
    firstName: String,
    lastName: String,
    bio: String,
    avatar: String,
    location: String,
    website: String,
    portfolio: String,
    linkedIn: String,
    yearsOfExperience: Number,
    hourlyRate: Number,
    availability: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'not-available'],
      default: 'contract'
    }
  },
  skills: {
    languages: [String],
    frameworks: [String],
    tools: [String],
    specializations: [String]
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    currency: { type: String, default: 'ETH' },
    timezone: String,
    projectTypes: [String],
    minBudget: Number,
    maxBudget: Number
  },
  stats: {
    projectsApplied: { type: Number, default: 0 },
    projectsCompleted: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 }
  },
  applications: [{
    projectListingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProjectListing'
    },
    appliedAt: { type: Date, default: Date.now },
    proposal: String,
    proposedBudget: Number,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending'
    }
  }],
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries
developerSchema.index({ email: 1 });
developerSchema.index({ walletAddress: 1 });
developerSchema.index({ githubUsername: 1 });
developerSchema.index({ createdAt: -1 });
developerSchema.index({ 'skills.languages': 1 });
developerSchema.index({ 'skills.frameworks': 1 });

// Virtual for full name
developerSchema.virtual('fullName').get(function() {
  if (this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.githubUsername;
});

// Pre-save middleware to hash password
developerSchema.pre('save', async function(next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with salt rounds of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
developerSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to get public profile (without sensitive data)
developerSchema.methods.getPublicProfile = function() {
  const developerObject = this.toObject();
  delete developerObject.password;
  return developerObject;
};

// Static method to find by email or wallet
developerSchema.statics.findByEmailOrWallet = function(email, walletAddress) {
  return this.findOne({
    $or: [
      { email: email.toLowerCase() },
      { walletAddress: walletAddress }
    ]
  });
};

// Update last login
developerSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

module.exports = mongoose.model('Developer', developerSchema); 