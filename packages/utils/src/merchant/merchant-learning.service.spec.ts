import {
  MerchantLearningData,
  MerchantLearningResult,
  type MerchantSource,
} from "@fresh-expense/types";
import { Test, type TestingModule } from "@nestjs/testing";
import { MerchantLearningService } from "./merchant-learning.service";

describe("MerchantLearningService", () => {
  let service: MerchantLearningService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MerchantLearningService],
    }).compile();

    service = module.get<MerchantLearningService>(MerchantLearningService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("learnFromData", () => {
    it("should throw error when merchant name is missing", async () => {
      const data = {
        userId: "user123",
        source: "manual" as MerchantSource,
        confidence: 0.8,
      };

      await expect(service.learnFromData(data as any)).rejects.toThrow(
        "Merchant name and user ID are required",
      );
    });

    it("should throw error when user ID is missing", async () => {
      const data = {
        merchantName: "Test Merchant",
        source: "manual" as MerchantSource,
        confidence: 0.8,
      };

      await expect(service.learnFromData(data as any)).rejects.toThrow(
        "Merchant name and user ID are required",
      );
    });

    it("should process valid merchant data", async () => {
      const data = {
        merchantName: "Test Merchant",
        userId: "user123",
        source: "manual" as MerchantSource,
        confidence: 0.8,
        category: "shopping",
        metadata: {
          transactionCount: 5,
          tags: ["online", "electronics"],
        },
      };

      const result = await service.learnFromData(data);
      expect(result.merchantName).toBe("Test Merchant");
      expect(result.userId).toBe("user123");
      expect(result.category).toBe("shopping");
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.tags).toEqual(["online", "electronics"]);
      expect(result.metadata.transactionCount).toBe(5);
    });

    it("should handle missing optional fields", async () => {
      const data = {
        merchantName: "Test Merchant",
        userId: "user123",
        source: "manual" as MerchantSource,
        confidence: 0.8,
      };

      const result = await service.learnFromData(data);
      expect(result.category).toBe("uncategorized");
      expect(result.tags).toEqual([]);
      expect(result.metadata.transactionCount).toBe(0);
    });

    it("should handle different confidence levels based on source", async () => {
      const data = {
        merchantName: "Test Merchant",
        userId: "user123",
        confidence: 0.8,
        category: "shopping",
      };

      const manualResult = await service.learnFromData({
        ...data,
        source: "manual" as MerchantSource,
      });
      const ocrResult = await service.learnFromData({
        ...data,
        source: "ocr" as MerchantSource,
      });
      const transactionResult = await service.learnFromData({
        ...data,
        source: "transaction" as MerchantSource,
      });
      const apiResult = await service.learnFromData({
        ...data,
        source: "api" as MerchantSource,
      });

      expect(manualResult.confidence).toBeGreaterThan(ocrResult.confidence);
      expect(ocrResult.confidence).toBeGreaterThan(transactionResult.confidence);
      expect(transactionResult.confidence).toBeGreaterThan(apiResult.confidence);
    });

    it("should cap confidence at 1.0", async () => {
      const data = {
        merchantName: "Test Merchant",
        userId: "user123",
        source: "manual" as MerchantSource,
        confidence: 1.2,
        metadata: { transactionCount: 10 },
      };

      const result = await service.learnFromData(data);
      expect(result.confidence).toBeLessThanOrEqual(1.0);
    });

    it("should handle negative confidence values", async () => {
      const data = {
        merchantName: "Test Merchant",
        userId: "user123",
        source: "manual" as MerchantSource,
        confidence: -0.5,
      };

      const result = await service.learnFromData(data);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
    });
  });

  describe("updateConfig", () => {
    it("should update configuration", () => {
      const newConfig = {
        minConfidence: 0.8,
        minTransactions: 5,
        categoryWeights: {
          manual: 0.9,
          ocr: 0.8,
          transaction: 0.7,
          api: 0.6,
        },
      };

      service.updateConfig(newConfig);
      const result = service.learnFromData({
        merchantName: "Test Merchant",
        userId: "user123",
        source: "manual" as MerchantSource,
        confidence: 0.8,
        metadata: { transactionCount: 4 },
      });

      expect(result).toBeDefined();
    });

    it("should handle partial config updates", async () => {
      const partialConfig = {
        minConfidence: 0.9,
      };

      service.updateConfig(partialConfig);
      const result = await service.learnFromData({
        merchantName: "Test Merchant",
        userId: "user123",
        source: "manual" as MerchantSource,
        confidence: 0.8,
      });

      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it("should handle invalid config values", async () => {
      const invalidConfig = {
        minConfidence: -0.5,
        minTransactions: -1,
        categoryWeights: {
          manual: 1.5,
          ocr: 1.5,
          transaction: 1.5,
          api: 1.5,
        },
      };

      service.updateConfig(invalidConfig);
      const result = await service.learnFromData({
        merchantName: "Test Merchant",
        userId: "user123",
        source: "manual" as MerchantSource,
        confidence: 0.8,
      });

      expect(result.confidence).toBeGreaterThanOrEqual(0);
    });
  });
});
