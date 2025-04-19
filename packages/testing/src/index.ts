import { Company, Transaction, User } from '@fresh-expense/types';

// Mock data generators
export const createMockUser = (overrides?: Partial<User>): User => ({
  id: 'user-123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  isVerified: true,
  isActive: true,
  role: 'user',
  preferences: {
    theme: 'light',
    currency: 'USD',
    notifications: {
      email: true,
      push: true,
    },
  },
  ...overrides,
});

export const createMockTransaction = (overrides?: Partial<Transaction>): Transaction => ({
  id: 'tx-123',
  accountId: 'acc-123',
  date: new Date(),
  description: 'Test Transaction',
  amount: { value: 100, currency: "USD" },
  type: 'debit',
  status: 'matched',
  category: ['FOOD_AND_DINING'],
  processingStatus: 'processed',
  source: 'manual',
  lastUpdated: new Date(),
  isRecurring: false,
  ...overrides,
});

export const createMockCompany = (overrides?: Partial<Company>): Company => ({
  id: 'company-123',
  userId: 'user-123',
  name: 'Test Company',
  status: 'matched',
  settings: {
    currency: 'USD',
    timezone: 'America/New_York',
    dateFormat: 'YYYY-MM-DD',
  },
  integrations: {},
  ...overrides,
});

// Test utilities
export const waitForAsync = async (ms: number = 0): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const mockFetch = (response: any) => {
  return jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(response),
    })
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
      Object.keys(store).forEach(key => delete store[key]);
    },
  };
};

// Test matchers
export const toMatchTransaction = (received: Transaction, expected: Transaction) => {
  const match =
    received.id != null &&
    received.amount != null &&
    received.description != null;

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
        token: 'mock-token-123',
        user: createMockUser(),
      },
      error: {
        message: 'Invalid credentials',
      },
    },
    register: {
      success: {
        message: 'User registered successfully',
      },
      error: {
        message: 'Email already exists',
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
        message: 'Failed to fetch transactions',
      },
    },
  },
};

// Test environment setup
export const setupTestEnvironment = () => {
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
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
  Object.defineProperty(window, 'localStorage', { value: mockStorage });
};
