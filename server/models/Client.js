const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const clientSchema = new mongoose.Schema({
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
    enum: ['project_host'],
    default: 'project_host'
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
    company: String,
    bio: String,
    avatar: String,
    location: String,
    website: String
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    currency: { type: String, default: 'ETH' },
    timezone: String
  },
  stats: {
    projectsPosted: { type: Number, default: 0 },
    projectsCompleted: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 }
  },
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
clientSchema.index({ email: 1 });
clientSchema.index({ walletAddress: 1 });
clientSchema.index({ githubUsername: 1 });
clientSchema.index({ createdAt: -1 });

// Virtual for full name
clientSchema.virtual('fullName').get(function() {
  if (this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.githubUsername;
});

// Pre-save middleware to hash password
clientSchema.pre('save', async function(next) {
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
clientSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to get public profile (without sensitive data)
clientSchema.methods.getPublicProfile = function() {
  const clientObject = this.toObject();
  delete clientObject.password;
  return clientObject;
};

// Static method to find by email or wallet
clientSchema.statics.findByEmailOrWallet = function(email, walletAddress) {
  return this.findOne({
    $or: [
      { email: email.toLowerCase() },
      { walletAddress: walletAddress }
    ]
  });
};

// Update last login
clientSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

module.exports = mongoose.model('Client', clientSchema); 