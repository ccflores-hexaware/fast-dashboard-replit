import { describe, it, expect, vi, beforeEach } from "vitest";
import { CmdbService } from "./cmdb.service";
import type { CmdbStorage } from "./cmdb.storage";
import type { CmdbAsset, CmdbAssetHistory } from "./cmdb.types";

const mockAsset: CmdbAsset = {
  internalId: 1,
  id: "CMDB-001",
  configItem: "Test Config Item",
  version: "1.0.0",
  environment: "Production",
  status: "Active",
  owner: "John Doe",
  lastUpdated: "2024-01-15",
  createdAt: new Date(),
};

const mockHistory: CmdbAssetHistory = {
  id: 1,
  cmdbAssetId: "CMDB-001",
  configItem: "Test Config Item",
  version: "1.0.0",
  environment: "Production",
  status: "Active",
  owner: "John Doe",
  lastUpdated: "2024-01-15",
  startDate: new Date("2024-01-01"),
  endDate: new Date("9999-12-31"),
};

function createMockStorage(): CmdbStorage {
  return {
    findById: vi.fn(),
    findPaginated: vi.fn(),
    getFilterOptions: vi.fn(),
    findHistoryByAssetId: vi.fn(),
    countHistoryByAssetId: vi.fn(),
  } as unknown as CmdbStorage;
}

describe("CmdbService", () => {
  let service: CmdbService;
  let mockStorage: CmdbStorage;

  beforeEach(() => {
    mockStorage = createMockStorage();
    service = new CmdbService(mockStorage);
  });

  describe("getAssetById", () => {
    it("should return asset when found", async () => {
      vi.mocked(mockStorage.findById).mockResolvedValue(mockAsset);

      const result = await service.getAssetById("CMDB-001");

      expect(result).toEqual(mockAsset);
      expect(mockStorage.findById).toHaveBeenCalledWith("CMDB-001");
    });

    it("should return null when asset not found", async () => {
      vi.mocked(mockStorage.findById).mockResolvedValue(null);

      const result = await service.getAssetById("NONEXISTENT");

      expect(result).toBeNull();
    });

    it("should return null for empty string id", async () => {
      const result = await service.getAssetById("");

      expect(result).toBeNull();
      expect(mockStorage.findById).not.toHaveBeenCalled();
    });

    it("should return null for whitespace-only id", async () => {
      const result = await service.getAssetById("   ");

      expect(result).toBeNull();
      expect(mockStorage.findById).not.toHaveBeenCalled();
    });

    it("should trim whitespace from id", async () => {
      vi.mocked(mockStorage.findById).mockResolvedValue(mockAsset);

      await service.getAssetById("  CMDB-001  ");

      expect(mockStorage.findById).toHaveBeenCalledWith("CMDB-001");
    });
  });

  describe("getAssets", () => {
    it("should return paginated results", async () => {
      const paginatedResult = {
        data: [mockAsset],
        totalCount: 1,
        totalPages: 1,
        currentPage: 1,
      };
      vi.mocked(mockStorage.findPaginated).mockResolvedValue(paginatedResult);

      const result = await service.getAssets({ page: 1, limit: 10, sortOrder: "desc" });

      expect(result).toEqual(paginatedResult);
    });

    it("should sanitize negative page number to 1", async () => {
      vi.mocked(mockStorage.findPaginated).mockResolvedValue({
        data: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
      });

      await service.getAssets({ page: -5, limit: 10, sortOrder: "desc" });

      expect(mockStorage.findPaginated).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1 })
      );
    });

    it("should cap limit at 100", async () => {
      vi.mocked(mockStorage.findPaginated).mockResolvedValue({
        data: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
      });

      await service.getAssets({ page: 1, limit: 500, sortOrder: "desc" });

      expect(mockStorage.findPaginated).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 100 })
      );
    });

    it("should sanitize empty filters to undefined", async () => {
      vi.mocked(mockStorage.findPaginated).mockResolvedValue({
        data: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
      });

      await service.getAssets({ page: 1, limit: 10, sortOrder: "desc", filters: {} });

      expect(mockStorage.findPaginated).toHaveBeenCalledWith(
        expect.objectContaining({ filters: undefined })
      );
    });

    it("should filter out empty string values from filters", async () => {
      vi.mocked(mockStorage.findPaginated).mockResolvedValue({
        data: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
      });

      await service.getAssets({
        page: 1,
        limit: 10,
        sortOrder: "desc",
        filters: { status: ["Active", "", "  "] },
      });

      expect(mockStorage.findPaginated).toHaveBeenCalledWith(
        expect.objectContaining({ filters: { status: ["Active"] } })
      );
    });
  });

  describe("getFilterOptions", () => {
    it("should return filter options from storage", async () => {
      const filterOptions = { status: ["Active", "Inactive"], environment: ["Production", "Development"] };
      vi.mocked(mockStorage.getFilterOptions).mockResolvedValue(filterOptions);

      const result = await service.getFilterOptions();

      expect(result).toEqual(filterOptions);
    });
  });

  describe("getAssetHistory", () => {
    it("should return history with total count", async () => {
      vi.mocked(mockStorage.findHistoryByAssetId).mockResolvedValue([mockHistory]);
      vi.mocked(mockStorage.countHistoryByAssetId).mockResolvedValue(1);

      const result = await service.getAssetHistory("CMDB-001");

      expect(result).toEqual({ history: [mockHistory], total: 1 });
    });

    it("should return empty result for empty asset id", async () => {
      const result = await service.getAssetHistory("");

      expect(result).toEqual({ history: [], total: 0 });
      expect(mockStorage.findHistoryByAssetId).not.toHaveBeenCalled();
    });

    it("should return empty result for whitespace-only asset id", async () => {
      const result = await service.getAssetHistory("   ");

      expect(result).toEqual({ history: [], total: 0 });
      expect(mockStorage.findHistoryByAssetId).not.toHaveBeenCalled();
    });

    it("should trim whitespace from asset id", async () => {
      vi.mocked(mockStorage.findHistoryByAssetId).mockResolvedValue([]);
      vi.mocked(mockStorage.countHistoryByAssetId).mockResolvedValue(0);

      await service.getAssetHistory("  CMDB-001  ");

      expect(mockStorage.findHistoryByAssetId).toHaveBeenCalledWith("CMDB-001");
    });
  });
});
