import { type ApiError, AuthResponse, User } from "@fresh-expense/types";
import api from "./api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
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
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/auth/login", credentials);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || "Login failed");
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/auth/register", data);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || "Registration failed");
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<User>("/auth/me");
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || "Failed to get current user");
    }
  },

  async refreshToken(): Promise<{ token: string; refreshToken: string }> {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token found");
      }

      const response = await api.post<{ token: string; refreshToken: string }>("/auth/refresh", {
        refreshToken,
      });
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || "Failed to refresh token");
    }
  },

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.patch("/auth/password", {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || "Failed to update password");
    }
  },

  async forgotPassword(email: string): Promise<void> {
    try {
      await api.post("/auth/forgot-password", { email });
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || "Failed to send password reset email");
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await api.post("/auth/reset-password", { token, newPassword });
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || "Failed to reset password");
    }
  },
};

export default authService;
