const Project = require('../models/Project');
const ProjectListing = require('../models/ProjectListing');

// Get all projects for a client
const getProjects = async (req, res) => {
  try {
    const { clientWallet } = req.query;
    
    const query = clientWallet ? { clientWallet } : {};
    const projects = await Project.find(query)
      .populate('originalListingId')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message
    });
  }
};

// Get a single project by ID
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('originalListingId');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching project',
      error: error.message
    });
  }
};

// Create a new project (from a project listing)
const createProject = async (req, res) => {
  try {
    const {
      listingId,
      developerId,
      developerName,
      developerAvatar,
      githubUsername,
      walletAddress,
      startDate,
      endDate,
      milestones,
      contractAddress,
      transactionHash
    } = req.body;

    // Get the original listing
    const listing = await ProjectListing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Original project listing not found'
      });
    }

    // Create the project
    const project = new Project({
      title: listing.title,
      description: listing.description,
      budget: listing.budget,
      currency: listing.currency,
      clientId: listing.clientId,
      clientWallet: listing.clientWallet,
      assignedDeveloper: {
        developerId,
        name: developerName,
        avatar: developerAvatar,
        githubUsername,
        walletAddress
      },
      timeline: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        milestones: milestones || []
      },
      originalListingId: listingId,
      contractAddress,
      transactionHash,
      status: 'in_progress'
    });

    const savedProject = await project.save();

    // Update the original listing status to closed
    await ProjectListing.findByIdAndUpdate(listingId, { 
      status: 'closed',
      updatedAt: Date.now()
    });
    
    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: savedProject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating project',
      error: error.message
    });
  }
};

// Update a project
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating certain fields
    delete updates._id;
    delete updates.createdAt;
    delete updates.clientId;
    delete updates.clientWallet;
    delete updates.originalListingId;

    const project = await Project.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating project',
      error: error.message
    });
  }
};

// Update milestone status
const updateMilestone = async (req, res) => {
  try {
    const { id, milestoneId } = req.params;
    const { status } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const milestone = project.timeline.milestones.id(milestoneId);
    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
    }

    milestone.status = status;
    if (status === 'completed') {
      milestone.completedAt = new Date();
    }

    await project.save(); // This will trigger the progress update

    res.json({
      success: true,
      message: 'Milestone updated successfully',
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating milestone',
      error: error.message
    });
  }
};

// Add a payment record
const addPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, transactionHash, milestone } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    project.paymentHistory.push({
      amount,
      transactionHash,
      milestone
    });

    await project.save();

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error recording payment',
      error: error.message
    });
  }
};

// Get project statistics
const getProjectStats = async (req, res) => {
  try {
    const { clientWallet } = req.query;
    
    const query = clientWallet ? { clientWallet } : {};
    
    const stats = await Project.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          activeProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          completedProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalSpent: { $sum: '$budget' },
          averageProgress: { $avg: '$progress' }
        }
      }
    ]);

    const result = stats.length > 0 ? stats[0] : {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      totalSpent: 0,
      averageProgress: 0
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching project statistics',
      error: error.message
    });
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  updateMilestone,
  addPayment,
  getProjectStats
}; 