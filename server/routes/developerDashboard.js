const express = require('express');
const router = express.Router();
const {
  getDeveloperDashboardStats,
  getAvailableProjectListings,
  getDeveloperApplications,
  getDeveloperProjects
} = require('../controllers/developerDashboardController');

// Middleware to protect routes
const authMiddleware = require('../middleware/auth');

// @route   GET /api/dev/dashboard/stats
// @desc    Get developer dashboard statistics
// @access  Private
router.get('/stats', authMiddleware, getDeveloperDashboardStats);

// @route   GET /api/dev/dashboard/listings
// @desc    Get available project listings for developer
// @access  Private
router.get('/listings', authMiddleware, getAvailableProjectListings);

// @route   GET /api/dev/dashboard/applications
// @desc    Get developer's applications
// @access  Private
router.get('/applications', authMiddleware, getDeveloperApplications);

// @route   GET /api/dev/dashboard/projects
// @desc    Get developer's active projects
// @access  Private
router.get('/projects', authMiddleware, getDeveloperProjects);

module.exports = router; 