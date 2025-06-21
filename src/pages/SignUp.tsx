import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ethers } from 'ethers'
import { useAuth } from '../hooks/useAuth'
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
  ChevronRight
} from 'lucide-react'

interface SignUpFormData {
  email: string
  password: string
  confirmPassword: string
  githubUsername: string
}

interface LoginFormData {
  email: string
  password: string
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [showSignInModal, setShowSignInModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [walletBalance, setWalletBalance] = useState<string>('')
  const [currentNetwork, setCurrentNetwork] = useState<{ name: string; chainId: number } | null>(null)

  const signUpForm = useForm<SignUpFormData>()
  const loginForm = useForm<LoginFormData>()

  const password = signUpForm.watch('password')

  const connectMetaMask = async () => {
    try {
      console.log('🔗 Starting MetaMask connection...')
      
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        console.error('❌ MetaMask not found')
        toast.error('MetaMask is not installed. Please install MetaMask first.')
        return
      }

      console.log('✅ MetaMask detected:', window.ethereum)
      console.log('🔍 MetaMask properties:', {
        isMetaMask: window.ethereum.isMetaMask,
        selectedAddress: window.ethereum.selectedAddress,
        chainId: window.ethereum.chainId
      })

      // Request account access using traditional method
      console.log('🔐 Requesting account access...')
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })
      console.log('✅ Accounts received:', accounts)
      
      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }
      
      const address = accounts[0]
      console.log('✅ Using address:', address)

      // Base Testnet configuration
      const BASE_TESTNET = {
        chainId: '0x14A34', // 84532 in decimal
        chainName: 'Base Sepolia Testnet',
        nativeCurrency: {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: ['https://sepolia.base.org'],
        blockExplorerUrls: ['https://sepolia-explorer.base.org'],
      }

      // Get current network
      console.log('🌐 Getting current network info...')
      const currentChainId = await window.ethereum.request({
        method: 'eth_chainId',
      })
      console.log('✅ Current Chain ID:', currentChainId)

      // Check if we're on Base Testnet, if not, switch to it
      if (currentChainId !== BASE_TESTNET.chainId) {
        console.log('🔄 Switching to Base Testnet...')
        try {
          // Try to switch to Base Testnet
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: BASE_TESTNET.chainId }],
          })
          console.log('✅ Successfully switched to Base Testnet')
        } catch (switchError: any) {
          // If the network doesn't exist, add it
          if (switchError.code === 4902) {
            console.log('➕ Adding Base Testnet to MetaMask...')
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [BASE_TESTNET],
              })
              console.log('✅ Successfully added Base Testnet')
            } catch (addError) {
              console.error('❌ Failed to add Base Testnet:', addError)
              toast.error('Failed to add Base Testnet to MetaMask')
              return
            }
          } else {
            console.error('❌ Failed to switch to Base Testnet:', switchError)
            toast.error('Failed to switch to Base Testnet')
            return
          }
        }
      } else {
        console.log('✅ Already on Base Testnet')
      }

      // Get updated network info after potential switch
      const finalChainId = await window.ethereum.request({
        method: 'eth_chainId',
      })

      // Try to get balance using ethers
      let balanceInEth = '0'
      let networkName = 'Base Sepolia Testnet'
      
      try {
        console.log('🏗️ Creating ethers provider for additional info...')
        const provider = new ethers.BrowserProvider(window.ethereum)
        const balance = await provider.getBalance(address)
        balanceInEth = ethers.formatEther(balance)
        console.log('✅ Balance info obtained')
      } catch (ethersError) {
        console.warn('⚠️ Could not get balance info via ethers:', ethersError)
        // Continue without balance info
      }
      
      setWalletAddress(address)
      setIsWalletConnected(true)
      setWalletBalance(balanceInEth)
      setCurrentNetwork({
        name: networkName,
        chainId: parseInt(finalChainId, 16)
      })
      
      toast.success(`Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)} on ${networkName}`)
      
      console.log('🎉 Connection successful:', {
        address,
        network: networkName,
        chainId: parseInt(finalChainId, 16),
        balance: balanceInEth
      })
      
      // Listen for account changes
      window.ethereum.on?.('accountsChanged', (accounts: string[]) => {
        console.log('👤 Account changed:', accounts)
        if (accounts.length === 0) {
          setIsWalletConnected(false)
          setWalletAddress('')
          setWalletBalance('')
          setCurrentNetwork(null)
          toast('Wallet disconnected', { icon: 'ℹ️' })
        } else {
          setWalletAddress(accounts[0])
          toast('Account changed', { icon: 'ℹ️' })
        }
      })

      // Listen for network changes
      window.ethereum.on?.('chainChanged', (chainId: string) => {
        console.log('🌐 Network changed:', chainId)
        const newChainId = parseInt(chainId, 16)
        const isBaseTestnet = newChainId === 84532
        setCurrentNetwork({
          name: isBaseTestnet ? 'Base Sepolia Testnet' : 'Unknown Network',
          chainId: newChainId
        })
        
        if (!isBaseTestnet) {
          toast.error('Please switch back to Base Testnet', { duration: 5000 })
        } else {
          toast.success('Connected to Base Testnet', { icon: '🎉' })
        }
      })
      
    } catch (error: any) {
      console.error('💥 Error connecting to MetaMask:', error)
      
      if (error.code === 4001) {
        toast.error('User rejected the connection request.')
      } else if (error.code === -32002) {
        toast.error('MetaMask connection request is already pending.')
      } else if (error.code === -32603) {
        toast.error('Internal MetaMask error. Please try again.')
      } else {
        toast.error(`Failed to connect MetaMask wallet: ${error.message}`)
      }
    }
  }

  const onSignUpSubmit = async (data: SignUpFormData) => {
    if (!isWalletConnected) {
      toast.error('Please connect your MetaMask wallet first')
      return
    }

    setIsLoading(true)
    try {
      const signUpData = {
        email: data.email,
        password: data.password,
        githubUsername: data.githubUsername,
        walletAddress: walletAddress,
      }

      console.log('Sign up data:', signUpData)
      const result = await register(signUpData)
      
      if (result.success) {
        setShowSignUpModal(false)
        navigate('/dashboard')
      }
    } catch (error: any) {
      console.error('Sign up error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      console.log('Login data:', data)
      const result = await login(data.email, data.password)
      
      if (result.success) {
        setShowSignInModal(false)
        navigate('/dashboard')
      }
    } catch (error: any) {
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const closeModals = () => {
    setShowSignUpModal(false)
    setShowSignInModal(false)
    setWalletAddress('')
    setIsWalletConnected(false)
    setWalletBalance('')
    setCurrentNetwork(null)
    signUpForm.reset()
    loginForm.reset()
  }

  const AuthModal: React.FC<{ isSignUp: boolean }> = ({ isSignUp }) => (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModals} />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {isSignUp ? 'Join as Project Host' : 'Welcome Back'}
              </h3>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white px-6 py-6">
            {isSignUp ? (
              <form onSubmit={signUpForm.handleSubmit(onSignUpSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      {...signUpForm.register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      type="email"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                  {signUpForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-600">{signUpForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      {...signUpForm.register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters'
                        }
                      })}
                      type={showPassword ? 'text' : 'password'}
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  {signUpForm.formState.errors.password && (
                    <p className="mt-1 text-sm text-red-600">{signUpForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      {...signUpForm.register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: value => value === password || 'Passwords do not match'
                      })}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  {signUpForm.formState.errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{signUpForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GitHub Username</label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      {...signUpForm.register('githubUsername', {
                        required: 'GitHub username is required'
                      })}
                      type="text"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your GitHub username"
                    />
                  </div>
                  {signUpForm.formState.errors.githubUsername && (
                    <p className="mt-1 text-sm text-red-600">{signUpForm.formState.errors.githubUsername.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Connect MetaMask Wallet</label>
                  {isWalletConnected ? (
                    <div className="w-full p-4 rounded-lg border border-green-200 bg-green-50">
                      <div className="flex items-center gap-2 text-green-700 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium">
                          Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                        </span>
                      </div>
                      {currentNetwork && (
                        <div className="flex items-center justify-between text-sm text-green-600 mb-1">
                          <span>Network: {currentNetwork.name}</span>
                          <span>Chain ID: {currentNetwork.chainId}</span>
                        </div>
                      )}
                      {walletBalance && (
                        <div className="text-sm text-green-600">
                          Balance: {parseFloat(walletBalance).toFixed(4)} ETH
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={connectMetaMask}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Wallet className="h-5 w-5" />
                      Connect MetaMask Wallet
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !isWalletConnected}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isLoading ? 'Creating Account...' : 'Create Project Host Account'}
                </button>
              </form>
            ) : (
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      {...loginForm.register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      type="email"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      {...loginForm.register('password', {
                        required: 'Password is required'
                      })}
                      type={showPassword ? 'text' : 'password'}
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  {loginForm.formState.errors.password && (
                    <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isSignUp ? "Already have an account? " : "Don't have an account? "}
                <button
                  onClick={() => {
                    if (isSignUp) {
                      setShowSignUpModal(false)
                      setShowSignInModal(true)
                    } else {
                      setShowSignInModal(false)
                      setShowSignUpModal(true)
                    }
                  }}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Code2 className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">GigBased</span>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#features" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">Features</a>
                <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">How it Works</a>
                <a href="#testimonials" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">Testimonials</a>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Debug MetaMask Button */}
              <button
                onClick={connectMetaMask}
                className="text-xs bg-yellow-500 text-white px-2 py-1 rounded text-sm font-medium hover:bg-yellow-600 transition-colors"
              >
                🔧 Connect Base Testnet
              </button>
              {isWalletConnected && (
                <div className="text-xs text-green-600 font-medium">
                  ✅ {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </div>
              )}
              <button
                onClick={() => setShowSignInModal(true)}
                className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => setShowSignUpModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 sm:pt-24 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              The Future of
              <span className="text-blue-600 block">Freelance Work</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600 leading-relaxed">
              Connect with top developers worldwide through blockchain-powered project management. 
              Secure payments, transparent milestones, and AI-driven matching.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowSignUpModal(true)}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                Start Your Project
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button
                onClick={() => setShowSignUpModal(true)}
                className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose GigBased?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built for the modern freelance economy with cutting-edge technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Secure Payments</h3>
              <p className="text-gray-600">
                Blockchain-secured escrow system ensures safe transactions. Payments are released automatically upon milestone completion.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered Matching</h3>
              <p className="text-gray-600">
                Our intelligent system matches projects with the perfect developers based on skills, experience, and availability.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Layers className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Milestone Management</h3>
              <p className="text-gray-600">
                Break down projects into clear milestones with automated timeline generation and progress tracking.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-6">
                <Globe className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Global Talent Pool</h3>
              <p className="text-gray-600">
                Access developers from around the world. Work with the best talent regardless of geographical boundaries.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Fast Deployment</h3>
              <p className="text-gray-600">
                Get your projects started quickly with our streamlined onboarding and instant developer matching.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                <Award className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Quality Assurance</h3>
              <p className="text-gray-600">
                Built-in code review processes and quality checkpoints ensure deliverables meet your standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple steps to get your project from idea to completion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Post Your Project</h3>
              <p className="text-gray-600">
                Describe your project requirements, set your budget, and let our AI generate a detailed timeline with milestones.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Get Matched</h3>
              <p className="text-gray-600">
                Our AI matches you with qualified developers. Review proposals, check portfolios, and choose the perfect fit.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Track Progress</h3>
              <p className="text-gray-600">
                Monitor milestones, approve deliverables, and make secure payments as your project progresses to completion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">10K+</div>
              <div className="text-blue-100">Projects Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">5K+</div>
              <div className="text-blue-100">Active Developers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">98%</div>
              <div className="text-blue-100">Success Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">$2M+</div>
              <div className="text-blue-100">Paid to Developers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied clients and developers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                "GigBased made it incredibly easy to find the right developer for our mobile app. The milestone system kept everything on track."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">SJ</span>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">Sarah Johnson</div>
                  <div className="text-sm text-gray-500">Startup Founder</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                "As a developer, I love the transparent payment system and clear project requirements. It's a game-changer for freelancers."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">MC</span>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">Mike Chen</div>
                  <div className="text-sm text-gray-500">Full-Stack Developer</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                "The AI matching is spot-on. We found our perfect blockchain developer within hours of posting our project."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">AB</span>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">Alex Brown</div>
                  <div className="text-sm text-gray-500">Tech Director</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ready to Start Your Next Project?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of successful projects on GigBased today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowSignUpModal(true)}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Get Started Now
              <ChevronRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Code2 className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold">GigBased</span>
              </div>
              <p className="text-gray-400">
                The future of freelance work, powered by blockchain technology.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">For Clients</a></li>
                <li><a href="#" className="hover:text-white">For Developers</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 GigBased. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showSignUpModal && <AuthModal isSignUp={true} />}
      {showSignInModal && <AuthModal isSignUp={false} />}
    </div>
  )
}

export default LandingPage