const Developer = require('../models/Developer');
const ProjectListing = require('../models/ProjectListing');
const Project = require('../models/Project');

// @desc    Get developer dashboard statistics
// @route   GET /api/dev/dashboard/stats
// @access  Private
const getDeveloperDashboardStats = async (req, res) => {
  try {
    const developerId = req.user.developerId;
    
    if (!developerId) {
      return res.status(401).json({
        success: false,
        message: 'Developer authentication required'
      });
    }

    const developer = await Developer.findById(developerId);
    if (!developer) {
      return res.status(404).json({
        success: false,
        message: 'Developer not found'
      });
    }

    // Get available project listings (not applied to yet)
    const appliedListingIds = developer.applications.map(app => app.projectListingId);
    const availableProjects = await ProjectListing.countDocuments({
      status: 'active',
      _id: { $nin: appliedListingIds }
    });

    // Get applications statistics
    const totalApplications = developer.applications.length;
    const pendingApplications = developer.applications.filter(app => app.status === 'pending').length;
    const acceptedApplications = developer.applications.filter(app => app.status === 'accepted').length;
    const rejectedApplications = developer.applications.filter(app => app.status === 'rejected').length;

    // Get active projects (where developer is assigned)
    const activeProjects = await Project.countDocuments({
      'assignedDeveloper.developerId': developerId,
      status: { $in: ['in_progress', 'on_hold'] }
    });

    // Get completed projects
    const completedProjects = await Project.countDocuments({
      'assignedDeveloper.developerId': developerId,
      status: 'completed'
    });

    // Calculate success rate
    const successRate = totalApplications > 0 ? Math.round((acceptedApplications / totalApplications) * 100) : 0;

    // Get recent project listings for recommendations
    const recentListings = await ProjectListing.find({
      status: 'active',
      _id: { $nin: appliedListingIds }
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title description budget currency skillsRequired projectType urgency createdAt');

    // Get recent applications
    const recentApplications = await Developer.findById(developerId)
      .populate({
        path: 'applications.projectListingId',
        select: 'title description budget currency status'
      })
      .select('applications');

    const applications = recentApplications.applications
      .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
      .slice(0, 5);

    // Calculate earnings (mock data for now - would come from actual projects/payments)
    const totalEarnings = developer.stats.totalEarned || 0;
    const thisMonthEarnings = 0; // Would calculate from actual payment records

    const stats = {
      overview: {
        availableProjects,
        totalApplications,
        activeProjects,
        completedProjects,
        successRate,
        totalEarnings,
        thisMonthEarnings
      },
      applications: {
        total: totalApplications,
        pending: pendingApplications,
        accepted: acceptedApplications,
        rejected: rejectedApplications
      },
      projects: {
        active: activeProjects,
        completed: completedProjects,
        totalEarned: totalEarnings
      },
      recentActivity: {
        listings: recentListings,
        applications: applications
      }
    };

    res.json({
      success: true,
      data: stats,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Developer dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get project listings for developer (available to apply)
// @route   GET /api/dev/dashboard/listings
// @access  Private
const getAvailableProjectListings = async (req, res) => {
  try {
    const developerId = req.user.developerId;
    const { page = 1, limit = 10, skills, projectType, budget, urgency } = req.query;

    const developer = await Developer.findById(developerId);
    if (!developer) {
      return res.status(404).json({
        success: false,
        message: 'Developer not found'
      });
    }

    // Get applied listing IDs to exclude
    const appliedListingIds = developer.applications.map(app => app.projectListingId);

    // Build filter query
    const filter = {
      status: 'active',
      _id: { $nin: appliedListingIds }
    };

    if (skills) {
      const skillsArray = skills.split(',');
      filter.skillsRequired = { $in: skillsArray };
    }

    if (projectType) {
      filter.projectType = projectType;
    }

    if (budget) {
      const [min, max] = budget.split('-').map(Number);
      filter.budget = { $gte: min };
      if (max) filter.budget.$lte = max;
    }

    if (urgency) {
      filter.urgency = urgency;
    }

    const listings = await ProjectListing.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('clientId', 'githubUsername profile.company profile.location stats.averageRating');

    const total = await ProjectListing.countDocuments(filter);

    res.json({
      success: true,
      data: listings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Get available project listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving project listings'
    });
  }
};

// @desc    Get developer's applications
// @route   GET /api/dev/dashboard/applications
// @access  Private
const getDeveloperApplications = async (req, res) => {
  try {
    const developerId = req.user.developerId;
    const { page = 1, limit = 10, status } = req.query;

    const developer = await Developer.findById(developerId)
      .populate({
        path: 'applications.projectListingId',
        select: 'title description budget currency status clientId createdAt',
        populate: {
          path: 'clientId',
          select: 'githubUsername profile.company'
        }
      });

    if (!developer) {
      return res.status(404).json({
        success: false,
        message: 'Developer not found'
      });
    }

    let applications = developer.applications;

    // Filter by status if provided
    if (status) {
      applications = applications.filter(app => app.status === status);
    }

    // Sort by most recent
    applications = applications.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedApplications = applications.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedApplications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(applications.length / limit),
        totalItems: applications.length,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Get developer applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving applications'
    });
  }
};

// @desc    Get developer's active projects
// @route   GET /api/dev/dashboard/projects
// @access  Private
const getDeveloperProjects = async (req, res) => {
  try {
    const developerId = req.user.developerId;
    const { page = 1, limit = 10, status } = req.query;

    // Build filter query
    const filter = {
      'assignedDeveloper.developerId': developerId
    };

    if (status) {
      filter.status = status;
    }

    const projects = await Project.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('clientId', 'githubUsername profile.company profile.location');

    const total = await Project.countDocuments(filter);

    res.json({
      success: true,
      data: projects,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Get developer projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving projects'
    });
  }
};

module.exports = {
  getDeveloperDashboardStats,
  getAvailableProjectListings,
  getDeveloperApplications,
  getDeveloperProjects
}; 