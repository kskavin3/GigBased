import React from 'react'
import { Plus, FolderOpen, Users, DollarSign } from 'lucide-react'

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="card">
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">
          Welcome to GigBased!
        </h2>
        <p className="text-secondary-600">
          You're all set up to start hosting projects on the blockchain. Create your first project to get started.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <FolderOpen className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Active Projects</p>
              <p className="text-2xl font-bold text-secondary-900">0</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Team Members</p>
              <p className="text-2xl font-bold text-secondary-900">0</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total Budget</p>
              <p className="text-2xl font-bold text-secondary-900">$0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Project Section */}
      <div className="card">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            Create Your First Project
          </h3>
          <p className="text-secondary-600 mb-6">
            Start by creating a new project and setting up your budget on the blockchain.
          </p>
          <button className="btn-primary">
            Create New Project
          </button>
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className="card">
        <h3 className="text-lg font-medium text-secondary-900 mb-4">
          Getting Started
        </h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-primary-600">1</span>
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-900">Create a Project</p>
              <p className="text-sm text-secondary-600">Define your project requirements and set the total budget.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-primary-600">2</span>
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-900">Stake Budget on Blockchain</p>
              <p className="text-sm text-secondary-600">Lock your project budget in a smart contract on Base Chain.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-primary-600">3</span>
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-900">Define Project Stages</p>
              <p className="text-sm text-secondary-600">Break down your project into stages with budget allocations.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-primary-600">4</span>
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-900">Hire Developers</p>
              <p className="text-sm text-secondary-600">Find and hire developers to work on your project stages.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 