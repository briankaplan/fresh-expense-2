import { AuthResponse, User } from "@fresh-expense/types";
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
declare const authService: {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  register(data: RegisterData): Promise<AuthResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User>;
  refreshToken(): Promise<{
    token: string;
    refreshToken: string;
  }>;
  updatePassword(currentPassword: string, newPassword: string): Promise<void>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
};
export default authService;
//# sourceMappingURL=auth.service.d.ts.map
