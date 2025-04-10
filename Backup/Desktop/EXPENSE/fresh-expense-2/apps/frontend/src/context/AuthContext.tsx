import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState({
    user: null as User | null,
    token: localStorage.getItem('token'),
    loading: true,
  });

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const userData = await authService.getCurrentUser();
          setState(prev => ({
            ...prev,
            user: userData,
            loading: false,
          }));
        } catch (error) {
          console.error('Error fetching user:', error);
          handleLogout();
        }
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    initAuth();
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setState({
      user: null,
      token: null,
      loading: false,
    });
    navigate('/login');
  }, [navigate]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      localStorage.setItem('token', response.token);
      setState(prev => ({
        ...prev,
        user: response.user,
        token: response.token,
        loading: false,
      }));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data);
      localStorage.setItem('token', response.token);
      setState(prev => ({
        ...prev,
        user: response.user,
        token: response.token,
        loading: false,
      }));
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await authService.forgotPassword(email);
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };

  const value = {
    user: state.user,
    token: state.token,
    isAuthenticated: !!state.user,
    login,
    register,
    forgotPassword,
    logout: handleLogout,
    loading: state.loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;