Object.defineProperty(exports, "__esModule", { value: true });
const user_schema_1 = require("../user.schema");
const transaction_schema_1 = require("../transaction.schema");
const expense_schema_1 = require("../expense.schema");
const receipt_schema_1 = require("../receipt.schema");
const report_schema_1 = require("../report.schema");
describe("Schema Validation", () => {
  describe("User Schema", () => {
    it("should validate a complete user document", () => {
      const user = {
        email: "test@example.com",
        role: "user",
        firstName: "Test",
        lastName: "User",
        companyId: "company123",
        preferences: {
          notifications: true,
          theme: "light",
        },
      };
      expect(() => user_schema_1.UserDocument.validate(user)).not.toThrow();
    });
    it("should require email and role", () => {
      const user = {
        firstName: "Test",
        lastName: "User",
      };
      expect(() => user_schema_1.UserDocument.validate(user)).toThrow();
    });
  });
  describe("Transaction Schema", () => {
    it("should validate a complete transaction document", () => {
      const transaction = {
        amount: { value: 100.5, currency: "USD" },
        date: new Date(),
        type: "expense",
        status: "pending",
        merchant: {
          name: "Test Merchant",
          id: "merchant123",
        },
        accountId: "account123",
      };
      expect(() => transaction_schema_1.TransactionDocument.validate(transaction)).not.toThrow();
    });
    it("should require amount, date, and type", () => {
      const transaction = {
        merchant: {
          name: "Test Merchant",
        },
      };
      expect(() => transaction_schema_1.TransactionDocument.validate(transaction)).toThrow();
    });
  });
  describe("Expense Schema", () => {
    it("should validate a complete expense document", () => {
      const expense = {
        amount: { value: 100.5, currency: "USD" },
        date: new Date(),
        category: "food",
        merchant: {
          name: "Test Merchant",
          id: "merchant123",
        },
        userId: "user123",
      };
      expect(() => expense_schema_1.ExpenseDocument.validate(expense)).not.toThrow();
    });
    it("should require amount, date, and userId", () => {
      const expense = {
        category: "food",
      };
      expect(() => expense_schema_1.ExpenseDocument.validate(expense)).toThrow();
    });
  });
  describe("Receipt Schema", () => {
    it("should validate a complete receipt document", () => {
      const receipt = {
        fileUrl: "https://example.com/receipt.jpg",
        userId: "user123",
        merchant: {
          name: "Test Merchant",
          id: "merchant123",
        },
        amount: { value: 100.5, currency: "USD" },
        date: new Date(),
      };
      expect(() => receipt_schema_1.ReceiptDocument.validate(receipt)).not.toThrow();
    });
    it("should require fileUrl and userId", () => {
      const receipt = {
        merchant: {
          name: "Test Merchant",
        },
      };
      expect(() => receipt_schema_1.ReceiptDocument.validate(receipt)).toThrow();
    });
  });
  describe("Merchant Schema", () => {
    it("should validate a complete merchant document", () => {
      const merchant = {
        name: "Test Merchant",
        type: "retail",
        status: "matched",
        locations: [
          {
            address: "123 Test St",
            city: "Test City",
            state: "TS",
            country: "US",
            postalCode: "12345",
          },
        ],
      };
      expect(() => merchant_schema_1.MerchantDocument.validate(merchant)).not.toThrow();
    });
    it("should require name and type", () => {
      const merchant = {
        status: "matched",
      };
      expect(() => merchant_schema_1.MerchantDocument.validate(merchant)).toThrow();
    });
  });
  describe("Subscription Schema", () => {
    it("should validate a complete subscription document", () => {
      const subscription = {
        name: "Test Subscription",
        amount: { value: 9.99, currency: "USD" },
        billingCycle: "monthly",
        startDate: new Date(),
        status: "matched",
        userId: "user123",
        merchantId: "merchant123",
      };
      expect(() => subscription_schema_1.SubscriptionDocument.validate(subscription)).not.toThrow();
    });
    it("should require name, amount, and billingCycle", () => {
      const subscription = {
        status: "matched",
      };
      expect(() => subscription_schema_1.SubscriptionDocument.validate(subscription)).toThrow();
    });
  });
  describe("Report Schema", () => {
    it("should validate a complete report document", () => {
      const report = {
        userId: "user123",
        type: "expense",
        format: "pdf",
        status: "pending",
        filters: {
          startDate: new Date(),
          endDate: new Date(),
        },
      };
      expect(() => report_schema_1.ReportDocument.validate(report)).not.toThrow();
    });
    it("should require userId and type", () => {
      const report = {
        status: "pending",
      };
      expect(() => report_schema_1.ReportDocument.validate(report)).toThrow();
    });
  });
});
//# sourceMappingURL=schema-validation.test.js.map
