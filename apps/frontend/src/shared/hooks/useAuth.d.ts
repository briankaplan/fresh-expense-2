import type { User } from "@fresh-expense/types";
interface LoginCredentials {
  email: string;
  password: string;
}
interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
}
export declare const useAuth: () => {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  checkAuth: () => Promise<boolean>;
  isAuthenticated: boolean;
};
export default useAuth;
//# sourceMappingURL=useAuth.d.ts.map
