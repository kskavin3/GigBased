import axios from 'axios'

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in requests
})

// Request interceptor to add auth token if available
api.interceptors.request.use((config) => {
  // Add auth token if available
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  
  // Add wallet address if needed
  const walletAddress = localStorage.getItem('walletAddress')
  if (walletAddress) {
    config.headers['X-Wallet-Address'] = walletAddress
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error.response?.data || error)
  }
)

// Project Listings API
export const projectListingsAPI = {
  // Get all project listings for a client
  getAll: (clientWallet?: string) => 
    api.get('/project-listings', { params: { clientWallet } }),
  
  // Get a specific project listing
  getById: (id: string) => 
    api.get(`/project-listings/${id}`),
  
  // Create a new project listing
  create: (data: {
    title: string
    description: string
    budget: number
    duration: string
    skillsRequired: string[]
    projectType: string
    location?: string
    urgency?: 'low' | 'medium' | 'high'
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
    status?: 'draft' | 'active'
  }) => api.post('/project-listings', data),
  
  // Update a project listing
  update: (id: string, data: any) => 
    api.put(`/project-listings/${id}`, data),
  
  // Delete a project listing
  delete: (id: string) => 
    api.delete(`/project-listings/${id}`),
  
  // Publish a project listing
  publish: (id: string) => 
    api.put(`/project-listings/${id}/publish`),
  
  // Add an application to a project listing
  addApplication: (id: string, data: {
    developerId: string
    developerWallet: string
    githubUsername: string
    proposal: string
    proposedBudget?: number
  }) => api.post(`/project-listings/${id}/apply`, data),
}

// Projects API
export const projectsAPI = {
  // Get all projects for a client
  getAll: (clientWallet?: string) => 
    api.get('/projects', { params: { clientWallet } }),
  
  // Get project statistics
  getStats: (clientWallet?: string) => 
    api.get('/projects/stats', { params: { clientWallet } }),
  
  // Get a specific project
  getById: (id: string) => 
    api.get(`/projects/${id}`),
  
  // Create a new project from a listing
  create: (data: {
    listingId: string
    developerId: string
    developerName: string
    developerAvatar?: string
    githubUsername: string
    walletAddress: string
    startDate: string
    endDate: string
    milestones?: Array<{
      title: string
      description?: string
      dueDate: string
    }>
    contractAddress?: string
    transactionHash?: string
  }) => api.post('/projects', data),
  
  // Update a project
  update: (id: string, data: any) => 
    api.put(`/projects/${id}`, data),
  
  // Update milestone status
  updateMilestone: (projectId: string, milestoneId: string, status: 'pending' | 'in_progress' | 'completed') => 
    api.put(`/projects/${projectId}/milestones/${milestoneId}`, { status }),
  
  // Add a payment record
  addPayment: (id: string, data: {
    amount: number
    transactionHash: string
    milestone?: string
  }) => api.post(`/projects/${id}/payments`, data),
}

// Clients API
export const clientsAPI = {
  // Register new client
  register: (data: {
    email: string
    password: string
    githubUsername: string
    walletAddress: string
    authMethod?: string
  }) => api.post('/clients/register', data),
  
  // Login client
  login: (data: {
    email: string
    password: string
  }) => api.post('/clients/login', data),
  
  // Logout client
  logout: () => api.post('/clients/logout'),
  
  // Get client profile
  getProfile: () => api.get('/clients/profile'),
  
  // Update client profile
  updateProfile: (data: {
    profile?: {
      firstName?: string
      lastName?: string
      company?: string
      bio?: string
      avatar?: string
      location?: string
      website?: string
    }
    preferences?: {
      notifications?: {
        email?: boolean
        push?: boolean
      }
      currency?: string
      timezone?: string
    }
  }) => api.put('/clients/profile', data),
  
  // Delete client account
  deleteAccount: () => api.delete('/clients/account'),
}

// Dashboard API
export const dashboardAPI = {
  // Get dashboard statistics
  getStats: () => api.get('/dashboard/stats'),
}

// Developers API
export const developersAPI = {
  // Register new developer
  register: (data: {
    email: string
    password: string
    githubUsername: string
    walletAddress: string
    authMethod?: string
  }) => api.post('/developers/register', data),
  
  // Login developer
  login: (data: {
    email: string
    password: string
  }) => api.post('/developers/login', data),
  
  // Logout developer
  logout: () => api.post('/developers/logout'),
  
  // Get developer profile
  getProfile: () => api.get('/developers/profile'),
  
  // Update developer profile
  updateProfile: (data: {
    profile?: {
      firstName?: string
      lastName?: string
      bio?: string
      avatar?: string
      location?: string
      website?: string
      portfolio?: string
      linkedIn?: string
      yearsOfExperience?: number
      hourlyRate?: number
      availability?: string
    }
    skills?: {
      languages?: string[]
      frameworks?: string[]
      tools?: string[]
      specializations?: string[]
    }
    preferences?: {
      notifications?: {
        email?: boolean
        push?: boolean
      }
      currency?: string
      timezone?: string
      projectTypes?: string[]
      minBudget?: number
      maxBudget?: number
    }
  }) => api.put('/developers/profile', data),
  
  // Apply to project listing
  applyToProject: (listingId: string, data: {
    proposal: string
    proposedBudget?: number
  }) => api.post(`/developers/apply/${listingId}`, data),
  
  // Delete developer account
  deleteAccount: () => api.delete('/developers/account'),
}

// Developer Dashboard API
export const developerDashboardAPI = {
  // Get developer dashboard statistics
  getStats: () => api.get('/dev/dashboard/stats'),
  
  // Get available project listings
  getListings: (params?: {
    page?: number
    limit?: number
    skills?: string
    projectType?: string
    budget?: string
    urgency?: string
  }) => api.get('/dev/dashboard/listings', { params }),
  
  // Get developer applications
  getApplications: (params?: {
    page?: number
    limit?: number
    status?: string
  }) => api.get('/dev/dashboard/applications', { params }),
  
  // Get developer projects
  getProjects: (params?: {
    page?: number
    limit?: number
    status?: string
  }) => api.get('/dev/dashboard/projects', { params }),
  
  // Get dashboard analytics over time
  getAnalytics: (period: '7d' | '30d' | '90d' | '1y' = '30d') => 
    api.get('/dashboard/analytics', { params: { period } }),
}

// Health check
export const healthCheck = () => api.get('/health')

export default api 