const jwt = require('jsonwebtoken');
const Client = require('../models/Client');
const Developer = require('../models/Developer');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header or cookie
    let token = req.header('Authorization')?.replace('Bearer ', '');
    
    // If no token in header, check cookies
    if (!token) {
      token = req.cookies?.authToken;
    }

    // If still no token, check session
    if (!token && req.session?.isAuthenticated && req.session?.clientId) {
      // For session-based auth, we can generate a temporary token or validate session directly
      const client = await Client.findById(req.session.clientId).select('-password');
      if (client && client.isActive) {
        req.client = client;
        req.clientId = client._id;
        return next();
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-key');
    
    // Check if it's a client or developer token
    if (decoded.clientId) {
      // Find client by ID from token
      const client = await Client.findById(decoded.clientId).select('-password');
      
      if (!client) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid - client not found'
        });
      }

      // Check if client is active
      if (!client.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Add client to request object
      req.user = { clientId: client._id, userType: 'client' };
      req.client = client;
      req.clientId = client._id;
      
    } else if (decoded.developerId) {
      // Find developer by ID from token
      const developer = await Developer.findById(decoded.developerId).select('-password');
      
      if (!developer) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid - developer not found'
        });
      }

      // Check if developer is active
      if (!developer.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Add developer to request object
      req.user = { developerId: developer._id, userType: 'developer' };
      req.developer = developer;
      req.developerId = developer._id;
      
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

module.exports = authMiddleware; 