import { getModelToken } from "@nestjs/mongoose";
import { Test, type TestingModule } from "@nestjs/testing";
import { type Document, Model } from "mongoose";
import { Expense, ExpenseSchema } from "../../expense/expense.schema";
import { UserRole, UserStatus } from "../../lib/types";
import { Metrics, MetricsSchema } from "../../metrics/metrics.schema";
import { AIModel, AIModelSchema } from "../ai-model.schema";
import { Analytics, AnalyticsSchema } from "../analytics.schema";
import { Budget, BudgetSchema } from "../budget.schema";
import { Category, CategorySchema } from "../category.schema";
import { Integration, IntegrationSchema } from "../integration.schema";
import { Merchant, MerchantSchema } from "../merchant.schema";
import { Notification, NotificationSchema } from "../notification.schema";
import { OCR, OcrSchema } from "../ocr.schema";
import { Receipt, ReceiptSchema } from "../receipt.schema";
import { Report, ReportSchema } from "../report.schema";
import { Search, SearchSchema } from "../search.schema";
import { Sendgrid, SendgridSchema } from "../sendgrid.schema";
import { Settings, SettingsSchema } from "../settings.schema";
import { Sms, SmsSchema } from "../sms.schema";
import { Subscription, SubscriptionSchema } from "../subscription.schema";
import { Transaction, TransactionSchema } from "../transaction.schema";
import { User, UserSchema } from "../user.schema";

