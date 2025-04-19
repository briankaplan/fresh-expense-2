Object.defineProperty(exports, "__esModule", { value: true });
exports.setupTestEnvironment =
  exports.mockApiResponses =
  exports.toMatchTransaction =
  exports.mockLocalStorage =
  exports.mockFetch =
  exports.waitForAsync =
  exports.createMockCompany =
  exports.createMockTransaction =
  exports.createMockUser =
    void 0;
// Mock data generators
const createMockUser = (overrides) => ({
  id: "user-123",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  isVerified: true,
  isActive: true,
  role: "user",
  preferences: {
    theme: "light",
    currency: "USD",
    notifications: {
      email: true,
      push: true,
    },
  },
  ...overrides,
});
exports.createMockUser = createMockUser;
const createMockTransaction = (overrides) => ({
  id: "tx-123",
  accountId: "acc-123",
  date: new Date(),
  description: "Test Transaction",
  amount: { value: 100, currency: "USD" },
  type: "debit",
  status: "matched",
  category: ["FOOD_AND_DINING"],
  processingStatus: "processed",
  source: "manual",
  lastUpdated: new Date(),
  isRecurring: false,
  ...overrides,
});
exports.createMockTransaction = createMockTransaction;
const createMockCompany = (overrides) => ({
  id: "company-123",
  userId: "user-123",
  name: "Test Company",
  status: "matched",
  settings: {
    currency: "USD",
    timezone: "America/New_York",
    dateFormat: "YYYY-MM-DD",
  },
  integrations: {},
  ...overrides,
});
exports.createMockCompany = createMockCompany;
// Test utilities
const waitForAsync = async (ms = 0) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
exports.waitForAsync = waitForAsync;
const mockFetch = (response) => {
  return jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(response),
    }),
  );
};
exports.mockFetch = mockFetch;
const mockLocalStorage = () => {
  const store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
  };
};
exports.mockLocalStorage = mockLocalStorage;
// Test matchers
const toMatchTransaction = (received, expected) => {
  const match = received.id != null && received.amount != null && received.description != null;
  return {
    pass: match,
    message: () =>
      match
        ? `Expected transaction not to match ${JSON.stringify(expected)}`
        : `Expected transaction to match ${JSON.stringify(expected)}`,
  };
};
exports.toMatchTransaction = toMatchTransaction;
// Mock API responses
exports.mockApiResponses = {
  auth: {
    login: {
      success: {
        token: "mock-token-123",
        user: (0, exports.createMockUser)(),
      },
      error: {
        message: "Invalid credentials",
      },
    },
    register: {
      success: {
        message: "User registered successfully",
      },
      error: {
        message: "Email already exists",
      },
    },
  },
  transactions: {
    list: {
      success: {
        data: [(0, exports.createMockTransaction)(), (0, exports.createMockTransaction)()],
        total: 2,
      },
      error: {
        message: "Failed to fetch transactions",
      },
    },
  },
};
// Test environment setup
const setupTestEnvironment = () => {
  // Mock window.matchMedia
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
  // Mock IntersectionObserver
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
  // Mock localStorage
  const mockStorage = (0, exports.mockLocalStorage)();
  Object.defineProperty(window, "localStorage", { value: mockStorage });
};
exports.setupTestEnvironment = setupTestEnvironment;
//# sourceMappingURL=index.js.map
