import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

interface UIState {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: user => set({ user, isAuthenticated: !!user }),
      setToken: token => set({ token }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const useUIStore = create<UIState>(set => ({
  isLoading: false,
  setIsLoading: loading => set({ isLoading: loading }),
  theme: 'dark',
  toggleTheme: () => set(state => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));
