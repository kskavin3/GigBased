const express = require('express');
const router = express.Router();
const {
  getProjectListings,
  getProjectListing,
  createProjectListing,
  updateProjectListing,
  deleteProjectListing,
  publishProjectListing,
  addApplication
} = require('../controllers/projectListingController');

// GET /api/project-listings - Get all project listings (with optional client filter)
router.get('/', getProjectListings);

// GET /api/project-listings/:id - Get a specific project listing
router.get('/:id', getProjectListing);

// POST /api/project-listings - Create a new project listing
router.post('/', createProjectListing);

// PUT /api/project-listings/:id - Update a project listing
router.put('/:id', updateProjectListing);

// DELETE /api/project-listings/:id - Delete a project listing
router.delete('/:id', deleteProjectListing);

// PUT /api/project-listings/:id/publish - Publish a project listing
router.put('/:id/publish', publishProjectListing);

// POST /api/project-listings/:id/apply - Add an application to a project listing
router.post('/:id/apply', addApplication);

module.exports = router; 