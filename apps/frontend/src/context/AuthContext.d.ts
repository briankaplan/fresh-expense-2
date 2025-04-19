import type React from "react";
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  companyId?: string;
}
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    userData: Partial<User> & {
      password: string;
    },
  ) => Promise<void>;
}
declare const AuthContext: React.Context<AuthContextType | undefined>;
export declare const AuthProvider: React.FC<{
  children: React.ReactNode;
}>;
export declare const useAuth: () => AuthContextType;
export default AuthContext;
//# sourceMappingURL=AuthContext.d.ts.map
