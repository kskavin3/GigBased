import { useState, useEffect } from 'react'
import { dashboardAPI } from '../services/api'
import toast from 'react-hot-toast'

interface DashboardStats {
  overview: {
    activeListings: {
      value: number
      change: number
      changeText: string
    }
    totalApplications: {
      value: number
      change: number
      changeText: string
    }
    completedProjects: {
      value: number
      change: number
      changeText: string
    }
    totalSpent: {
      value: number
      valueFormatted: string
      change: number
      changeText: string
    }
  }
  breakdown: {
    listings: {
      total: number
      active: number
      draft: number
      closed: number
    }
    projects: {
      total: number
      active: number
      completed: number
      onHold: number
    }
    applications: {
      total: number
      thisWeek: number
      lastWeek: number
    }
  }
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response: any = await dashboardAPI.getStats()
      
      if (response.success) {
        setStats(response.data)
        setLastUpdated(new Date())
      } else {
        throw new Error(response.message || 'Failed to fetch dashboard stats')
      }
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error)
      setError(error.message || 'Failed to load dashboard statistics')
      
      // Show toast error for user feedback
      toast.error('Failed to load dashboard statistics')
    } finally {
      setIsLoading(false)
    }
  }

  const refreshStats = () => {
    fetchStats()
  }

  useEffect(() => {
    fetchStats()
  }, [])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [])

  return {
    stats,
    isLoading,
    error,
    lastUpdated,
    refreshStats
  }
} 