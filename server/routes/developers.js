const express = require('express');
const router = express.Router();
const {
  registerDeveloper,
  loginDeveloper,
  logoutDeveloper,
  getDeveloperProfile,
  updateDeveloperProfile,
  getAllDevelopers,
  deleteDeveloperAccount,
  applyToProject
} = require('../controllers/developerController');

// Middleware to protect routes
const authMiddleware = require('../middleware/auth');

// @route   POST /api/developers/register
// @desc    Register new developer
// @access  Public
router.post('/register', registerDeveloper);

// @route   POST /api/developers/login
// @desc    Login developer
// @access  Public
router.post('/login', loginDeveloper);

// @route   POST /api/developers/logout
// @desc    Logout developer
// @access  Private
router.post('/logout', authMiddleware, logoutDeveloper);

// @route   GET /api/developers/profile
// @desc    Get developer profile
// @access  Private
router.get('/profile', authMiddleware, getDeveloperProfile);

// @route   PUT /api/developers/profile
// @desc    Update developer profile
// @access  Private
router.put('/profile', authMiddleware, updateDeveloperProfile);

// @route   GET /api/developers
// @desc    Get all developers (for matching)
// @access  Private
router.get('/', authMiddleware, getAllDevelopers);

// @route   DELETE /api/developers/account
// @desc    Delete developer account
// @access  Private
router.delete('/account', authMiddleware, deleteDeveloperAccount);

// @route   POST /api/developers/apply/:listingId
// @desc    Apply to a project listing
// @access  Private
router.post('/apply/:listingId', authMiddleware, applyToProject);

module.exports = router; 