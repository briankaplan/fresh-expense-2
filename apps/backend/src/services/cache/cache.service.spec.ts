import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Logger } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import type { Cache } from "cache-manager";

import { CacheService } from "./cache.service";

interface CacheStore {
  keys: jest.Mock<Promise<string[]>, [string?]>;
}

describe("CacheService", () => {
  let service: CacheService;
  let cacheManagerMock: jest.Mocked<Cache & { store: CacheStore }>;

  beforeEach(async () => {
    cacheManagerMock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      store: {
        keys: jest.fn(),
      },
    } as unknown;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    jest.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("get", () => {
    it("should return cached data when cache hit", async () => {
      const mockData = { foo: "bar" };
      cacheManagerMock.get.mockResolvedValue(mockData);

      const result = await service.get("test-key");
      expect(result).toEqual(mockData);
      expect(cacheManagerMock.get).toHaveBeenCalledWith("test-key");
    });

    it("should return null when cache miss", async () => {
      cacheManagerMock.get.mockResolvedValue(undefined);

      const result = await service.get("test-key");
      expect(result).toBeNull();
    });

    it("should handle prefix correctly", async () => {
      await service.get("test-key", { prefix: "prefix" });
      expect(cacheManagerMock.get).toHaveBeenCalledWith("prefix:test-key");
    });

    it("should return null and log error when cache fails", async () => {
      cacheManagerMock.get.mockRejectedValue(new Error("Cache error"));

      const result = await service.get("test-key");
      expect(result).toBeNull();
      expect(Logger.prototype.error).toHaveBeenCalled();
    });
  });

  describe("set", () => {
    it("should set cache with default TTL", async () => {
      const value = { foo: "bar" };
      await service.set("test-key", value);

      expect(cacheManagerMock.set).toHaveBeenCalledWith("test-key", value, 3600 * 1000);
    });

    it("should set cache with custom TTL", async () => {
      const value = { foo: "bar" };
      await service.set("test-key", value, { ttl: 60 });

      expect(cacheManagerMock.set).toHaveBeenCalledWith("test-key", value, 60 * 1000);
    });

    it("should handle prefix correctly", async () => {
      const value = { foo: "bar" };
      await service.set("test-key", value, { prefix: "prefix" });

      expect(cacheManagerMock.set).toHaveBeenCalledWith("prefix:test-key", value, 3600 * 1000);
    });

    it("should log error when cache fails", async () => {
      cacheManagerMock.set.mockRejectedValue(new Error("Cache error"));

      await service.set("test-key", { foo: "bar" });
      expect(Logger.prototype.error).toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("should delete cache key", async () => {
      await service.delete("test-key");
      expect(cacheManagerMock.del).toHaveBeenCalledWith("test-key");
    });

    it("should handle prefix correctly", async () => {
      await service.delete("test-key", "prefix");
      expect(cacheManagerMock.del).toHaveBeenCalledWith("prefix:test-key");
    });

    it("should log error when cache fails", async () => {
      cacheManagerMock.del.mockRejectedValue(new Error("Cache error"));

      await service.delete("test-key");
      expect(Logger.prototype.error).toHaveBeenCalled();
    });
  });

  describe("clearByPrefix", () => {
    it("should clear all keys with prefix", async () => {
      const mockKeys = ["prefix:key1", "prefix:key2"];
      cacheManagerMock.store.keys.mockResolvedValue(mockKeys);

      await service.clearByPrefix("prefix");

      expect(cacheManagerMock.store.keys).toHaveBeenCalledWith("prefix:*");
      expect(cacheManagerMock.del).toHaveBeenCalledTimes(2);
      expect(cacheManagerMock.del).toHaveBeenCalledWith("prefix:key1");
      expect(cacheManagerMock.del).toHaveBeenCalledWith("prefix:key2");
    });

    it("should not call del when no keys found", async () => {
      cacheManagerMock.store.keys.mockResolvedValue([]);

      await service.clearByPrefix("prefix");

      expect(cacheManagerMock.store.keys).toHaveBeenCalledWith("prefix:*");
      expect(cacheManagerMock.del).not.toHaveBeenCalled();
    });

    it("should log warning when store does not support keys", async () => {
      const storeWithoutKeys = { ...cacheManagerMock.store, keys: undefined };
      cacheManagerMock.store = storeWithoutKeys as unknown;

      await service.clearByPrefix("prefix");
      expect(Logger.prototype.warn).toHaveBeenCalled();
    });

    it("should log error when cache fails", async () => {
      cacheManagerMock.store.keys.mockRejectedValue(new Error("Cache error"));

      await service.clearByPrefix("prefix");
      expect(Logger.prototype.error).toHaveBeenCalled();
    });
  });
});
