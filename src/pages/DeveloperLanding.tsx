import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ethers } from 'ethers'
import { developersAPI } from '../services/api'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Github, 
  Wallet, 
  X,
  Code2,
  Shield,
  ArrowRight,
  Star,
  Globe,
  Zap,
  Target,
  Award,
  Layers,
  Play,
  ChevronRight,
  DollarSign,
  Users,
  TrendingUp,
  Briefcase
} from 'lucide-react'

interface DeveloperSignUpFormData {
  email: string
  password: string
  confirmPassword: string
  githubUsername: string
}

interface DeveloperLoginFormData {
  email: string
  password: string
}

const DeveloperLandingPage: React.FC = () => {
  const navigate = useNavigate()
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [showSignInModal, setShowSignInModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [isWalletConnected, setIsWalletConnected] = useState(false)

  const signUpForm = useForm<DeveloperSignUpFormData>()
  const loginForm = useForm<DeveloperLoginFormData>()

  const password = signUpForm.watch('password')

  const connectMetaMask = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        toast.error('MetaMask is not installed. Please install MetaMask first.')
        return
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })
      
      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }
      
      const address = accounts[0]
      setWalletAddress(address)
      setIsWalletConnected(true)
      toast.success(`Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`)
      
    } catch (error) {
      console.error('MetaMask connection error:', error)
      toast.error('Failed to connect MetaMask')
    }
  }

  const onSignUpSubmit = async (data: DeveloperSignUpFormData) => {
    if (!isWalletConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    try {
      setIsLoading(true)
      const response = await developersAPI.register({
        email: data.email,
        password: data.password,
        githubUsername: data.githubUsername,
        walletAddress: walletAddress,
        authMethod: 'email'
      })

      // Since axios interceptor returns response.data, the response object has the properties directly
      if ((response as any).success) {
        toast.success('Developer account created successfully!')
        localStorage.setItem('authToken', (response as any).data.token)
        localStorage.setItem('walletAddress', walletAddress)
        localStorage.setItem('userType', 'developer')
        navigate('/dev/dashboard')
      }
    } catch (error: any) {
      console.error('Developer registration error:', error)
      toast.error(error.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const onLoginSubmit = async (data: DeveloperLoginFormData) => {
    try {
      setIsLoading(true)
      const response = await developersAPI.login(data)

      if ((response as any).success) {
        toast.success('Login successful!')
        localStorage.setItem('authToken', (response as any).data.token)
        localStorage.setItem('walletAddress', (response as any).data.developer.walletAddress)
        localStorage.setItem('userType', 'developer')
        navigate('/dev/dashboard')
      }
    } catch (error: any) {
      console.error('Developer login error:', error)
      toast.error(error.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const closeModals = () => {
    setShowSignUpModal(false)
    setShowSignInModal(false)
    signUpForm.reset()
    loginForm.reset()
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  const AuthModal: React.FC<{ isSignUp: boolean }> = ({ isSignUp }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isSignUp ? 'Join as Developer' : 'Developer Sign In'}
            </h2>
            <button
              onClick={closeModals}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {isSignUp && (
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-900 mb-2">Connect Your Wallet</h3>
                {!isWalletConnected ? (
                  <button
                    onClick={connectMetaMask}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect MetaMask
                  </button>
                ) : (
                  <div className="text-sm text-blue-700">
                    <p>✅ Wallet Connected</p>
                    <p className="font-mono">{walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={isSignUp ? signUpForm.handleSubmit(onSignUpSubmit) : loginForm.handleSubmit(onLoginSubmit)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    {...(isSignUp ? signUpForm.register('email', { required: 'Email is required' }) : loginForm.register('email', { required: 'Email is required' }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GitHub Username
                  </label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      {...signUpForm.register('githubUsername', { required: 'GitHub username is required' })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your GitHub username"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...(isSignUp ? signUpForm.register('password', { 
                      required: 'Password is required',
                      minLength: { value: 8, message: 'Password must be at least 8 characters' }
                    }) : loginForm.register('password', { required: 'Password is required' }))}
                    className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...signUpForm.register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: value => value === password || 'Passwords do not match'
                      })}
                      className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || (isSignUp && !isWalletConnected)}
              className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : (isSignUp ? 'Create Developer Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setShowSignUpModal(!isSignUp)
                setShowSignInModal(isSignUp)
              }}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Code2 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">GigBased</span>
              <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">For Developers</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSignInModal(true)}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => setShowSignUpModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Join as Developer
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Build Your
              <span className="text-blue-600"> Developer Career</span>
              <br />
              on Blockchain
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of developers earning cryptocurrency by building amazing projects. 
              Secure payments, transparent contracts, and global opportunities await.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowSignUpModal(true)}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                Start Earning Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button
                onClick={() => navigate('/')}
                className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <Users className="mr-2 h-5 w-5" />
                Looking to Hire? Go Here
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Developers Choose GigBased
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built by developers, for developers. Experience the future of freelance work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Crypto Payments</h3>
              <p className="text-gray-600">
                Get paid in cryptocurrency directly to your wallet. No waiting for bank transfers or payment processors.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Secure Escrow</h3>
              <p className="text-gray-600">
                Smart contract escrow ensures you get paid when milestones are completed. No disputes, no delays.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Matching</h3>
              <p className="text-gray-600">
                Our AI matches you with projects that fit your skills and interests. Find work that excites you.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-6">
                <Globe className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Global Projects</h3>
              <p className="text-gray-600">
                Work with clients from around the world. No geographical boundaries, just great opportunities.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Instant Applications</h3>
              <p className="text-gray-600">
                Apply to projects instantly with your portfolio. No lengthy proposals or waiting periods.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Build Your Reputation</h3>
              <p className="text-gray-600">
                Complete projects successfully and build a strong on-chain reputation that follows you everywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ready to Start Your Developer Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of developers earning cryptocurrency on GigBased
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowSignUpModal(true)}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Briefcase className="mr-2 h-5 w-5" />
              Start Earning Today
            </button>
          </div>
        </div>
      </section>

      {/* Modals */}
      {showSignUpModal && <AuthModal isSignUp={true} />}
      {showSignInModal && <AuthModal isSignUp={false} />}
    </div>
  )
}

export default DeveloperLandingPage 