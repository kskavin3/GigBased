import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { projectListingsAPI } from '../services/api'
import { 
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Bot,
  Zap,
  Target,
  ArrowLeft as BackArrow,
  Plus
} from 'lucide-react'

interface ProjectFormData {
  title: string
  description: string
  budget: string
  duration: string
  skillsRequired: string
  projectType: string
  urgency: string
  timeline: {
    startDate: string
    endDate: string
    milestones: Array<{
      title: string
      dueDate: string
      description: string
      timeInWeeks?: number
      budgetPercentage?: number
      approvalTime?: number
      stageType?: string
    }>
  }
}

const CreateProjectListing: React.FC = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    budget: '',
    duration: '',
    skillsRequired: '',
    projectType: '',
    urgency: '',
    timeline: {
      startDate: '',
      endDate: '',
      milestones: []
    }
  })
  const [isGeneratingTimeline, setIsGeneratingTimeline] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // AI Timeline Generation Mock Function
  const generateTimeline = async () => {
    setIsGeneratingTimeline(true)
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock AI-generated timeline based on project details
    const mockMilestones = [
      {
        title: "Project Setup & Planning",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: "Initial project setup, requirement analysis, and technical planning",
        timeInWeeks: 1,
        budgetPercentage: 20,
        approvalTime: 48,
        stageType: "Documentation"
      },
      {
        title: "Core Development Phase",
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: "Main development work based on project requirements",
        timeInWeeks: 3,
        budgetPercentage: 50,
        approvalTime: 72,
        stageType: "Code Submission"
      },
      {
        title: "Testing & Quality Assurance",
        dueDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: "Comprehensive testing, bug fixes, and quality assurance",
        timeInWeeks: 2,
        budgetPercentage: 20,
        approvalTime: 48,
        stageType: "Code Submission"
      },
      {
        title: "Final Review & Delivery",
        dueDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: "Final review, documentation, and project delivery",
        timeInWeeks: 1,
        budgetPercentage: 10,
        approvalTime: 72,
        stageType: "Approval"
      }
    ]

    setFormData(prev => ({
      ...prev,
      timeline: {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        milestones: mockMilestones
      }
    }))
    
    setIsGeneratingTimeline(false)
  }

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (isDraft: boolean = false) => {
    try {
      setIsSubmitting(true)
      
      // Get wallet address from localStorage (you might want to use a proper auth context)
      const walletAddress = localStorage.getItem('walletAddress') || 'demo-wallet-address'
      
      // Ensure all milestones have required fields
      const validatedMilestones = formData.timeline.milestones.map(milestone => ({
        title: milestone.title,
        description: milestone.description,
        dueDate: milestone.dueDate,
        timeInWeeks: milestone.timeInWeeks || 1,
        budgetPercentage: milestone.budgetPercentage || 25,
        approvalTime: milestone.approvalTime || 48,
        stageType: (milestone.stageType || 'Code Submission') as 'Documentation' | 'Code Submission' | 'Approval'
      }))
      
      // Prepare the data for API submission
      const submissionData = {
        title: formData.title,
        description: formData.description,
        budget: parseFloat(formData.budget),
        duration: formData.duration,
        skillsRequired: formData.skillsRequired.split(',').map(skill => skill.trim()),
        projectType: formData.projectType,
        urgency: formData.urgency as 'low' | 'medium' | 'high',
        timeline: {
          ...formData.timeline,
          milestones: validatedMilestones
        },
        clientId: walletAddress, // Using wallet address as client ID for now
        clientWallet: walletAddress,
        status: isDraft ? 'draft' as const : 'active' as const
      }

      console.log('Submitting project listing:', submissionData)

      // Submit to API
      const response = await projectListingsAPI.create(submissionData)
      
      console.log('Project listing created successfully:', response)
      
      // Show success message (you might want to add a toast notification)
      alert(isDraft ? 'Project saved as draft!' : 'Project published successfully!')
      
      // Navigate back to dashboard
      navigate('/dashboard')
    } catch (error) {
      console.error('Error submitting project listing:', error)
      alert('Error submitting project listing. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <BackArrow className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Project Listing</h1>
                <p className="text-gray-600 mt-1">Step {currentStep} of 3</p>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center">
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step < currentStep ? <CheckCircle className="h-6 w-6" /> : step}
                  </div>
                  {step < 3 && (
                    <div className={`flex-1 h-2 mx-4 rounded ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between mt-3 text-sm text-gray-600">
              <span>Project Details</span>
              <span>AI Timeline</span>
              <span>Review & Save</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleFormSubmit} className="p-8">
            {/* Step 1: Project Details */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <Target className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-gray-900">Project & Budget Details</h2>
                  <p className="text-gray-600 mt-2">Tell us about your project requirements and budget</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your project title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Description</label>
                  <textarea
                    rows={5}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
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
                        value={formData.budget}
                        onChange={(e) => handleInputChange('budget', e.target.value)}
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
                    <select 
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select duration</option>
                      <option value="1-2 weeks">1-2 weeks</option>
                      <option value="3-4 weeks">3-4 weeks</option>
                      <option value="1-2 months">1-2 months</option>
                      <option value="3-6 months">3-6 months</option>
                      <option value="6+ months">6+ months</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Required Skills</label>
                  <input
                    type="text"
                    value={formData.skillsRequired}
                    onChange={(e) => handleInputChange('skillsRequired', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="React, Node.js, TypeScript, MongoDB (comma separated)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
                    <select 
                      value={formData.projectType}
                      onChange={(e) => handleInputChange('projectType', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select type</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Mobile App">Mobile App</option>
                      <option value="Blockchain/DeFi">Blockchain/DeFi</option>
                      <option value="AI/ML">AI/ML</option>
                      <option value="Design">Design</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
                    <select 
                      value={formData.urgency}
                      onChange={(e) => handleInputChange('urgency', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select urgency</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: AI Timeline Generation */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <Bot className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-gray-900">AI Timeline & Milestone Creation</h2>
                  <p className="text-gray-600 mt-2">Configure your project milestones and timeline</p>
                </div>

                {formData.timeline.milestones.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-blue-50 rounded-lg p-8 mb-8">
                      <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Ready to Generate Timeline</h3>
                      <p className="text-gray-600 mb-6">
                        Based on your project details, our AI will create a comprehensive timeline with milestones
                      </p>
                      <div className="text-sm text-gray-500 mb-6 space-y-1">
                        <p><strong>Project:</strong> {formData.title || 'Untitled Project'}</p>
                        <p><strong>Duration:</strong> {formData.duration || 'Not specified'}</p>
                        <p><strong>Type:</strong> {formData.projectType || 'Not specified'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={generateTimeline}
                        disabled={isGeneratingTimeline}
                        className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 text-lg"
                      >
                        {isGeneratingTimeline ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                            Generating Timeline...
                          </>
                        ) : (
                          <>
                            <Bot className="h-5 w-5 mr-3" />
                            Generate AI Timeline
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
                      <div className="flex items-center">
                        <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                        <span className="text-green-800 font-medium text-lg">Timeline Generated Successfully!</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-900">Project Milestones</h3>
                        <button
                          type="button"
                          onClick={generateTimeline}
                          disabled={isGeneratingTimeline}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm"
                        >
                          <Bot className="h-4 w-4 mr-2" />
                          Regenerate
                        </button>
                      </div>

                      {/* Milestone Configuration Table */}
                      <div className="border border-gray-300 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 p-4 border-b border-gray-300">
                          <div className="grid grid-cols-6 gap-4 font-medium text-gray-700">
                            <div>Stage</div>
                            <div>Time in Weeks</div>
                            <div>Budget %</div>
                            <div>Approval Time (Hours)</div>
                            <div>Stage Type</div>
                            <div>Action</div>
                          </div>
                        </div>
                        
                        <div className="divide-y divide-gray-200">
                          {formData.timeline.milestones.map((milestone, index) => (
                            <div key={index} className="p-4">
                              <div className="grid grid-cols-6 gap-4 items-start">
                                {/* Stage - Larger with Description */}
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    value={milestone.title}
                                    onChange={(e) => {
                                      const updatedMilestones = [...formData.timeline.milestones]
                                      updatedMilestones[index] = { ...milestone, title: e.target.value }
                                      setFormData(prev => ({
                                        ...prev,
                                        timeline: { ...prev.timeline, milestones: updatedMilestones }
                                      }))
                                    }}
                                    className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
                                    placeholder="Stage name"
                                  />
                                  <textarea
                                    rows={3}
                                    value={milestone.description}
                                    onChange={(e) => {
                                      const updatedMilestones = [...formData.timeline.milestones]
                                      updatedMilestones[index] = { ...milestone, description: e.target.value }
                                      setFormData(prev => ({
                                        ...prev,
                                        timeline: { ...prev.timeline, milestones: updatedMilestones }
                                      }))
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                                    placeholder="Stage description..."
                                  />
                                </div>

                                {/* Time in Weeks */}
                                <div className="flex items-center h-full">
                                  <input
                                    type="number"
                                    min="1"
                                    value={milestone.timeInWeeks || 1}
                                    onChange={(e) => {
                                      const updatedMilestones = [...formData.timeline.milestones]
                                      updatedMilestones[index] = { ...milestone, timeInWeeks: parseInt(e.target.value) || 1 }
                                      setFormData(prev => ({
                                        ...prev,
                                        timeline: { ...prev.timeline, milestones: updatedMilestones }
                                      }))
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    placeholder="Weeks"
                                  />
                                </div>

                                {/* Budget % */}
                                <div className="flex items-center h-full">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={milestone.budgetPercentage || 25}
                                    onChange={(e) => {
                                      const updatedMilestones = [...formData.timeline.milestones]
                                      updatedMilestones[index] = { ...milestone, budgetPercentage: parseInt(e.target.value) || 0 }
                                      setFormData(prev => ({
                                        ...prev,
                                        timeline: { ...prev.timeline, milestones: updatedMilestones }
                                      }))
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    placeholder="Budget %"
                                  />
                                </div>

                                {/* Approval Time in Hours */}
                                <div className="flex items-center h-full">
                                  <input
                                    type="number"
                                    min="24"
                                    max="72"
                                    value={milestone.approvalTime || 48}
                                    onChange={(e) => {
                                      const value = parseInt(e.target.value) || 24
                                      const clampedValue = Math.min(Math.max(value, 24), 72)
                                      const updatedMilestones = [...formData.timeline.milestones]
                                      updatedMilestones[index] = { ...milestone, approvalTime: clampedValue }
                                      setFormData(prev => ({
                                        ...prev,
                                        timeline: { ...prev.timeline, milestones: updatedMilestones }
                                      }))
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    placeholder="24-72 hours"
                                  />
                                </div>

                                {/* Stage Type */}
                                <div className="flex items-center h-full">
                                  <select
                                    value={milestone.stageType || 'Code Submission'}
                                    onChange={(e) => {
                                      const updatedMilestones = [...formData.timeline.milestones]
                                      updatedMilestones[index] = { ...milestone, stageType: e.target.value }
                                      setFormData(prev => ({
                                        ...prev,
                                        timeline: { ...prev.timeline, milestones: updatedMilestones }
                                      }))
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                  >
                                    <option value="Documentation">Documentation</option>
                                    <option value="Code Submission">Code Submission</option>
                                    <option value="Approval">Approval</option>
                                  </select>
                                </div>

                                {/* Save Button */}
                                <div className="flex items-center h-full">
                                  <button
                                    type="button"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Add New Milestone Button */}
                      <div className="flex justify-center pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            const newMilestone = {
                              title: `Stage ${formData.timeline.milestones.length + 1}`,
                              dueDate: new Date(Date.now() + (formData.timeline.milestones.length + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                              description: 'New milestone description',
                              timeInWeeks: 1,
                              budgetPercentage: 25,
                              approvalTime: 48,
                              stageType: 'Code Submission'
                            }
                            setFormData(prev => ({
                              ...prev,
                              timeline: {
                                ...prev.timeline,
                                milestones: [...prev.timeline.milestones, newMilestone]
                              }
                            }))
                          }}
                          className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          Add Milestone
                        </button>
                      </div>

                      {/* Save All Button */}
                      <div className="flex justify-center pt-6 border-t border-gray-200">
                        <button
                          type="button"
                          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-lg"
                        >
                          Save All Changes
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review and Save */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-gray-900">Review & Save Listing</h2>
                  <p className="text-gray-600 mt-2">Review your project details before publishing</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Project Summary</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
                      <div className="space-y-3">
                        <div><span className="text-gray-600 font-medium">Title:</span> <span className="ml-2 text-gray-900">{formData.title}</span></div>
                        <div><span className="text-gray-600 font-medium">Type:</span> <span className="ml-2 text-gray-900">{formData.projectType}</span></div>
                        <div><span className="text-gray-600 font-medium">Duration:</span> <span className="ml-2 text-gray-900">{formData.duration}</span></div>
                        <div><span className="text-gray-600 font-medium">Budget:</span> <span className="ml-2 text-gray-900">{formData.budget} ETH</span></div>
                        <div><span className="text-gray-600 font-medium">Urgency:</span> <span className="ml-2 text-gray-900 capitalize">{formData.urgency}</span></div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Timeline</h4>
                      <div className="space-y-3">
                        <div><span className="text-gray-600 font-medium">Start:</span> <span className="ml-2 text-gray-900">{formData.timeline.startDate}</span></div>
                        <div><span className="text-gray-600 font-medium">End:</span> <span className="ml-2 text-gray-900">{formData.timeline.endDate}</span></div>
                        <div><span className="text-gray-600 font-medium">Milestones:</span> <span className="ml-2 text-gray-900">{formData.timeline.milestones.length} created</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Description</h4>
                    <p className="text-gray-600 leading-relaxed">{formData.description}</p>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.skillsRequired.split(',').map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Previous
            </button>

            <div className="flex space-x-4">
              {currentStep === 3 ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleSubmit(true)}
                    disabled={isSubmitting}
                    className="px-8 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : 'Save as Draft'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmit(false)}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Publishing...' : 'Publish Project'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={currentStep === 2 && formData.timeline.milestones.length === 0}
                  className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight className="h-5 w-5 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateProjectListing 