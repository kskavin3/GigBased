import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, Github, Wallet, Users, Briefcase } from 'lucide-react'
import detectEthereumProvider from '@metamask/detect-provider'

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

const SignUp: React.FC = () => {
  const navigate = useNavigate()
  const [isLoginMode, setIsLoginMode] = useState(false)
  const [isDeveloperMode, setIsDeveloperMode] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [isWalletConnected, setIsWalletConnected] = useState(false)

  const signUpForm = useForm<SignUpFormData>()
  const loginForm = useForm<LoginFormData>()

  const password = signUpForm.watch('password')

  const connectMetaMask = async () => {
    try {
      const provider = await detectEthereumProvider()
      
      if (!provider) {
        toast.error('MetaMask is not installed. Please install MetaMask first.')
        return
      }

      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      })

      if (accounts.length > 0) {
        const address = accounts[0]
        setWalletAddress(address)
        setIsWalletConnected(true)
        toast.success(`Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`)
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error)
      toast.error('Failed to connect MetaMask wallet')
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
        authMethod: 'email',
        userType: isDeveloperMode ? 'developer' : 'project_host'
      }

      console.log('Sign up data:', signUpData)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success(`${isDeveloperMode ? 'Developer' : 'Project Host'} account created successfully!`)
      navigate('/dashboard')
    } catch (error) {
      toast.error('Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const loginData = {
        email: data.email,
        password: data.password,
        userType: isDeveloperMode ? 'developer' : 'project_host'
      }

      console.log('Login data:', loginData)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success(`Logged in successfully as ${isDeveloperMode ? 'Developer' : 'Project Host'}!`)
      navigate('/dashboard')
    } catch (error) {
      toast.error('Failed to login')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode)
    setWalletAddress('')
    setIsWalletConnected(false)
    signUpForm.reset()
    loginForm.reset()
  }

  const toggleUserType = () => {
    setIsDeveloperMode(!isDeveloperMode)
    setWalletAddress('')
    setIsWalletConnected(false)
    signUpForm.reset()
    loginForm.reset()
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Mode Toggle Button */}
      <div className="absolute top-4 right-4">
        <div className="bg-white rounded-lg shadow-lg border border-secondary-200 p-3">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium transition-colors ${!isDeveloperMode ? 'text-primary-600' : 'text-secondary-400'}`}>
              Project Host
            </span>
            <button
              onClick={toggleUserType}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                isDeveloperMode ? 'bg-primary-600' : 'bg-secondary-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  isDeveloperMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-xs font-medium transition-colors ${isDeveloperMode ? 'text-primary-600' : 'text-secondary-400'}`}>
              Developer
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            {isLoginMode ? 'Welcome Back' : `Join GigBased as ${isDeveloperMode ? 'Developer' : 'Project Host'}`}
          </h1>
          <p className="text-secondary-600">
            {isLoginMode 
              ? `Sign in to your ${isDeveloperMode ? 'developer' : 'project host'} account`
              : isDeveloperMode 
                ? 'Create your developer account to apply for projects'
                : 'Create your account to start hosting projects on the blockchain'
            }
          </p>
        </div>

        <div className="card">
          {isLoginMode ? (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
              <div>
                <label htmlFor="loginEmail" className="block text-sm font-medium text-secondary-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-5 w-5" />
                  <input
                    {...loginForm.register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    className="input-field pl-10"
                    placeholder="Enter your email"
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="loginPassword" className="block text-sm font-medium text-secondary-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-5 w-5" />
                  <input
                    {...loginForm.register('password', {
                      required: 'Password is required'
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pl-10 pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
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
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={signUpForm.handleSubmit(onSignUpSubmit)} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-5 w-5" />
                  <input
                    {...signUpForm.register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    className="input-field pl-10"
                    placeholder="Enter your email"
                  />
                </div>
                {signUpForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">{signUpForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-5 w-5" />
                  <input
                    {...signUpForm.register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pl-10 pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {signUpForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">{signUpForm.formState.errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-5 w-5" />
                  <input
                    {...signUpForm.register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: value => value === password || 'Passwords do not match'
                    })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="input-field pl-10 pr-10"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {signUpForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{signUpForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="githubUsername" className="block text-sm font-medium text-secondary-700 mb-2">
                  GitHub Username
                </label>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-5 w-5" />
                  <input
                    {...signUpForm.register('githubUsername', {
                      required: 'GitHub username is required'
                    })}
                    type="text"
                    className="input-field pl-10"
                    placeholder="Enter your GitHub username"
                  />
                </div>
                {signUpForm.formState.errors.githubUsername && (
                  <p className="mt-1 text-sm text-red-600">{signUpForm.formState.errors.githubUsername.message}</p>
                )}
              </div>

              {/* MetaMask Wallet Connection - Only for Project Hosts */}
              {!isDeveloperMode && (
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Connect MetaMask Wallet
                  </label>
                  <button
                    type="button"
                    onClick={connectMetaMask}
                    disabled={isWalletConnected}
                    className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border transition-colors duration-200 ${
                      isWalletConnected
                        ? 'bg-green-50 border-green-200 text-green-700 cursor-not-allowed'
                        : 'bg-secondary-50 border-secondary-300 text-secondary-700 hover:bg-secondary-100'
                    }`}
                  >
                    <Wallet className="h-5 w-5" />
                    {isWalletConnected 
                      ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                      : 'Connect MetaMask Wallet'
                    }
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || (!isDeveloperMode && !isWalletConnected)}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Account...' : `Create ${isDeveloperMode ? 'Developer' : 'Project Host'} Account`}
              </button>
            </form>
          )}
        </div>

        <div className="text-center">
          <p className="text-sm text-secondary-600">
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={toggleMode}
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              {isLoginMode ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignUp 