const express = require('express');
const router = express.Router();
const {
  registerClient,
  loginClient,
  logoutClient,
  getClientProfile,
  updateClientProfile,
  getAllClients,
  deleteClientAccount
} = require('../controllers/clientController');

// Middleware to protect routes
const authMiddleware = require('../middleware/auth');

// @route   POST /api/clients/register
// @desc    Register new client
// @access  Public
router.post('/register', registerClient);

// @route   POST /api/clients/login
// @desc    Login client
// @access  Public
router.post('/login', loginClient);

// @route   POST /api/clients/logout
// @desc    Logout client
// @access  Private
router.post('/logout', authMiddleware, logoutClient);

// @route   GET /api/clients/profile
// @desc    Get client profile
// @access  Private
router.get('/profile', authMiddleware, getClientProfile);

// @route   PUT /api/clients/profile
// @desc    Update client profile
// @access  Private
router.put('/profile', authMiddleware, updateClientProfile);

// @route   GET /api/clients
// @desc    Get all clients (admin only)
// @access  Private/Admin
router.get('/', authMiddleware, getAllClients);

// @route   DELETE /api/clients/account
// @desc    Delete client account
// @access  Private
router.delete('/account', authMiddleware, deleteClientAccount);

module.exports = router; 