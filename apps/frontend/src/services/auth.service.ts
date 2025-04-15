import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  token: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const responseData = await response.json();
      localStorage.setItem('token', responseData.token);
      return responseData;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  async logout() {
    localStorage.removeItem('token');
  },

  async getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get current user');
      }

      return await response.json();
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  async refreshToken(refreshToken: string) {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  async updatePassword(currentPassword: string, newPassword: string) {
    const response = await api.patch('/auth/password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },
};

export default authService;
