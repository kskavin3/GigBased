import { useState, useEffect } from 'react'
import { developersAPI } from '../services/api'

interface Developer {
  _id: string
  email: string
  githubUsername: string
  walletAddress: string
  userType: 'developer'
  profile: {
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
  skills: {
    languages: string[]
    frameworks: string[]
    tools: string[]
    specializations: string[]
  }
  stats: {
    projectsApplied: number
    projectsCompleted: number
    totalEarned: number
    averageRating: number
    totalRatings: number
    successRate: number
  }
}

export const useDeveloperAuth = () => {
  const [developer, setDeveloper] = useState<Developer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('authToken')
        const userType = localStorage.getItem('userType')
        
        if (token && userType === 'developer') {
          const response = await developersAPI.getProfile()
          setDeveloper(response.data)
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('authToken')
        localStorage.removeItem('userType')
        localStorage.removeItem('walletAddress')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await developersAPI.login({ email, password })
      
      if ((response as any).success) {
        setDeveloper((response as any).data.developer)
        setIsAuthenticated(true)
        localStorage.setItem('authToken', (response as any).data.token)
        localStorage.setItem('userType', 'developer')
        localStorage.setItem('walletAddress', (response as any).data.developer.walletAddress)
        return { success: true }
      }
      
      return { success: false, error: 'Login failed' }
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' }
    }
  }

  const register = async (data: {
    email: string
    password: string
    githubUsername: string
    walletAddress: string
  }) => {
    try {
      const response = await developersAPI.register(data)
      
      if ((response as any).success) {
        setDeveloper((response as any).data.developer)
        setIsAuthenticated(true)
        localStorage.setItem('authToken', (response as any).data.token)
        localStorage.setItem('userType', 'developer')
        localStorage.setItem('walletAddress', data.walletAddress)
        return { success: true }
      }
      
      return { success: false, error: 'Registration failed' }
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' }
    }
  }

  const logout = async () => {
    try {
      await developersAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setDeveloper(null)
      setIsAuthenticated(false)
      localStorage.removeItem('authToken')
      localStorage.removeItem('userType')
      localStorage.removeItem('walletAddress')
    }
  }

  const updateProfile = async (data: any) => {
    try {
      const response = await developersAPI.updateProfile(data)
      
      if ((response as any).success) {
        setDeveloper((response as any).data)
        return { success: true }
      }
      
      return { success: false, error: 'Profile update failed' }
    } catch (error: any) {
      return { success: false, error: error.message || 'Profile update failed' }
    }
  }

  return {
    developer,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile
  }
} 