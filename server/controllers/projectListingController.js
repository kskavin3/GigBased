const ProjectListing = require('../models/ProjectListing');

// Get all project listings for a client
const getProjectListings = async (req, res) => {
  try {
    const { clientWallet } = req.query;
    
    const query = clientWallet ? { clientWallet } : {};
    const listings = await ProjectListing.find(query)
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: listings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching project listings',
      error: error.message
    });
  }
};

// Get a single project listing by ID
const getProjectListing = async (req, res) => {
  try {
    const listing = await ProjectListing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Project listing not found'
      });
    }
    
    res.json({
      success: true,
      data: listing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching project listing',
      error: error.message
    });
  }
};

// Create a new project listing
const createProjectListing = async (req, res) => {
  try {
    const {
      title,
      description,
      budget,
      duration,
      skillsRequired,
      location,
      urgency,
      clientId,
      clientWallet
    } = req.body;

    // Validate required fields
    if (!title || !description || !budget || !duration || !skillsRequired || !clientId || !clientWallet) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const listing = new ProjectListing({
      title,
      description,
      budget,
      currency: 'ETH',
      duration,
      skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : skillsRequired.split(',').map(s => s.trim()),
      location: location || 'Remote',
      urgency: urgency || 'medium',
      clientId,
      clientWallet,
      status: 'draft'
    });

    const savedListing = await listing.save();
    
    res.status(201).json({
      success: true,
      message: 'Project listing created successfully',
      data: savedListing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating project listing',
      error: error.message
    });
  }
};

// Update a project listing
const updateProjectListing = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating certain fields
    delete updates._id;
    delete updates.createdAt;
    delete updates.applicants;

    const listing = await ProjectListing.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Project listing not found'
      });
    }

    res.json({
      success: true,
      message: 'Project listing updated successfully',
      data: listing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating project listing',
      error: error.message
    });
  }
};

// Delete a project listing
const deleteProjectListing = async (req, res) => {
  try {
    const { id } = req.params;
    
    const listing = await ProjectListing.findByIdAndDelete(id);
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Project listing not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Project listing deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting project listing',
      error: error.message
    });
  }
};

// Publish a project listing (change status from draft to active)
const publishProjectListing = async (req, res) => {
  try {
    const { id } = req.params;
    
    const listing = await ProjectListing.findByIdAndUpdate(
      id,
      { status: 'active', updatedAt: Date.now() },
      { new: true }
    );
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Project listing not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Project listing published successfully',
      data: listing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error publishing project listing',
      error: error.message
    });
  }
};

// Add an application to a project listing
const addApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      developerId,
      developerWallet,
      githubUsername,
      proposal,
      proposedBudget
    } = req.body;

    const listing = await ProjectListing.findById(id);
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Project listing not found'
      });
    }

    // Check if developer already applied
    const existingApplication = listing.applicants.find(
      app => app.developerId === developerId
    );

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'Developer has already applied to this project'
      });
    }

    listing.applicants.push({
      developerId,
      developerWallet,
      githubUsername,
      proposal,
      proposedBudget
    });

    await listing.save();
    
    res.json({
      success: true,
      message: 'Application submitted successfully',
      data: listing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting application',
      error: error.message
    });
  }
};

module.exports = {
  getProjectListings,
  getProjectListing,
  createProjectListing,
  updateProjectListing,
  deleteProjectListing,
  publishProjectListing,
  addApplication
}; 