describe("Schema Validation", () => {
  let transactionModel: Model<Transaction & Document>;
  let userModel: Model<User & Document>;
  let expenseModel: Model<Expense & Document>;
  let receiptModel: Model<Receipt & Document>;
  let merchantModel: Model<Merchant & Document>;
  let subscriptionModel: Model<Subscription & Document>;
  let reportModel: Model<Report & Document>;
  let smsModel: Model<Sms & Document>;
  let settingsModel: Model<Settings & Document>;
  let sendgridModel: Model<Sendgrid & Document>;
  let searchModel: Model<Search & Document>;
  let ocrModel: Model<OCR & Document>;
  let notificationModel: Model<Notification & Document>;
  let integrationModel: Model<Integration & Document>;
  let categoryModel: Model<Category & Document>;
  let budgetModel: Model<Budget & Document>;
  let analyticsModel: Model<Analytics & Document>;
  let aiModelModel: Model<AIModel & Document>;
  let metricsModel: Model<Metrics & Document>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getModelToken(Transaction.name),
          useValue: Model,
        },
        {
          provide: getModelToken(User.name),
          useValue: Model,
        },
        {
          provide: getModelToken(Expense.name),
          useValue: Model,
        },
        {
          provide: getModelToken(Receipt.name),
          useValue: Model,
        },
        {
          provide: getModelToken(Merchant.name),
          useValue: Model,
        },
        {
          provide: getModelToken(Subscription.name),
          useValue: Model,
        },
        {
          provide: getModelToken(Report.name),
          useValue: Model,
        },
        {
          provide: getModelToken(Sms.name),
          useValue: Model,
        },
        {
          provide: getModelToken(Settings.name),
          useValue: Model,
        },
        {
          provide: getModelToken(Sendgrid.name),
          useValue: Model,
        },
        {
          provide: getModelToken(Search.name),
          useValue: Model,
        },
        {
          provide: getModelToken(OCR.name),
          useValue: Model,
        },
        {
          provide: getModelToken(Notification.name),
          useValue: Model,
        },
        {
          provide: getModelToken(Integration.name),
          useValue: Model,
        },
        {
          provide: getModelToken(Category.name),
          useValue: Model,
        },
        {
          provide: getModelToken(Budget.name),
          useValue: Model,
        },
        {
          provide: getModelToken(Analytics.name),
          useValue: Model,
        },
        {
          provide: getModelToken(AIModel.name),
          useValue: Model,
        },
        {
          provide: getModelToken(Metrics.name),
          useValue: Model,
        },
      ],
    }).compile();

    transactionModel = module.get<Model<Transaction & Document>>(getModelToken(Transaction.name));
    userModel = module.get<Model<User & Document>>(getModelToken(User.name));
    expenseModel = module.get<Model<Expense & Document>>(getModelToken(Expense.name));
    receiptModel = module.get<Model<Receipt & Document>>(getModelToken(Receipt.name));
    merchantModel = module.get<Model<Merchant & Document>>(getModelToken(Merchant.name));
    subscriptionModel = module.get<Model<Subscription & Document>>(
      getModelToken(Subscription.name),
    );
    reportModel = module.get<Model<Report & Document>>(getModelToken(Report.name));
    smsModel = module.get<Model<Sms & Document>>(getModelToken(Sms.name));
    settingsModel = module.get<Model<Settings & Document>>(getModelToken(Settings.name));
    sendgridModel = module.get<Model<Sendgrid & Document>>(getModelToken(Sendgrid.name));
    searchModel = module.get<Model<Search & Document>>(getModelToken(Search.name));
    ocrModel = module.get<Model<OCR & Document>>(getModelToken(OCR.name));
    notificationModel = module.get<Model<Notification & Document>>(
      getModelToken(Notification.name),
    );
    integrationModel = module.get<Model<Integration & Document>>(getModelToken(Integration.name));
    categoryModel = module.get<Model<Category & Document>>(getModelToken(Category.name));
    budgetModel = module.get<Model<Budget & Document>>(getModelToken(Budget.name));
    analyticsModel = module.get<Model<Analytics & Document>>(getModelToken(Analytics.name));
    aiModelModel = module.get<Model<AIModel & Document>>(getModelToken(AIModel.name));
    metricsModel = module.get<Model<Metrics & Document>>(getModelToken(Metrics.name));
  });

  describe("Transaction Schema", () => {
    it("should validate a valid transaction", async () => {
      const validTransaction = new transactionModel({
        userId: "user123",
        date: new Date(),
        amount: { value: 100.5, currency: "USD" },
        description: "Test transaction",
        category: "FOOD",
        merchant: { name: "Test Merchant", id: "merchant-1" },
        status: "pending",
      });

      await expect(validTransaction.validate()).resolves.toBeUndefined();
    });

    it("should validate a transaction with empty merchant", async () => {
      const validTransaction = new transactionModel({
        userId: "user123",
        date: new Date(),
        amount: { value: 100.5, currency: "USD" },
        description: "Test transaction",
        category: "FOOD",
        merchant: { name: "", id: "" },
        status: "pending",
      });

      await expect(validTransaction.validate()).resolves.toBeUndefined();
    });

    it("should validate a transaction with tags", async () => {
      const validTransaction = new transactionModel({
        userId: "user123",
        date: new Date(),
        amount: { value: 100.5, currency: "USD" },
        description: "Test transaction",
        category: "FOOD",
        merchant: { name: "Test Merchant", id: "merchant-1" },
        status: "pending",
        tags: ["test", "food"],
      });

      await expect(validTransaction.validate()).resolves.toBeUndefined();
    });
  });

  describe("User Schema", () => {
    it("should validate a valid user", async () => {
      const validUser = new userModel({
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        password: "password123",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
      });

      await expect(validUser.validate()).resolves.toBeUndefined();
    });
  });

  describe("Expense Schema", () => {
    it("should validate a valid expense", async () => {
      const validExpense = new expenseModel({
        userId: "user123",
        date: new Date(),
        amount: { value: 9.99, currency: "USD" },
        description: "Test expense",
        category: "FOOD",
        status: "PENDING",
      });

      await expect(validExpense.validate()).resolves.toBeUndefined();
    });
  });

  describe("Receipt Schema", () => {
    it("should validate a valid receipt", async () => {
      const receipt = new receiptModel({
        userId: "user123",
        url: "https://example.com/receipt.pdf",
        filename: "receipt.pdf",
        mimeType: "application/pdf",
        size: 1024,
        merchant: { name: "Test Merchant", id: "merchant-1" },
        amount: { value: 100.5, currency: "USD" },
        date: new Date(),
        tags: ["test"],
      });

      await expect(receipt.validate()).resolves.toBeUndefined();
    });

    it("should reject an invalid receipt", async () => {
      const receipt = new receiptModel({
        userId: "user123",
        date: new Date(),
        amount: { value: -100.5, currency: "USD" },
        merchant: { name: "", id: "" }, // Empty merchant
      });

      await expect(receipt.validate()).rejects.toBeDefined();
    });
  });

  describe("Merchant Schema", () => {
    it("should validate a valid merchant", async () => {
      const merchant = new merchantModel({
        userId: "user123",
        name: "Test Merchant",
        category: "Retail",
        website: "https://test.com",
      });

      await expect(merchant.validate()).resolves.toBeUndefined();
    });

    it("should reject an invalid merchant", async () => {
      const merchant = new merchantModel({
        userId: "user123",
        name: "", // Empty name
        category: "invalid-category",
      });

      await expect(merchant.validate()).rejects.toBeDefined();
    });
  });

  describe("Subscription Schema", () => {
    it("should validate a valid subscription", async () => {
      const subscription = new subscriptionModel({
        userId: "user123",
        name: "Test Subscription",
        amount: { value: 9.99, currency: "USD" },
        frequency: "monthly",
        status: "active",
      });

      await expect(subscription.validate()).resolves.toBeUndefined();
    });

    it("should reject an invalid subscription", async () => {
      const subscription = new subscriptionModel({
        userId: "user123",
        name: "Test Subscription",
        amount: { value: -9.99, currency: "USD" },
        status: "invalid-status",
      });

      await expect(subscription.validate()).rejects.toBeDefined();
    });
  });

  describe("Report Schema", () => {
    it("should validate a valid report", async () => {
      const report = new reportModel({
        userId: "user123",
        companyId: "company123",
        name: "Test Report",
        type: "expense",
        frequency: "monthly",
        status: "draft",
        startDate: new Date(),
        endDate: new Date(),
      });

      await expect(report.validate()).resolves.toBeUndefined();
    });

    it("should reject an invalid report", async () => {
      const report = new reportModel({
        userId: "user123",
        name: "Test Report",
        type: "invalid-type",
        status: "invalid-status",
      });

      await expect(report.validate()).rejects.toBeDefined();
    });
  });

  describe("SMS Schema", () => {
    it("should validate a valid SMS", async () => {
      const sms = new smsModel({
        userId: "user123",
        message: "Test message",
        recipient: "1234567890",
        status: "sent",
      });

      await expect(sms.validate()).resolves.toBeUndefined();
    });

    it("should reject an invalid SMS", async () => {
      const sms = new smsModel({
        userId: "user123",
        message: "",
        recipient: "",
      });

      await expect(sms.validate()).rejects.toBeDefined();
    });
  });

  describe("Settings Schema", () => {
    it("should validate a valid settings", async () => {
      const settings = new settingsModel({
        userId: "user123",
        notifications: {
          email: true,
          push: true,
        },
        preferences: {
          currency: "USD",
          timezone: "UTC",
        },
      });

      await expect(settings.validate()).resolves.toBeUndefined();
    });

    it("should reject an invalid settings", async () => {
      const settings = new settingsModel({
        userId: "user123",
        notifications: {
          email: false,
          push: false,
        },
        preferences: {
          currency: "INVALID",
          timezone: "invalid-timezone",
        },
      });

      await expect(settings.validate()).rejects.toBeDefined();
    });
  });

  describe("Sendgrid Schema", () => {
    it("should validate a valid Sendgrid", async () => {
      const sendgrid = new sendgridModel({
        userId: "user123",
        apiKey: "test-api-key",
        status: "active",
      });

      await expect(sendgrid.validate()).resolves.toBeUndefined();
    });

    it("should reject an invalid Sendgrid", async () => {
      const sendgrid = new sendgridModel({
        userId: "user123",
        apiKey: "",
        status: "inactive",
      });

      await expect(sendgrid.validate()).rejects.toBeDefined();
    });
  });

  describe("Search Schema", () => {
    it("should validate a valid search", async () => {
      const search = new searchModel({
        userId: "user123",
        query: "Test query",
        results: ["result1", "result2"],
        status: "completed",
      });

      await expect(search.validate()).resolves.toBeUndefined();
    });

    it("should reject an invalid search", async () => {
      const search = new searchModel({
        userId: "user123",
        query: "",
        results: [],
      });

      await expect(search.validate()).rejects.toBeDefined();
    });
  });

  describe("OCR Schema", () => {
    it("should validate a valid OCR", async () => {
      const ocr = new ocrModel({
        userId: "user123",
        imageUrl: "https://example.com/image.jpg",
        text: "Test OCR text",
        status: "completed",
      });

      await expect(ocr.validate()).resolves.toBeUndefined();
    });

    it("should reject an invalid OCR", async () => {
      const ocr = new ocrModel({
        userId: "user123",
        imageUrl: "",
        text: "",
      });

      await expect(ocr.validate()).rejects.toBeDefined();
    });
  });

  describe("Notification Schema", () => {
    it("should validate a valid notification", async () => {
      const notification = new notificationModel({
        userId: "user123",
        title: "Test Notification",
        message: "Test message",
        status: "sent",
      });

      await expect(notification.validate()).resolves.toBeUndefined();
    });

    it("should reject an invalid notification", async () => {
      const notification = new notificationModel({
        userId: "user123",
        title: "",
        message: "",
      });

      await expect(notification.validate()).rejects.toBeDefined();
    });
  });

  describe("Integration Schema", () => {
    it("should validate a valid integration", async () => {
      const integration = new integrationModel({
        userId: "user123",
        name: "Test Integration",
        status: "active",
      });

      await expect(integration.validate()).resolves.toBeUndefined();
    });

    it("should reject an invalid integration", async () => {
      const integration = new integrationModel({
        userId: "user123",
        name: "",
        status: "inactive",
      });

      await expect(integration.validate()).rejects.toBeDefined();
    });
  });

  describe("Category Schema", () => {
    it("should validate a valid category", async () => {
      const category = new categoryModel({
        userId: "user123",
        name: "Test Category",
        status: "active",
      });

      await expect(category.validate()).resolves.toBeUndefined();
    });

    it("should reject an invalid category", async () => {
      const category = new categoryModel({
        userId: "user123",
        name: "",
        status: "inactive",
      });

      await expect(category.validate()).rejects.toBeDefined();
    });
  });

  describe("Budget Schema", () => {
    it("should validate a valid budget", async () => {
      const budget = new budgetModel({
        userId: "user123",
        name: "Test Budget",
        amount: { value: 1000, currency: "USD" },
        status: "active",
      });

      await expect(budget.validate()).resolves.toBeUndefined();
    });

    it("should reject an invalid budget", async () => {
      const budget = new budgetModel({
        userId: "user123",
        name: "",
        amount: { value: -1000, currency: "USD" },
        status: "inactive",
      });

      await expect(budget.validate()).rejects.toBeDefined();
    });
  });

  describe("Analytics Schema", () => {
    it("should validate a valid analytics", async () => {
      const analytics = new analyticsModel({
        userId: "user123",
        name: "Test Analytics",
        status: "active",
      });

      await expect(analytics.validate()).resolves.toBeUndefined();
    });

    it("should reject an invalid analytics", async () => {
      const analytics = new analyticsModel({
        userId: "user123",
        name: "",
        status: "inactive",
      });

      await expect(analytics.validate()).rejects.toBeDefined();
    });
  });

  describe("AIModel Schema", () => {
    it("should validate a valid AI model", async () => {
      const aiModel = new aiModelModel({
        userId: "user123",
        name: "Test AI Model",
        status: "active",
      });

      await expect(aiModel.validate()).resolves.toBeUndefined();
    });

    it("should reject an invalid AI model", async () => {
      const aiModel = new aiModelModel({
        userId: "user123",
        name: "",
        status: "inactive",
      });

      await expect(aiModel.validate()).rejects.toBeDefined();
    });
  });

  describe("Metrics Schema", () => {
    it("should validate a valid metrics", async () => {
      const metrics = new metricsModel({
        userId: "user123",
        name: "Test Metrics",
        status: "active",
      });

      await expect(metrics.validate()).resolves.toBeUndefined();
    });

    it("should reject an invalid metrics", async () => {
      const metrics = new metricsModel({
        userId: "user123",
        name: "",
        status: "inactive",
      });

      await expect(metrics.validate()).rejects.toBeDefined();
    });
  });
});
