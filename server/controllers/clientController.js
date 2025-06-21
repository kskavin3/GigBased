const Client = require('../models/Client');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (clientId) => {
  return jwt.sign(
    { clientId },
    process.env.JWT_SECRET || 'your-jwt-secret-key',
    { expiresIn: '7d' }
  );
};

// @desc    Register new client
// @route   POST /api/clients/register
// @access  Public
const registerClient = async (req, res) => {
  try {
    const { email, password, githubUsername, walletAddress, authMethod } = req.body;

    // Validate required fields
    if (!email || !password || !githubUsername || !walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: email, password, githubUsername, walletAddress'
      });
    }

    // Check if client already exists
    const existingClient = await Client.findByEmailOrWallet(email, walletAddress);
    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'Client already exists with this email or wallet address'
      });
    }

    // Create new client
    const client = new Client({
      email,
      password,
      githubUsername,
      walletAddress,
      authMethod: authMethod || 'email',
      userType: 'project_host'
    });

    await client.save();

    // Generate token
    const token = generateToken(client._id);

    // Set session data
    req.session.clientId = client._id.toString();
    req.session.isAuthenticated = true;

    // Set HTTP-only cookie with token
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Return success response without password
    res.status(201).json({
      success: true,
      message: 'Client registered successfully',
      data: {
        client: client.getPublicProfile(),
        token // Still return token for frontend compatibility
      }
    });

  } catch (error) {
    console.error('Register client error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login client
// @route   POST /api/clients/login
// @access  Public
const loginClient = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find client by email
    const client = await Client.findOne({ email: email.toLowerCase() });
    if (!client) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if client is active
    if (!client.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await client.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await client.updateLastLogin();

    // Generate token
    const token = generateToken(client._id);

    // Set session data
    req.session.clientId = client._id.toString();
    req.session.isAuthenticated = true;

    // Set HTTP-only cookie with token
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        client: client.getPublicProfile(),
        token // Still return token for frontend compatibility
      }
    });

  } catch (error) {
    console.error('Login client error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get client profile
// @route   GET /api/clients/profile
// @access  Private
const getClientProfile = async (req, res) => {
  try {
    const client = await Client.findById(req.clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      data: {
        client: client.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Get client profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving profile'
    });
  }
};

// @desc    Update client profile
// @route   PUT /api/clients/profile
// @access  Private
const updateClientProfile = async (req, res) => {
  try {
    const { profile, preferences } = req.body;

    const client = await Client.findById(req.clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Update profile fields if provided
    if (profile) {
      client.profile = { ...client.profile, ...profile };
    }

    // Update preferences if provided
    if (preferences) {
      client.preferences = { ...client.preferences, ...preferences };
    }

    await client.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        client: client.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Update client profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
};

// @desc    Get all clients (admin only)
// @route   GET /api/clients
// @access  Private/Admin
const getAllClients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const clients = await Client.find({ isActive: true })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Client.countDocuments({ isActive: true });

    res.json({
      success: true,
      data: {
        clients,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all clients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving clients'
    });
  }
};

// @desc    Logout client
// @route   POST /api/clients/logout
// @access  Private
const logoutClient = async (req, res) => {
  try {
    // Clear session
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
        return res.status(500).json({
          success: false,
          message: 'Error logging out'
        });
      }

      // Clear cookie
      res.clearCookie('authToken');
      res.clearCookie('connect.sid'); // Default session cookie name

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

// @desc    Delete client account
// @route   DELETE /api/clients/account
// @access  Private
const deleteClientAccount = async (req, res) => {
  try {
    const client = await Client.findById(req.clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Soft delete - deactivate account
    client.isActive = false;
    await client.save();

    // Clear session and cookies on account deletion
    req.session.destroy(() => {
      res.clearCookie('authToken');
      res.clearCookie('connect.sid');
    });

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('Delete client account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting account'
    });
  }
};

module.exports = {
  registerClient,
  loginClient,
  logoutClient,
  getClientProfile,
  updateClientProfile,
  getAllClients,
  deleteClientAccount
}; 