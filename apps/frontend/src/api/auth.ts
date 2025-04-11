import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const login = async (credentials: LoginCredentials) => {
  const response = await axios.post(`${API_URL}/auth/login`, credentials);
  return response.data;
};

export const register = async (data: RegisterData) => {
  const response = await axios.post(`${API_URL}/auth/register`, data);
  return response.data;
};

export const verifyEmail = async (token: string) => {
  const response = await axios.get(`${API_URL}/auth/verify-email/${token}`);
  return response.data;
};

export const forgotPassword = async (email: string) => {
  const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
  return response.data;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const response = await axios.post(`${API_URL}/auth/reset-password/${token}`, {
    newPassword,
  });
  return response.data;
};

export const changePassword = async (data: ChangePasswordData) => {
  const response = await axios.put(`${API_URL}/auth/change-password`, data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.data;
};

export const refreshToken = async (refreshToken: string) => {
  const response = await axios.post(`${API_URL}/auth/refresh-token`, {
    refreshToken,
  });
  return response.data;
}; 