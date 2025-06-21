const Client = require('../models/Client');
const ProjectListing = require('../models/ProjectListing');
const Project = require('../models/Project');

// @desc    Get dashboard statistics for a client
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const clientId = req.clientId;
    
    // Get client data for wallet address
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Calculate date ranges for time-based comparisons
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfLastWeek = new Date(startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Reset to current date
    const currentDate = new Date();

    // Get project listings statistics
    const [
      totalListings,
      activeListings,
      draftListings,
      closedListings,
      listingsThisMonth,
      listingsLastMonth
    ] = await Promise.all([
      ProjectListing.countDocuments({ clientWallet: client.walletAddress }),
      ProjectListing.countDocuments({ clientWallet: client.walletAddress, status: 'active' }),
      ProjectListing.countDocuments({ clientWallet: client.walletAddress, status: 'draft' }),
      ProjectListing.countDocuments({ clientWallet: client.walletAddress, status: 'closed' }),
      ProjectListing.countDocuments({ 
        clientWallet: client.walletAddress, 
        createdAt: { $gte: startOfMonth } 
      }),
      ProjectListing.countDocuments({ 
        clientWallet: client.walletAddress, 
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } 
      })
    ]);

    // Get applications statistics
    const projectListings = await ProjectListing.find({ clientWallet: client.walletAddress });
    const totalApplications = projectListings.reduce((total, listing) => total + listing.applicants.length, 0);
    
    // Get applications this week
    const applicationsThisWeek = projectListings.reduce((total, listing) => {
      const weekApplications = listing.applicants.filter(app => 
        new Date(app.appliedAt) >= startOfWeek
      );
      return total + weekApplications.length;
    }, 0);

    // Get applications last week
    const applicationsLastWeek = projectListings.reduce((total, listing) => {
      const lastWeekApplications = listing.applicants.filter(app => {
        const appliedDate = new Date(app.appliedAt);
        return appliedDate >= startOfLastWeek && appliedDate < startOfWeek;
      });
      return total + lastWeekApplications.length;
    }, 0);

    // Get projects statistics (actual projects, not listings)
    const [
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects
    ] = await Promise.all([
      Project.countDocuments({ clientWallet: client.walletAddress }),
      Project.countDocuments({ clientWallet: client.walletAddress, status: 'in_progress' }),
      Project.countDocuments({ clientWallet: client.walletAddress, status: 'completed' }),
      Project.countDocuments({ clientWallet: client.walletAddress, status: 'on_hold' })
    ]);

    // Calculate total spent (sum of budgets from completed and active projects)
    const projectsWithBudgets = await Project.find({ 
      clientWallet: client.walletAddress,
      status: { $in: ['completed', 'in_progress'] }
    }).select('budget currency');

    const totalSpentETH = projectsWithBudgets.reduce((total, project) => {
      if (project.currency === 'ETH') {
        return total + project.budget;
      }
      return total;
    }, 0);

    // Calculate success rate
    const successRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

    // Calculate month-over-month changes
    const listingsChange = listingsLastMonth > 0 
      ? Math.round(((listingsThisMonth - listingsLastMonth) / listingsLastMonth) * 100)
      : listingsThisMonth > 0 ? 100 : 0;

    const applicationsChange = applicationsLastWeek > 0
      ? Math.round(((applicationsThisWeek - applicationsLastWeek) / applicationsLastWeek) * 100)
      : applicationsThisWeek > 0 ? 100 : 0;

    // Get recent activity
    const recentListings = await ProjectListing.find({ 
      clientWallet: client.walletAddress 
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title status createdAt applicants budget');

    const recentProjects = await Project.find({ 
      clientWallet: client.walletAddress 
    })
    .sort({ createdAt: -1 })
    .limit(3)
    .select('title status progress budget createdAt');

    // Format the response
    const stats = {
      overview: {
        activeListings: {
          value: activeListings,
          change: listingsChange,
          changeText: listingsChange > 0 ? `+${listingsChange}% this month` : 
                     listingsChange < 0 ? `${listingsChange}% this month` : 'No change this month'
        },
        totalApplications: {
          value: totalApplications,
          change: applicationsChange,
          changeText: applicationsChange > 0 ? `+${applicationsThisWeek} this week` : 
                     applicationsChange < 0 ? `${applicationsThisWeek} this week` : 'No new applications'
        },
        completedProjects: {
          value: completedProjects,
          change: successRate,
          changeText: `${successRate}% success rate`
        },
        totalSpent: {
          value: totalSpentETH,
          valueFormatted: `${totalSpentETH.toFixed(2)} ETH`,
          change: 0, // Could calculate based on spending trends
          changeText: totalSpentETH > 0 ? `~$${(totalSpentETH * 2800).toFixed(0)} USD` : '$0 USD'
        }
      },
      breakdown: {
        listings: {
          total: totalListings,
          active: activeListings,
          draft: draftListings,
          closed: closedListings
        },
        projects: {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects,
          onHold: onHoldProjects
        },
        applications: {
          total: totalApplications,
          thisWeek: applicationsThisWeek,
          lastWeek: applicationsLastWeek
        }
      },
      recentActivity: {
        listings: recentListings,
        projects: recentProjects
      }
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving dashboard statistics'
    });
  }
};

// @desc    Get dashboard analytics over time
// @route   GET /api/dashboard/analytics
// @access  Private
const getDashboardAnalytics = async (req, res) => {
  try {
    const clientId = req.clientId;
    const { period = '30d' } = req.query; // 7d, 30d, 90d, 1y
    
    // Get client data
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate;
    let groupBy;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        break;
      default: // 30d
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    }

    // Get project listings over time
    const listingsOverTime = await ProjectListing.aggregate([
      {
        $match: {
          clientWallet: client.walletAddress,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get applications over time
    const applicationsOverTime = await ProjectListing.aggregate([
      {
        $match: {
          clientWallet: client.walletAddress,
          createdAt: { $gte: startDate }
        }
      },
      { $unwind: "$applicants" },
      {
        $match: {
          "applicants.appliedAt": { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$applicants.appliedAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        period,
        listingsOverTime,
        applicationsOverTime
      }
    });

  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving dashboard analytics'
    });
  }
};

module.exports = {
  getDashboardStats,
  getDashboardAnalytics
}; 