import type { BaseTransactionData, ReceiptDocument } from "@fresh-expense/types";
import { Test, type TestingModule } from "@nestjs/testing";
import { ReceiptMatcherService } from "./receipt-matcher.service";

describe("ReceiptMatcherService", () => {
  let service: ReceiptMatcherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReceiptMatcherService],
    }).compile();

    service = module.get<ReceiptMatcherService>(ReceiptMatcherService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findMatchesForReceipt", () => {
    const mockReceipt: ReceiptDocument = {
      userId: "user1",
      merchant: "Test Store",
      amount: 100,
      date: new Date("2023-01-01"),
      metadata: {
        location: {
          latitude: 40.7128,
          longitude: -74.006,
        },
        paymentMethod: "credit",
      },
    } as ReceiptDocument;

    const mockTransactions: BaseTransactionData[] = [
      {
        id: "txn1",
        accountId: "acc1",
        merchantName: "Test Store",
        amount: 100,
        date: new Date("2023-01-01"),
        description: "Test Store Purchase",
        type: "debit",
        status: "posted",
        metadata: {
          location: {
            latitude: 40.7128,
            longitude: -74.006,
          },
          paymentMethod: "credit",
        },
      },
      {
        id: "txn2",
        accountId: "acc1",
        merchantName: "Different Store",
        amount: 200,
        date: new Date("2023-01-02"),
        description: "Different Store Purchase",
        type: "debit",
        status: "posted",
      },
    ];

    it("should find matches with default preferences", async () => {
      const matches = await service.findMatchesForReceipt(mockReceipt, mockTransactions);
      expect(matches).toHaveLength(1);
      expect(matches[0]?.confidence).toBeGreaterThan(0.8);
    });

    it("should respect custom preferences", async () => {
      const matches = await service.findMatchesForReceipt(mockReceipt, mockTransactions, {
        merchantMatchThreshold: 0.5,
      });
      expect(matches.length).toBeGreaterThan(0);
    });

    it("should handle empty transaction list", async () => {
      const matches = await service.findMatchesForReceipt(mockReceipt, []);
      expect(matches).toHaveLength(0);
    });

    it("should handle partial matches with different weights", async () => {
      const matches = await service.findMatchesForReceipt(mockReceipt, mockTransactions, {
        weights: {
          merchant: 0.6,
          amount: 0.2,
          date: 0.1,
          location: 0.1,
          category: 0,
          paymentMethod: 0,
          text: 0,
        },
      });
      expect(matches.length).toBeGreaterThan(0);
    });

    it("should handle transactions with missing metadata", async () => {
      const matches = await service.findMatchesForReceipt(mockReceipt, [
        {
          id: "txn3",
          accountId: "acc1",
          merchantName: "Test Store",
          amount: 100,
          date: new Date("2023-01-01"),
          description: "Test Store Purchase",
          type: "debit",
          status: "posted",
        },
      ]);
      expect(matches.length).toBeGreaterThan(0);
    });
  });

  describe("calculateMerchantScore", () => {
    const defaultPreferences = {
      weights: {
        merchant: 0.4,
        amount: 0.3,
        date: 0.2,
        location: 0.05,
        category: 0.05,
        paymentMethod: 0,
        text: 0,
      },
      amountTolerance: 0.1,
      dateRangeDays: 3,
      merchantMatchThreshold: 0.8,
    };

    it("should return 1 for exact matches", () => {
      const score = service["calculateMerchantScore"](
        "Test Store",
        "Test Store",
        defaultPreferences,
      );
      expect(score).toBe(1);
    });

    it("should return 0.8 for substring matches", () => {
      const score = service["calculateMerchantScore"]("Test Store", "Store", defaultPreferences);
      expect(score).toBe(0.8);
    });

    it("should calculate similarity for partial matches", () => {
      const score = service["calculateMerchantScore"](
        "Test Store",
        "Test Shop",
        defaultPreferences,
      );
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(1);
    });

    it("should handle empty strings", () => {
      const score = service["calculateMerchantScore"]("", "Test Store", defaultPreferences);
      expect(score).toBe(0);
    });

    it("should handle special characters", () => {
      const score = service["calculateMerchantScore"](
        "Test-Store",
        "Test Store",
        defaultPreferences,
      );
      expect(score).toBe(1);
    });
  });

  describe("calculateAmountScore", () => {
    it("should return 1 for exact matches", () => {
      const score = service["calculateAmountScore"](100, 100, 0.1);
      expect(score).toBe(1);
    });

    it("should return partial score within tolerance", () => {
      const score = service["calculateAmountScore"](100, 95, 0.1);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(1);
    });

    it("should return 0 outside tolerance", () => {
      const score = service["calculateAmountScore"](100, 50, 0.1);
      expect(score).toBe(0);
    });

    it("should handle zero amounts", () => {
      const score = service["calculateAmountScore"](0, 0, 0.1);
      expect(score).toBe(1);
    });

    it("should handle negative amounts", () => {
      const score = service["calculateAmountScore"](-100, -100, 0.1);
      expect(score).toBe(1);
    });
  });

  describe("calculateDateScore", () => {
    it("should return 1 for same day", () => {
      const date = new Date("2023-01-01");
      const score = service["calculateDateScore"](date, date, 3);
      expect(score).toBe(1);
    });

    it("should return 0.9 for next day", () => {
      const score = service["calculateDateScore"](
        new Date("2023-01-01"),
        new Date("2023-01-02"),
        3,
      );
      expect(score).toBe(0.9);
    });

    it("should return 0 for dates beyond range", () => {
      const score = service["calculateDateScore"](
        new Date("2023-01-01"),
        new Date("2023-01-05"),
        3,
      );
      expect(score).toBe(0);
    });

    it("should handle same day different times", () => {
      const score = service["calculateDateScore"](
        new Date("2023-01-01T12:00:00"),
        new Date("2023-01-01T18:00:00"),
        3,
      );
      expect(score).toBe(1);
    });

    it("should handle invalid dates", () => {
      const score = service["calculateDateScore"](new Date("invalid"), new Date("2023-01-01"), 3);
      expect(score).toBe(0);
    });
  });

  describe("calculateLocationScore", () => {
    const receipt: ReceiptDocument = {
      userId: "user1",
      merchant: "Test Store",
      amount: 100,
      date: new Date("2023-01-01"),
      metadata: {
        location: {
          latitude: 40.7128,
          longitude: -74.006,
        },
      },
    } as ReceiptDocument;

    const transaction: BaseTransactionData = {
      id: "txn1",
      accountId: "acc1",
      merchantName: "Test Store",
      amount: 100,
      date: new Date("2023-01-01"),
      description: "Test Store Purchase",
      type: "debit",
      status: "posted",
      metadata: {
        location: {
          latitude: 40.7128,
          longitude: -74.006,
        },
      },
    };

    it("should return 1 for same location", () => {
      const score = service["calculateLocationScore"](receipt, transaction);
      expect(score).toBe(1);
    });

    it("should return 0 for missing location data", () => {
      const score = service["calculateLocationScore"](
        { metadata: {} } as ReceiptDocument,
        { metadata: {} } as BaseTransactionData,
      );
      expect(score).toBe(0);
    });

    it("should handle nearby locations", () => {
      const nearbyTransaction: BaseTransactionData = {
        ...transaction,
        metadata: {
          location: {
            latitude: 40.7129,
            longitude: -74.0061,
          },
        },
      };
      const score = service["calculateLocationScore"](receipt, nearbyTransaction);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(1);
    });

    it("should handle invalid coordinates", () => {
      const invalidTransaction: BaseTransactionData = {
        ...transaction,
        metadata: {
          location: {
            latitude: 91, // Invalid latitude
            longitude: -181, // Invalid longitude
          },
        },
      };
      const score = service["calculateLocationScore"](receipt, invalidTransaction);
      expect(score).toBe(0);
    });
  });
});
