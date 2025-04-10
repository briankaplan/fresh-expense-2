import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { apiClient } from '../services/api';
import { AuthResponse, User } from '../types/api.types';
import { useUIStore } from '../store';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  checkAuth: () => Promise<boolean>;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const setIsLoading = useUIStore((state) => state.setIsLoading);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      
      localStorage.setItem(
        import.meta.env.VITE_JWT_STORAGE_KEY,
        response.data.token
      );
      localStorage.setItem(
        import.meta.env.VITE_REFRESH_TOKEN_KEY,
        response.data.refreshToken
      );
      
      setUser(response.data.user);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [navigate, setIsLoading]);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      
      localStorage.setItem(
        import.meta.env.VITE_JWT_STORAGE_KEY,
        response.data.token
      );
      localStorage.setItem(
        import.meta.env.VITE_REFRESH_TOKEN_KEY,
        response.data.refreshToken
      );
      
      setUser(response.data.user);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [navigate, setIsLoading]);

  const logout = useCallback(() => {
    localStorage.removeItem(import.meta.env.VITE_JWT_STORAGE_KEY);
    localStorage.removeItem(import.meta.env.VITE_REFRESH_TOKEN_KEY);
    setUser(null);
    navigate('/login');
    toast.success('You have been logged out');
  }, [navigate]);

  const forgotPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email });
      toast.success('Password reset instructions have been sent to your email');
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  }, [navigate, setIsLoading]);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/reset-password', { token, newPassword });
      toast.success('Password has been reset successfully');
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  }, [navigate, setIsLoading]);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem(import.meta.env.VITE_JWT_STORAGE_KEY);
    if (!token) {
      return false;
    }

    try {
      const response = await apiClient.get<{ user: User }>('/auth/me');
      setUser(response.data.user);
      return true;
    } catch {
      logout();
      return false;
    }
  }, [logout]);

  return {
    user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    checkAuth,
    isAuthenticated: !!user,
  };
};

export default useAuth; 