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
export declare const login: (credentials: LoginCredentials) => Promise<any>;
export declare const register: (data: RegisterData) => Promise<any>;
export declare const verifyEmail: (token: string) => Promise<any>;
export declare const forgotPassword: (email: string) => Promise<any>;
export declare const resetPassword: (token: string, newPassword: string) => Promise<any>;
export declare const changePassword: (data: ChangePasswordData) => Promise<any>;
export declare const refreshToken: (refreshToken: string) => Promise<any>;
//# sourceMappingURL=auth.d.ts.map
