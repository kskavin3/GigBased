import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { projectListingsAPI } from '../services/api'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { 
  Plus, 
  Briefcase, 
  Users, 
  Eye, 
  Edit3, 
  Trash2, 
  Calendar, 
  DollarSign, 
  Clock, 
  MoreHorizontal,
  TrendingUp,
  Award
} from 'lucide-react'

interface ProjectListing {
  _id: string
  title: string
  description: string
  budget: number
  currency: string
  duration: string
  skillsRequired: string[]
  projectType: string
  applicants: Array<{
    developerId: string
    developerWallet: string
    githubUsername: string
    appliedAt: string
    proposal: string
    proposedBudget?: number
  }>
  status: 'active' | 'closed' | 'draft'
  postedDate: string
  createdAt: string
  location: string
  urgency: 'low' | 'medium' | 'high'
  timeline: {
    startDate: string
    endDate: string
    milestones: Array<{
      title: string
      description: string
      dueDate: string
      timeInWeeks: number
      budgetPercentage: number
      approvalTime: number
      stageType: 'Documentation' | 'Code Submission' | 'Approval'
    }>
  }
  clientId: string
  clientWallet: string
}

interface Project {
  id: string
  title: string
  description: string
  budget: number
  currency: string
  assignedDeveloper: {
    name: string
    avatar: string
    githubUsername: string
  }
  timeline: {
    startDate: string
    endDate: string
    milestones: Array<{
      title: string
      dueDate: string
      status: 'pending' | 'in_progress' | 'completed'
    }>
  }
  status: 'in_progress' | 'completed' | 'on_hold'
  progress: number
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'overview' | 'my-listings' | 'my-projects'>('overview')

  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [projectListings, setProjectListings] = useState<ProjectListing[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  // Dashboard statistics
  const { stats, isLoading: statsLoading, error: statsError, lastUpdated, refreshStats } = useDashboardStats()

  // Fetch project listings from API
  useEffect(() => {
    const fetchProjectListings = async () => {
      try {
        setIsLoading(true)
        const walletAddress = localStorage.getItem('walletAddress') || 'demo-wallet-address'
        const response = await projectListingsAPI.getAll(walletAddress)
        setProjectListings(response.data || [])
      } catch (error) {
        console.error('Error fetching project listings:', error)
        // Keep empty array if error
        setProjectListings([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjectListings()
  }, [])

  // Mock data for actual projects (with assigned developers)
  const myProjects: Project[] = [
    {
      id: 'p1',
      title: 'Smart Contract Development for DeFi Platform',
      description: 'Developing and auditing smart contracts for a new DeFi lending platform on Base Chain.',
      budget: 4.2,
      currency: 'ETH',
      assignedDeveloper: {
        name: 'Alice Johnson',
        avatar: 'AJ',
        githubUsername: 'alice-blockchain'
      },
      timeline: {
        startDate: '2024-01-15',
        endDate: '2024-03-15',
        milestones: [
          {
            title: 'Smart Contract Architecture',
            dueDate: '2024-02-01',
            status: 'completed'
          },
          {
            title: 'Contract Development',
            dueDate: '2024-02-20',
            status: 'in_progress'
          },
          {
            title: 'Security Audit',
            dueDate: '2024-03-10',
            status: 'pending'
          }
        ]
      },
      status: 'in_progress',
      progress: 65
    },
    {
      id: 'p2',
      title: 'Mobile App UI/UX Redesign',
      description: 'Complete redesign of mobile application user interface and user experience.',
      budget: 2.1,
      currency: 'ETH',
      assignedDeveloper: {
        name: 'Bob Designer',
        avatar: 'BD',
        githubUsername: 'bob-designs'
      },
      timeline: {
        startDate: '2024-01-01',
        endDate: '2024-02-15',
        milestones: [
          {
            title: 'User Research',
            dueDate: '2024-01-10',
            status: 'completed'
          },
          {
            title: 'Design System',
            dueDate: '2024-01-25',
            status: 'completed'
          },
          {
            title: 'Final Implementation',
            dueDate: '2024-02-15',
            status: 'completed'
          }
        ]
      },
      status: 'completed',
      progress: 100
    }
  ]

  const getListingStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'on_hold': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

    const ProjectListingCard: React.FC<{ listing: ProjectListing, showActions?: boolean }> = ({ listing, showActions = false }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getListingStatusColor(listing.status)}`}>
              {listing.status}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(listing.urgency)}`}>
              {listing.urgency} priority
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{listing.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span className="font-medium">{listing.budget} {listing.currency}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{listing.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{listing.applicants.length} applicants</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Posted {new Date(listing.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Timeline Information */}
          {listing.timeline && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900">Project Timeline</h4>
                <span className="text-xs text-gray-500">
                  {listing.timeline.milestones.length} milestones
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 mb-2">
                <div>
                  <span className="font-medium">Start:</span> {new Date(listing.timeline.startDate).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">End:</span> {new Date(listing.timeline.endDate).toLocaleDateString()}
                </div>
              </div>
              <div className="space-y-1">
                {listing.timeline.milestones.slice(0, 2).map((milestone, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="text-gray-700">{milestone.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">{milestone.budgetPercentage}%</span>
                      <span className={`px-1 py-0.5 rounded text-xs ${
                        milestone.stageType === 'Documentation' ? 'bg-blue-100 text-blue-800' :
                        milestone.stageType === 'Code Submission' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {milestone.stageType}
                      </span>
                    </div>
                  </div>
                ))}
                {listing.timeline.milestones.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{listing.timeline.milestones.length - 2} more milestones
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {listing.skillsRequired.slice(0, 4).map((skill, index) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {skill}
              </span>
            ))}
            {listing.skillsRequired.length > 4 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{listing.skillsRequired.length - 4} more
              </span>
            )}
          </div>
        </div>

        {showActions && (
          <div className="flex items-center gap-2 ml-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <Eye className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <Edit3 className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )

  const ProjectCard: React.FC<{ project: Project, showActions?: boolean }> = ({ project, showActions = false }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProjectStatusColor(project.status)}`}>
              {project.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span className="font-medium">{project.budget} {project.currency}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{project.timeline.startDate} - {project.timeline.endDate}</span>
            </div>
          </div>

          {/* Developer Info */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {project.assignedDeveloper.avatar}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{project.assignedDeveloper.name}</p>
              <p className="text-xs text-gray-500">@{project.assignedDeveloper.githubUsername}</p>
          </div>
        </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-600">{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Milestones */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Recent Milestones</p>
            <div className="space-y-2">
              {project.timeline.milestones.slice(0, 2).map((milestone, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    milestone.status === 'completed' ? 'bg-green-500' :
                    milestone.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'
                  }`}></div>
                  <span className="text-gray-600">{milestone.title}</span>
                  <span className="text-gray-400">({milestone.dueDate})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex items-center gap-2 ml-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <Eye className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )

  const StatsCard: React.FC<{ title: string, value: string, icon: React.ReactNode, change?: string }> = ({ title, value, icon, change }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1">{change}</p>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-gray-600">Manage your projects and find talented developers</p>
              {lastUpdated && (
                <div className="flex items-center text-sm text-gray-500">
                  <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                  <button
                    onClick={refreshStats}
                    className="ml-2 text-blue-600 hover:text-blue-700"
                    title="Refresh statistics"
                  >
                    🔄
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/create-project-listing')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Project Listing
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'my-listings', label: 'My Project Listings', icon: Briefcase },
              { id: 'my-projects', label: 'My Projects', icon: Eye }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {label}
              </button>
            ))}
          </nav>
      </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsLoading ? (
                // Loading state for stats
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : statsError ? (
                // Error state
                <div className="col-span-full bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-800 font-medium">Failed to load statistics</p>
                      <p className="text-red-600 text-sm mt-1">{statsError}</p>
                    </div>
                    <button
                      onClick={refreshStats}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : (
                // Live stats
                <>
                  <StatsCard
                    title="Active Listings"
                    value={stats?.overview.activeListings.value.toString() || '0'}
                    icon={<Briefcase className="h-6 w-6 text-blue-600" />}
                    change={stats?.overview.activeListings.changeText}
                  />
                  <StatsCard
                    title="Total Applications"
                    value={stats?.overview.totalApplications.value.toString() || '0'}
                    icon={<Users className="h-6 w-6 text-blue-600" />}
                    change={stats?.overview.totalApplications.changeText}
                  />
                  <StatsCard
                    title="Completed Projects"
                    value={stats?.overview.completedProjects.value.toString() || '0'}
                    icon={<Award className="h-6 w-6 text-blue-600" />}
                    change={stats?.overview.completedProjects.changeText}
                  />
                  <StatsCard
                    title="Total Spent"
                    value={stats?.overview.totalSpent.valueFormatted || '0 ETH'}
                    icon={<DollarSign className="h-6 w-6 text-blue-600" />}
                    change={stats?.overview.totalSpent.changeText}
                  />
                </>
              )}
            </div>

            {/* Recent Project Listings */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Project Listings</h2>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading project listings...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {projectListings.slice(0, 2).map(listing => (
                    <ProjectListingCard key={listing._id} listing={listing} showActions={true} />
                  ))}
                  {projectListings.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No project listings found. Create your first project!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'my-listings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">My Project Listings</h2>
              <div className="flex items-center space-x-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading project listings...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projectListings
                  .filter(listing => filterStatus === 'all' || listing.status === filterStatus)
                  .map(listing => (
                    <ProjectListingCard key={listing._id} listing={listing} showActions={true} />
                  ))}
                {projectListings.filter(listing => filterStatus === 'all' || listing.status === filterStatus).length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No project listings match the selected filter.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'my-projects' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">My Active Projects</h2>
              <div className="flex items-center space-x-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
            </div>
          </div>
          
            <div className="space-y-4">
              {myProjects
                .filter(project => filterStatus === 'all' || project.status === filterStatus)
                .map(project => (
                  <ProjectCard key={project.id} project={project} showActions={true} />
                ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Dashboard 