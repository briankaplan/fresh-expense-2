import type { User } from "@fresh-expense/types";
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  logout: () => void;
}
interface UIState {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
}
export declare const useAuthStore: import("zustand").UseBoundStore<
  Omit<import("zustand").StoreApi<AuthState>, "persist"> & {
    persist: {
      setOptions: (
        options: Partial<import("zustand/middleware").PersistOptions<AuthState, AuthState>>,
      ) => void;
      clearStorage: () => void;
      rehydrate: () => Promise<void> | void;
      hasHydrated: () => boolean;
      onHydrate: (fn: (state: AuthState) => void) => () => void;
      onFinishHydration: (fn: (state: AuthState) => void) => () => void;
      getOptions: () => Partial<import("zustand/middleware").PersistOptions<AuthState, AuthState>>;
    };
  }
>;
export declare const useUIStore: import("zustand").UseBoundStore<
  import("zustand").StoreApi<UIState>
>;
export { default as useExpenseStore } from "./expense.store";
//# sourceMappingURL=index.d.ts.map
