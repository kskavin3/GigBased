// User types
export interface User {
  id: string
  email: string
  githubUsername: string
  walletAddress: string
  authMethod: 'email' | 'google'
  createdAt: Date
}

// Project types
export interface Project {
  id: string
  title: string
  description: string
  budget: number
  currency: string
  stages: ProjectStage[]
  ownerId: string
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

export interface ProjectStage {
  id: string
  name: string
  description: string
  budgetPercentage: number
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  assignedDeveloper?: string
  startDate?: Date
  endDate?: Date
}

// Wallet types
export interface WalletConnection {
  address: string
  chainId: number
  isConnected: boolean
}

// Form types
export interface SignUpFormData {
  email: string
  password: string
  confirmPassword: string
  githubUsername: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
} 