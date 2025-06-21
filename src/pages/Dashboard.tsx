import React, { useState } from 'react'
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
  MapPin,
  Filter,
  Search,
  MoreHorizontal,
  TrendingUp,
  Award,
  Star
} from 'lucide-react'

interface ProjectListing {
  id: string
  title: string
  description: string
  budget: number
  currency: string
  duration: string
  skillsRequired: string[]
  applicants: number
  status: 'active' | 'closed' | 'draft'
  postedDate: string
  location: string
  urgency: 'low' | 'medium' | 'high'
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
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'my-listings' | 'my-projects'>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Mock data for project listings (requests for developers)
  const myProjectListings: ProjectListing[] = [
    {
      id: '1',
      title: 'E-commerce Mobile App Development',
      description: 'Looking for experienced React Native developers to build a cross-platform e-commerce mobile application with payment integration.',
      budget: 2.5,
      currency: 'ETH',
      duration: '3 months',
      skillsRequired: ['React Native', 'TypeScript', 'Node.js', 'MongoDB'],
      applicants: 12,
      status: 'active',
      postedDate: '2024-01-15',
      location: 'Remote',
      urgency: 'medium'
    },
    {
      id: '2',
      title: 'Smart Contract Development for DeFi Platform',
      description: 'Need Solidity experts to develop and audit smart contracts for a new DeFi lending platform on Base Chain.',
      budget: 4.2,
      currency: 'ETH',
      duration: '2 months',
      skillsRequired: ['Solidity', 'Web3', 'DeFi', 'Security Auditing'],
      applicants: 8,
      status: 'closed',
      postedDate: '2024-01-10',
      location: 'Remote',
      urgency: 'high'
    },
    {
      id: '3',
      title: 'UI/UX Design for SaaS Dashboard',
      description: 'Seeking creative designers to redesign our SaaS platform dashboard with modern UI/UX principles.',
      budget: 1.8,
      currency: 'ETH',
      duration: '6 weeks',
      skillsRequired: ['Figma', 'UI/UX Design', 'Prototyping', 'User Research'],
      applicants: 15,
      status: 'draft',
      postedDate: '2024-01-05',
      location: 'Remote',
      urgency: 'low'
    }
  ]

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
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const ProjectListingCard: React.FC<{ listing: ProjectListing, showActions?: boolean }> = ({ listing, showActions = false }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{listing.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{listing.description}</p>
        </div>
        {showActions && (
          <div className="flex items-center space-x-2 ml-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
              <Edit3 className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full">
              <Trash2 className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {listing.skillsRequired.slice(0, 3).map((skill, index) => (
          <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
            {skill}
          </span>
        ))}
        {listing.skillsRequired.length > 3 && (
          <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs rounded-full font-medium">
            +{listing.skillsRequired.length - 3} more
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-1" />
            <span className="font-medium">{listing.budget.toLocaleString()} {listing.currency}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{listing.duration}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{listing.location}</span>
          </div>
        </div>
        <div className={`flex items-center ${getUrgencyColor(listing.urgency)}`}>
          <TrendingUp className="h-4 w-4 mr-1" />
          <span className="capitalize font-medium">{listing.urgency}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getListingStatusColor(listing.status)}`}>
            {listing.status.replace('_', ' ').toUpperCase()}
          </span>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-1" />
            <span>{listing.applicants} applicants</span>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Posted {new Date(listing.postedDate).toLocaleDateString()}
        </div>
      </div>
    </div>
  )

  const ProjectCard: React.FC<{ project: Project, showActions?: boolean }> = ({ project, showActions = false }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{project.description}</p>
        </div>
        {showActions && (
          <div className="flex items-center space-x-2 ml-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
              <Edit3 className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full">
              <Trash2 className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Developer Info */}
      <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white font-medium text-sm">{project.assignedDeveloper.avatar}</span>
        </div>
        <div>
          <p className="font-medium text-gray-900">{project.assignedDeveloper.name}</p>
          <p className="text-sm text-gray-600">@{project.assignedDeveloper.githubUsername}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-1" />
            <span className="font-medium">{project.budget.toLocaleString()} {project.currency}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{new Date(project.timeline.startDate).toLocaleDateString()} - {new Date(project.timeline.endDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Milestones</h4>
        <div className="space-y-2">
          {project.timeline.milestones.slice(0, 2).map((milestone, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{milestone.title}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {milestone.status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getProjectStatusColor(project.status)}`}>
          {project.status.replace('_', ' ').toUpperCase()}
        </span>
        <div className="text-xs text-gray-500">
          Started {new Date(project.timeline.startDate).toLocaleDateString()}
        </div>
      </div>
    </div>
  )

  const CreateProjectForm: React.FC = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Project Listing</h2>
      
      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Project Title</label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your project title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Project Description</label>
          <textarea
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe your project requirements, goals, and expectations..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Budget (ETH)</label>
            <div className="flex">
              <input
                type="number"
                step="0.1"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="2.5"
              />
              <div className="px-4 py-3 border-l-0 border-gray-300 rounded-r-lg bg-gray-50 flex items-center">
                <span className="text-gray-700 font-medium">ETH</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>1-2 weeks</option>
              <option>3-4 weeks</option>
              <option>1-2 months</option>
              <option>3-6 months</option>
              <option>6+ months</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Required Skills</label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="React, Node.js, TypeScript, MongoDB (comma separated)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Web Development</option>
              <option>Mobile App</option>
              <option>Blockchain/DeFi</option>
              <option>AI/ML</option>
              <option>Design</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Save as Draft
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Post Project
          </button>
        </div>
      </form>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your projects and find talented developers</p>
        </div>
        <button
          onClick={() => setActiveTab('create')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Project Listing
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'create', label: 'Create Project Listing', icon: Plus },
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
            <StatsCard
              title="Active Projects"
              value="3"
              icon={<Briefcase className="h-6 w-6 text-blue-600" />}
              change="+2 this month"
            />
            <StatsCard
              title="Total Applications"
              value="35"
              icon={<Users className="h-6 w-6 text-blue-600" />}
              change="+12 this week"
            />
            <StatsCard
              title="Completed Projects"
              value="8"
              icon={<Award className="h-6 w-6 text-blue-600" />}
              change="100% success rate"
            />
            <StatsCard
              title="Total Spent"
              value="8.8 ETH"
              icon={<DollarSign className="h-6 w-6 text-blue-600" />}
              change="~$24,500 USD"
            />
          </div>

          {/* Recent Project Listings */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Project Listings</h2>
            <div className="space-y-4">
              {myProjectListings.slice(0, 2).map(listing => (
                <ProjectListingCard key={listing.id} listing={listing} showActions={true} />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'create' && <CreateProjectForm />}

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

          <div className="space-y-4">
            {myProjectListings
              .filter(listing => filterStatus === 'all' || listing.status === filterStatus)
              .map(listing => (
                <ProjectListingCard key={listing.id} listing={listing} showActions={true} />
              ))}
          </div>
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
  )
}

export default Dashboard 