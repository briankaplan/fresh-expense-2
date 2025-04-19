const __importDefault =
  (this && this.__importDefault) || ((mod) => (mod?.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
exports.useExpenseStore = exports.useUIStore = exports.useAuthStore = void 0;
const zustand_1 = require("zustand");
const middleware_1 = require("zustand/middleware");
exports.useAuthStore = (0, zustand_1.create)()(
  (0, middleware_1.persist)(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      logout: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-storage",
    },
  ),
);
exports.useUIStore = (0, zustand_1.create)((set) => ({
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  theme: "dark",
  toggleTheme: () => set((state) => ({ theme: state.theme != null ? "dark" : "light" })),
}));
const expense_store_1 = require("./expense.store");
Object.defineProperty(exports, "useExpenseStore", {
  enumerable: true,
  get: () => __importDefault(expense_store_1).default,
});
//# sourceMappingURL=index.js.map
