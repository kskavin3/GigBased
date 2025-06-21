import { useState, useEffect, useCallback } from 'react';
import { clientsAPI } from '../services/api';
import toast from 'react-hot-toast';

interface Client {
  _id: string;
  email: string;
  githubUsername: string;
  walletAddress: string;
  userType: string;
  profile: {
    firstName?: string;
    lastName?: string;
    company?: string;
    bio?: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  isAuthenticated: boolean;
  client: Client | null;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    client: null,
    isLoading: true,
  });

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Try to get profile using cookie/session authentication
      const response = await clientsAPI.getProfile();
      
      if (response.data?.client) {
        setAuthState({
          isAuthenticated: true,
          client: response.data.client,
          isLoading: false,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          client: null,
          isLoading: false,
        });
      }
    } catch (error) {
      console.log('Not authenticated or session expired');
      setAuthState({
        isAuthenticated: false,
        client: null,
        isLoading: false,
      });
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await clientsAPI.login({ email, password });
      
      if (response.data?.client) {
        setAuthState({
          isAuthenticated: true,
          client: response.data.client,
          isLoading: false,
        });
        
        toast.success('Logged in successfully!');
        return { success: true, client: response.data.client };
      }
      
      throw new Error('Login failed');
    } catch (error: any) {
      setAuthState({
        isAuthenticated: false,
        client: null,
        isLoading: false,
      });
      
      const errorMessage = error?.message || 'Login failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const register = useCallback(async (data: {
    email: string;
    password: string;
    githubUsername: string;
    walletAddress: string;
  }) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await clientsAPI.register(data);
      
      if (response.data?.client) {
        setAuthState({
          isAuthenticated: true,
          client: response.data.client,
          isLoading: false,
        });
        
        toast.success('Account created successfully!');
        return { success: true, client: response.data.client };
      }
      
      throw new Error('Registration failed');
    } catch (error: any) {
      setAuthState({
        isAuthenticated: false,
        client: null,
        isLoading: false,
      });
      
      const errorMessage = error?.message || error?.errors?.[0] || 'Registration failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await clientsAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state regardless of API call success
      setAuthState({
        isAuthenticated: false,
        client: null,
        isLoading: false,
      });
      
      toast.success('Logged out successfully');
    }
  }, []);

  const updateProfile = useCallback(async (profileData: any) => {
    try {
      const response = await clientsAPI.updateProfile(profileData);
      
      if (response.data?.client) {
        setAuthState(prev => ({
          ...prev,
          client: response.data.client,
        }));
        
        toast.success('Profile updated successfully');
        return { success: true, client: response.data.client };
      }
      
      throw new Error('Profile update failed');
    } catch (error: any) {
      const errorMessage = error?.message || 'Profile update failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const refreshAuth = useCallback(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    refreshAuth,
  };
}; 