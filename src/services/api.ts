import axios from 'axios'

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token if available
api.interceptors.request.use((config) => {
  // Add wallet address or auth token if needed
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
    location?: string
    urgency?: 'low' | 'medium' | 'high'
    clientId: string
    clientWallet: string
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

// Health check
export const healthCheck = () => api.get('/health')

export default api 