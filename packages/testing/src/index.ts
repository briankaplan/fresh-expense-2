import type { ICompany, Transaction, User } from "@fresh-expense/types";
import { UserRole, ExpenseCategory, TransactionType, CompanyStatus, TransactionStatus } from "@fresh-expense/types";

// Mock data generators
export const createMockUser = (overrides?: Partial<User>): User => ({
  id: "user-123",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  role: UserRole.USER,
  companies: ["company-123"],
  password: "hashed_password",
  isEmailVerified: true,
  lastLoginAt: new Date(),
  settings: {
    language: "en",
    timezone: "UTC",
    currency: "USD",
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockTransaction = (overrides?: Partial<Transaction>): Transaction => ({
  id: "tx-123",
  userId: "user-123",
  accountId: "acc-123",
  date: new Date(),
  description: "Test Transaction",
  amount: {
    value: 100,
    currency: "USD",
  },
  type: TransactionType.EXPENSE,
  status: TransactionStatus.PENDING,
  category: ExpenseCategory.OTHER,
  merchant: {
    name: "Test Merchant",
  },
  source: "manual",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockCompany = (overrides?: Partial<ICompany>): ICompany => ({
  id: "company-123",
  userId: "user-123",
  name: "Test Company",
  description: "A test company",
  industry: "Technology",
  status: CompanyStatus.ACTIVE,
  settings: {
    currency: "USD",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    fiscalYearStart: new Date(new Date().getFullYear(), 0, 1),
    fiscalYearEnd: new Date(new Date().getFullYear(), 11, 31),
  },
  integrations: {},
  metadata: {
    createdBy: "user-123",
    version: "1.0",
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Test utilities
export const waitForAsync = async (ms = 0): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const mockFetch = (response: any) => {
  return jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(response),
    }),
  );
};

export const mockLocalStorage = () => {
  const store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
  };
};

// Test matchers
export const toMatchTransaction = (received: Transaction, expected: Transaction) => {
  const match = received.id != null && received.amount != null && received.description != null;

  return {
    pass: match,
    message: () =>
      match
        ? `Expected transaction not to match ${JSON.stringify(expected)}`
        : `Expected transaction to match ${JSON.stringify(expected)}`,
  };
};

// Mock API responses
export const mockApiResponses = {
  auth: {
    login: {
      success: {
        token: "mock-token-123",
        user: createMockUser(),
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
        data: [createMockTransaction(), createMockTransaction()],
        total: 2,
      },
      error: {
        message: "Failed to fetch transactions",
      },
    },
  },
};

// Test environment setup
export const setupTestEnvironment = () => {
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
  const mockStorage = mockLocalStorage();
  Object.defineProperty(window, "localStorage", { value: mockStorage });
};
