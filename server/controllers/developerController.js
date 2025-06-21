const Developer = require('../models/Developer');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (developerId) => {
  return jwt.sign(
    { developerId, userType: 'developer' },
    process.env.JWT_SECRET || 'your-jwt-secret-key',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @desc    Register new developer
// @route   POST /api/developers/register
// @access  Public
const registerDeveloper = async (req, res) => {
  try {
    const { email, password, githubUsername, walletAddress, authMethod = 'email' } = req.body;

    // Validation
    if (!email || !password || !githubUsername || !walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: email, password, githubUsername, walletAddress'
      });
    }

    // Check if developer already exists
    const existingDeveloper = await Developer.findByEmailOrWallet(email, walletAddress);
    if (existingDeveloper) {
      return res.status(400).json({
        success: false,
        message: 'Developer with this email or wallet address already exists'
      });
    }

    // Check if GitHub username is already taken
    const existingGithub = await Developer.findOne({ githubUsername });
    if (existingGithub) {
      return res.status(400).json({
        success: false,
        message: 'GitHub username is already taken'
      });
    }

    // Create new developer
    const developer = new Developer({
      email,
      password,
      githubUsername,
      walletAddress,
      authMethod,
      isWalletVerified: authMethod === 'wallet'
    });

    await developer.save();

    // Generate token
    const token = generateToken(developer._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Update last login
    await developer.updateLastLogin();

    res.status(201).json({
      success: true,
      message: 'Developer registered successfully',
      data: {
        developer: developer.getPublicProfile(),
        token
      }
    });

  } catch (error) {
    console.error('Developer registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Login developer
// @route   POST /api/developers/login
// @access  Public
const loginDeveloper = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find developer by email
    const developer = await Developer.findOne({ email: email.toLowerCase() });
    if (!developer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await developer.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!developer.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Generate token
    const token = generateToken(developer._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Update last login
    await developer.updateLastLogin();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        developer: developer.getPublicProfile(),
        token
      }
    });

  } catch (error) {
    console.error('Developer login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Logout developer
// @route   POST /api/developers/logout
// @access  Private
const logoutDeveloper = async (req, res) => {
  try {
    // Clear cookie
    res.clearCookie('token');
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Developer logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

// @desc    Get developer profile
// @route   GET /api/developers/profile
// @access  Private
const getDeveloperProfile = async (req, res) => {
  try {
    const developer = await Developer.findById(req.user.developerId)
      .populate('applications.projectListingId', 'title description budget currency status');
    
    if (!developer) {
      return res.status(404).json({
        success: false,
        message: 'Developer not found'
      });
    }

    res.json({
      success: true,
      data: developer.getPublicProfile()
    });
  } catch (error) {
    console.error('Get developer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving profile'
    });
  }
};

// @desc    Update developer profile
// @route   PUT /api/developers/profile
// @access  Private
const updateDeveloperProfile = async (req, res) => {
  try {
    const developerId = req.user.developerId;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.email;
    delete updateData.walletAddress;
    delete updateData.userType;
    delete updateData.stats;

    const developer = await Developer.findByIdAndUpdate(
      developerId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!developer) {
      return res.status(404).json({
        success: false,
        message: 'Developer not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: developer.getPublicProfile()
    });

  } catch (error) {
    console.error('Update developer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all developers (for admin/client matching)
// @route   GET /api/developers
// @access  Private
const getAllDevelopers = async (req, res) => {
  try {
    const { page = 1, limit = 10, skills, location, availability } = req.query;
    
    // Build filter query
    const filter = { isActive: true };
    
    if (skills) {
      const skillsArray = skills.split(',');
      filter.$or = [
        { 'skills.languages': { $in: skillsArray } },
        { 'skills.frameworks': { $in: skillsArray } },
        { 'skills.tools': { $in: skillsArray } },
        { 'skills.specializations': { $in: skillsArray } }
      ];
    }
    
    if (location) {
      filter['profile.location'] = new RegExp(location, 'i');
    }
    
    if (availability) {
      filter['profile.availability'] = availability;
    }

    const developers = await Developer.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Developer.countDocuments(filter);

    res.json({
      success: true,
      data: developers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Get all developers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving developers'
    });
  }
};

// @desc    Delete developer account
// @route   DELETE /api/developers/account
// @access  Private
const deleteDeveloperAccount = async (req, res) => {
  try {
    const developerId = req.user.developerId;
    
    const developer = await Developer.findById(developerId);
    if (!developer) {
      return res.status(404).json({
        success: false,
        message: 'Developer not found'
      });
    }

    // Instead of hard delete, deactivate the account
    developer.isActive = false;
    await developer.save();

    // Clear cookie
    res.clearCookie('token');

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('Delete developer account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting account'
    });
  }
};

// @desc    Apply to a project listing
// @route   POST /api/developers/apply/:listingId
// @access  Private
const applyToProject = async (req, res) => {
  try {
    const { listingId } = req.params;
    const { proposal, proposedBudget } = req.body;
    const developerId = req.user.developerId;

    if (!proposal) {
      return res.status(400).json({
        success: false,
        message: 'Proposal is required'
      });
    }

    const developer = await Developer.findById(developerId);
    if (!developer) {
      return res.status(404).json({
        success: false,
        message: 'Developer not found'
      });
    }

    // Check if already applied
    const existingApplication = developer.applications.find(
      app => app.projectListingId.toString() === listingId
    );

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this project'
      });
    }

    // Add application
    developer.applications.push({
      projectListingId: listingId,
      proposal,
      proposedBudget,
      appliedAt: new Date()
    });

    // Update stats
    developer.stats.projectsApplied += 1;

    await developer.save();

    res.json({
      success: true,
      message: 'Application submitted successfully'
    });

  } catch (error) {
    console.error('Apply to project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting application'
    });
  }
};

module.exports = {
  registerDeveloper,
  loginDeveloper,
  logoutDeveloper,
  getDeveloperProfile,
  updateDeveloperProfile,
  getAllDevelopers,
  deleteDeveloperAccount,
  applyToProject
}; 