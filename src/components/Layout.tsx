import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, Github, Settings, LogOut, Bell, User, Briefcase, ChevronDown } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  const { client, logout } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Format wallet address for display
  const formatWalletAddress = (address: string) => {
    if (!address) return 'No wallet connected'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (client?.profile?.firstName && client?.profile?.lastName) {
      return `${client.profile.firstName[0]}${client.profile.lastName[0]}`.toUpperCase()
    }
    if (client?.githubUsername) {
      return client.githubUsername.slice(0, 2).toUpperCase()
    }
    if (client?.email) {
      return client.email.slice(0, 2).toUpperCase()
    }
    return 'U'
  }

  // Get display name
  const getDisplayName = () => {
    if (client?.profile?.firstName && client?.profile?.lastName) {
      return `${client.profile.firstName} ${client.profile.lastName}`
    }
    if (client?.githubUsername) {
      return client.githubUsername
    }
    if (client?.email) {
      return client.email.split('@')[0]
    }
    return 'User'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">GB</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">GigBased</h1>
              </div>
              
              {/* Navigation Links */}
              <nav className="hidden md:flex space-x-6">
                <a href="#" className="flex items-center text-blue-600 font-medium">
                  <Briefcase className="h-5 w-5 mr-1" />
                  <span>Projects</span>
                </a>
              </nav>
            </div>
            
            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Wallet Info */}
              {client?.walletAddress && (
                <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                  <Wallet className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    {formatWalletAddress(client.walletAddress)}
                  </span>
                </div>
              )}
              
              {/* GitHub Info */}
              {client?.githubUsername && (
                <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <Github className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {client.githubUsername}
                  </span>
                </div>
              )}
              
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
              
              {/* Profile Menu */}
              <div className="relative" ref={profileMenuRef}>
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {getUserInitials()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {getDisplayName()}
                  </span>
                  <ChevronDown className="hidden sm:block h-4 w-4 text-gray-400" />
                </button>
                
                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {getUserInitials()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{getDisplayName()}</p>
                          <p className="text-xs text-gray-500">{client?.email}</p>
                          <p className="text-xs text-blue-600">{client?.userType?.replace('_', ' ') || 'Project Host'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <button 
                        onClick={() => {
                          setShowProfileMenu(false)
                          // Navigate to profile settings when implemented
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <User className="h-4 w-4" />
                        <span>Profile Settings</span>
                      </button>
                      <button 
                        onClick={() => {
                          setShowProfileMenu(false)
                          // Navigate to account settings when implemented
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Account Settings</span>
                      </button>
                    </div>
                    
                    <div className="border-t border-gray-100 py-2">
                      <button 
                        onClick={() => {
                          setShowProfileMenu(false)
                          handleLogout()
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

export default Layout 