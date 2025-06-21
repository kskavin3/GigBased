import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { developerDashboardAPI } from '../services/api'
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
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Search,
  Filter,
  Code,
  Star,
  MapPin,
  Github,
  ChevronRight,
  X
} from 'lucide-react'

interface DeveloperStats {
  overview: {
    availableProjects: number
    totalApplications: number
    activeProjects: number
    completedProjects: number
    successRate: number
    totalEarnings: number
    thisMonthEarnings: number
  }
  applications: {
    total: number
    pending: number
    accepted: number
    rejected: number
  }
  projects: {
    active: number
    completed: number
    totalEarned: number
  }
}

interface ProjectListing {
  _id: string
  title: string
  description: string
  budget: number
  currency: string
  skillsRequired: string[]
  projectType: string
  urgency: 'low' | 'medium' | 'high'
  createdAt: string
  clientId: {
    githubUsername: string
    profile?: {
      company?: string
      location?: string
    }
    stats?: {
      averageRating?: number
    }
  }
}

interface Application {
  _id: string
  projectListingId: {
    _id: string
    title: string
    description: string
    budget: number
    currency: string
    status: string
    clientId: {
      githubUsername: string
      profile?: {
        company?: string
      }
    }
  }
  appliedAt: string
  proposal: string
  proposedBudget?: number
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
}

const DeveloperDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'applications' | 'my-work'>('overview')
  
  const [stats, setStats] = useState<DeveloperStats | null>(null)
  const [availableProjects, setAvailableProjects] = useState<ProjectListing[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectListing | null>(null)
  const [applicationText, setApplicationText] = useState('')
  const [proposedBudget, setProposedBudget] = useState('')

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        const [statsResponse, projectsResponse, applicationsResponse] = await Promise.all([
          developerDashboardAPI.getStats(),
          developerDashboardAPI.getListings({ limit: 10 }),
          developerDashboardAPI.getApplications({ limit: 10 })
        ])
        
        setStats((statsResponse as any).data)
        setAvailableProjects((projectsResponse as any).data || [])
        setApplications((applicationsResponse as any).data || [])
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'withdrawn': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleApplyToProject = (project: ProjectListing) => {
    setSelectedProject(project)
    setShowApplicationModal(true)
  }

  const submitApplication = async () => {
    if (!selectedProject || !applicationText.trim()) return

    try {
      setIsLoading(true)
      // This would call the API to submit application
      // await developersAPI.applyToProject(selectedProject._id, {
      //   proposal: applicationText,
      //   proposedBudget: proposedBudget ? parseFloat(proposedBudget) : undefined
      // })
      
      setShowApplicationModal(false)
      setApplicationText('')
      setProposedBudget('')
      setSelectedProject(null)
      
      // Refresh applications
      const applicationsResponse = await developerDashboardAPI.getApplications({ limit: 10 })
      setApplications((applicationsResponse as any).data || [])
    } catch (error) {
      console.error('Error submitting application:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const ProjectCard: React.FC<{ project: ProjectListing }> = ({ project }) => (
    <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.title}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(project.urgency)}`}>
          {project.urgency}
        </span>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <DollarSign className="h-4 w-4 mr-1" />
          <span className="font-medium">{project.budget} {project.currency}</span>
          <span className="mx-2">•</span>
          <span>{project.projectType}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{new Date(project.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {project.skillsRequired.slice(0, 3).map((skill, index) => (
            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {skill}
            </span>
          ))}
          {project.skillsRequired.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{project.skillsRequired.length - 3} more
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-500">
          <Github className="h-4 w-4 mr-1" />
          <span>{project.clientId.githubUsername}</span>
          {project.clientId.profile?.company && (
            <>
              <span className="mx-2">at</span>
              <span className="font-medium">{project.clientId.profile.company}</span>
            </>
          )}
        </div>
        <button
          onClick={() => handleApplyToProject(project)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
        >
          <Send className="h-4 w-4 mr-1" />
          Apply
        </button>
      </div>
    </div>
  )

  const ApplicationCard: React.FC<{ application: Application }> = ({ application }) => (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {application.projectListingId.title}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {application.projectListingId.description}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getApplicationStatusColor(application.status)}`}>
          {application.status}
        </span>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <DollarSign className="h-4 w-4 mr-1" />
          <span className="font-medium">
            {application.proposedBudget || application.projectListingId.budget} {application.projectListingId.currency}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 line-clamp-2">{application.proposal}</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-500">
          <Github className="h-4 w-4 mr-1" />
          <span>{application.projectListingId.clientId.githubUsername}</span>
          {application.projectListingId.clientId.profile?.company && (
            <>
              <span className="mx-2">at</span>
              <span className="font-medium">{application.projectListingId.clientId.profile.company}</span>
            </>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View Details
          </button>
        </div>
      </div>
    </div>
  )

  const StatsCard: React.FC<{ title: string, value: string, icon: React.ReactNode, change?: string }> = ({ title, value, icon, change }) => (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className="text-sm text-green-600 flex items-center mt-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              {change}
            </p>
          )}
        </div>
        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  )

  if (isLoading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Developer Dashboard</h1>
              <p className="text-gray-600">Manage your projects and applications</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('projects')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
              >
                <Search className="h-4 w-4 mr-2" />
                Browse Projects
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { key: 'overview', label: 'Overview', icon: TrendingUp },
              { key: 'projects', label: 'Available Projects', icon: Briefcase },
              { key: 'applications', label: 'My Applications', icon: Send },
              { key: 'my-work', label: 'Active Work', icon: Code }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Available Projects"
                value={stats?.overview.availableProjects.toString() || '0'}
                icon={<Briefcase className="h-6 w-6 text-blue-600" />}
              />
              <StatsCard
                title="Applications Sent"
                value={stats?.overview.totalApplications.toString() || '0'}
                icon={<Send className="h-6 w-6 text-blue-600" />}
              />
              <StatsCard
                title="Active Projects"
                value={stats?.overview.activeProjects.toString() || '0'}
                icon={<Code className="h-6 w-6 text-blue-600" />}
              />
              <StatsCard
                title="Total Earned"
                value={`${stats?.overview.totalEarnings || 0} ETH`}
                icon={<DollarSign className="h-6 w-6 text-blue-600" />}
              />
            </div>

            {/* Recent Projects */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
                <button
                  onClick={() => setActiveTab('projects')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {availableProjects.slice(0, 4).map((project) => (
                  <ProjectCard key={project._id} project={project} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Available Projects</h2>
              <div className="flex items-center space-x-4">
                <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {availableProjects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">My Applications</h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {stats?.applications.pending} pending • {stats?.applications.accepted} accepted
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {applications.map((application) => (
                <ApplicationCard key={application._id} application={application} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'my-work' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Active Work</h2>
            <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
              <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Projects</h3>
              <p className="text-gray-600 mb-4">You don't have any active projects yet. Apply to some projects to get started!</p>
              <button
                onClick={() => setActiveTab('projects')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Browse Projects
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Application Modal */}
      {showApplicationModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Apply to Project</h2>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedProject.title}</h3>
                <p className="text-gray-600 mb-4">{selectedProject.description}</p>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span className="font-medium">{selectedProject.budget} {selectedProject.currency}</span>
                  <span className="mx-2">•</span>
                  <span>{selectedProject.projectType}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Proposal
                  </label>
                  <textarea
                    value={applicationText}
                    onChange={(e) => setApplicationText(e.target.value)}
                    rows={6}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Explain why you're the perfect fit for this project..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proposed Budget (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={proposedBudget}
                      onChange={(e) => setProposedBudget(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-16 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter amount"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      {selectedProject.currency}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitApplication}
                  disabled={!applicationText.trim() || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DeveloperDashboard 