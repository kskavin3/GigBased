const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  updateMilestone,
  addPayment,
  getProjectStats
} = require('../controllers/projectController');

// GET /api/projects - Get all projects (with optional client filter)
router.get('/', getProjects);

// GET /api/projects/stats - Get project statistics
router.get('/stats', getProjectStats);

// GET /api/projects/:id - Get a specific project
router.get('/:id', getProject);

// POST /api/projects - Create a new project
router.post('/', createProject);

// PUT /api/projects/:id - Update a project
router.put('/:id', updateProject);

// PUT /api/projects/:id/milestones/:milestoneId - Update milestone status
router.put('/:id/milestones/:milestoneId', updateMilestone);

// POST /api/projects/:id/payments - Add a payment record
router.post('/:id/payments', addPayment);

module.exports = router; 