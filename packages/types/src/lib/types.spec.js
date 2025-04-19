Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
(0, vitest_1.describe)("Type Definitions", () => {
  (0, vitest_1.it)("should validate User type", () => {
    const user = {
      id: "1",
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
      role: "user",
      settings: {
        currency: "USD",
        language: "en",
        theme: "light",
        notifications: {
          email: true,
          push: true,
        },
      },
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    };
    (0, vitest_1.expect)(user).toBeDefined();
  });
  (0, vitest_1.it)("should validate Transaction type", () => {
    const transaction = {
      id: "1",
      date: new Date("2024-01-01"),
      description: "Test transaction",
      amount: 100.0,
      category: "Food",
      merchant: "Test Merchant",
      company: "Test Company",
      status: "completed",
      type: "expense",
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    };
    (0, vitest_1.expect)(transaction).toBeDefined();
  });
  (0, vitest_1.it)("should validate Receipt type", () => {
    const receipt = {
      id: "1",
      userId: "1",
      merchant: "Test Merchant",
      amount: 100.0,
      date: new Date("2024-01-01"),
      status: "processed",
      r2Key: "test-key",
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    };
    (0, vitest_1.expect)(receipt).toBeDefined();
  });
  (0, vitest_1.it)("should validate ApiResponse type", () => {
    const response = {
      data: {
        id: "1",
        date: new Date("2024-01-01"),
        description: "Test transaction",
        amount: 100.0,
        category: "Food",
        merchant: "Test Merchant",
        company: "Test Company",
        status: "completed",
        type: "expense",
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-01T00:00:00Z"),
      },
    };
    (0, vitest_1.expect)(response).toBeDefined();
  });
  (0, vitest_1.it)("should validate PaginatedResponse type", () => {
    const response = {
      data: [
        {
          id: "1",
          date: new Date("2024-01-01"),
          description: "Test transaction",
          amount: 100.0,
          category: "Food",
          merchant: "Test Merchant",
          company: "Test Company",
          status: "completed",
          type: "expense",
          createdAt: new Date("2024-01-01T00:00:00Z"),
          updatedAt: new Date("2024-01-01T00:00:00Z"),
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
      hasMore: false,
    };
    (0, vitest_1.expect)(response).toBeDefined();
  });
});
//# sourceMappingURL=types.spec.js.map
