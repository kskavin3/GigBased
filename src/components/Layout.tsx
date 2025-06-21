import React from 'react'
import { Wallet, Github, Settings, LogOut } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-secondary-900">GigBased</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-secondary-600">
                <Wallet className="h-4 w-4" />
                <span>0x1234...5678</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-secondary-600">
                <Github className="h-4 w-4" />
                <span>username</span>
              </div>
              
              <button className="p-2 text-secondary-400 hover:text-secondary-600">
                <Settings className="h-5 w-5" />
              </button>
              
              <button className="p-2 text-secondary-400 hover:text-secondary-600">
                <LogOut className="h-5 w-5" />
              </button>
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