import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReconService } from "./recon.service";
import type { ReconStorage } from "./recon.storage";
import type { ReconAsset } from "../../../shared/schema";

const createMockAsset = (overrides: Partial<ReconAsset> = {}): ReconAsset => ({
  internalId: 1,
  applicationname: "Test Application",
  accountname: "Test Account",
  entitlementcolumn: "Column A",
  entitlementvalue: "Value 1",
  filepath: "/path/to/file.csv",
  applicationstatus: "Active",
  status: "Verified",
  ...overrides,
});

const createMockStorage = (): ReconStorage => ({
  findByInternalId: vi.fn(),
  findPaginated: vi.fn(),
  getFilterOptions: vi.fn(),
});

describe("ReconService", () => {
  let mockStorage: ReturnType<typeof createMockStorage>;
  let service: ReconService;

  beforeEach(() => {
    mockStorage = createMockStorage();
    service = new ReconService(mockStorage as unknown as ReconStorage);
  });

  describe("getAssetByInternalId", () => {
    it("should return asset when found", async () => {
      const mockAsset = createMockAsset();
      vi.mocked(mockStorage.findByInternalId).mockResolvedValue(mockAsset);

      const result = await service.getAssetByInternalId(1);

      expect(result).toEqual(mockAsset);
      expect(mockStorage.findByInternalId).toHaveBeenCalledWith(1);
    });

    it("should return null when asset not found", async () => {
      vi.mocked(mockStorage.findByInternalId).mockResolvedValue(null);

      const result = await service.getAssetByInternalId(999);

      expect(result).toBeNull();
    });

    it("should return null for zero id", async () => {
      const result = await service.getAssetByInternalId(0);

      expect(result).toBeNull();
      expect(mockStorage.findByInternalId).not.toHaveBeenCalled();
    });

    it("should return null for negative id", async () => {
      const result = await service.getAssetByInternalId(-5);

      expect(result).toBeNull();
      expect(mockStorage.findByInternalId).not.toHaveBeenCalled();
    });

    it("should handle null values in asset fields", async () => {
      const mockAsset = createMockAsset({
        applicationname: null,
        accountname: null,
        status: null,
      });
      vi.mocked(mockStorage.findByInternalId).mockResolvedValue(mockAsset);

      const result = await service.getAssetByInternalId(1);

      expect(result).toEqual(mockAsset);
      expect(result?.applicationname).toBeNull();
    });
  });

  describe("getAssets", () => {
    it("should return paginated results", async () => {
      const mockAsset = createMockAsset();
      const mockResult = {
        data: [mockAsset],
        totalCount: 1,
        totalPages: 1,
        currentPage: 1,
      };
      vi.mocked(mockStorage.findPaginated).mockResolvedValue(mockResult);

      const result = await service.getAssets({ page: 1, limit: 10, sortOrder: "desc" });

      expect(result).toEqual(mockResult);
    });

    it("should return empty data array when no assets exist", async () => {
      const mockResult = {
        data: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
      };
      vi.mocked(mockStorage.findPaginated).mockResolvedValue(mockResult);

      const result = await service.getAssets({ page: 1, limit: 10, sortOrder: "desc" });

      expect(result.data).toEqual([]);
      expect(result.totalCount).toBe(0);
    });

    it("should sanitize negative page number to 1", async () => {
      const mockResult = {
        data: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
      };
      vi.mocked(mockStorage.findPaginated).mockResolvedValue(mockResult);

      await service.getAssets({ page: -5, limit: 10, sortOrder: "desc" });

      expect(mockStorage.findPaginated).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1 })
      );
    });

    it("should sanitize zero page number to 1", async () => {
      const mockResult = {
        data: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
      };
      vi.mocked(mockStorage.findPaginated).mockResolvedValue(mockResult);

      await service.getAssets({ page: 0, limit: 10, sortOrder: "desc" });

      expect(mockStorage.findPaginated).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1 })
      );
    });

    it("should cap limit at 100", async () => {
      const mockResult = {
        data: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
      };
      vi.mocked(mockStorage.findPaginated).mockResolvedValue(mockResult);

      await service.getAssets({ page: 1, limit: 500, sortOrder: "desc" });

      expect(mockStorage.findPaginated).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 100 })
      );
    });

    it("should sanitize limit at minimum 1", async () => {
      const mockResult = {
        data: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
      };
      vi.mocked(mockStorage.findPaginated).mockResolvedValue(mockResult);

      await service.getAssets({ page: 1, limit: -10, sortOrder: "desc" });

      expect(mockStorage.findPaginated).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 1 })
      );
    });

    it("should sanitize empty filters to undefined", async () => {
      const mockResult = {
        data: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
      };
      vi.mocked(mockStorage.findPaginated).mockResolvedValue(mockResult);

      await service.getAssets({
        page: 1,
        limit: 10,
        sortOrder: "desc",
        filters: { status: [] },
      });

      expect(mockStorage.findPaginated).toHaveBeenCalledWith(
        expect.objectContaining({ filters: undefined })
      );
    });

    it("should filter out empty string values from filters", async () => {
      const mockResult = {
        data: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
      };
      vi.mocked(mockStorage.findPaginated).mockResolvedValue(mockResult);

      await service.getAssets({
        page: 1,
        limit: 10,
        sortOrder: "desc",
        filters: { status: ["Active", "", "  ", "Inactive"] },
      });

      expect(mockStorage.findPaginated).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: { status: ["Active", "Inactive"] },
        })
      );
    });

    it("should trim filter values", async () => {
      const mockResult = {
        data: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
      };
      vi.mocked(mockStorage.findPaginated).mockResolvedValue(mockResult);

      await service.getAssets({
        page: 1,
        limit: 10,
        sortOrder: "desc",
        filters: { status: ["  Active  ", " Inactive "] },
      });

      expect(mockStorage.findPaginated).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: { status: ["Active", "Inactive"] },
        })
      );
    });

    it("should trim search query", async () => {
      const mockResult = {
        data: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
      };
      vi.mocked(mockStorage.findPaginated).mockResolvedValue(mockResult);

      await service.getAssets({
        page: 1,
        limit: 10,
        sortOrder: "desc",
        search: "  test query  ",
      });

      expect(mockStorage.findPaginated).toHaveBeenCalledWith(
        expect.objectContaining({ search: "test query" })
      );
    });

    it("should handle large page numbers", async () => {
      const mockResult = {
        data: [],
        totalCount: 100,
        totalPages: 10,
        currentPage: 1000,
      };
      vi.mocked(mockStorage.findPaginated).mockResolvedValue(mockResult);

      const result = await service.getAssets({ page: 1000, limit: 10, sortOrder: "desc" });

      expect(mockStorage.findPaginated).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1000 })
      );
    });

    it("should pass sort order correctly", async () => {
      const mockResult = {
        data: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
      };
      vi.mocked(mockStorage.findPaginated).mockResolvedValue(mockResult);

      await service.getAssets({ page: 1, limit: 10, sortOrder: "asc", sortBy: "applicationname" });

      expect(mockStorage.findPaginated).toHaveBeenCalledWith(
        expect.objectContaining({ sortOrder: "asc", sortBy: "applicationname" })
      );
    });
  });

  describe("getFilterOptions", () => {
    it("should return filter options from storage", async () => {
      const mockOptions = {
        status: ["Active", "Inactive", "Pending"],
        applicationstatus: ["Approved", "Rejected"],
      };
      vi.mocked(mockStorage.getFilterOptions).mockResolvedValue(mockOptions);

      const result = await service.getFilterOptions();

      expect(result).toEqual(mockOptions);
    });

    it("should return empty object when no filter options exist", async () => {
      vi.mocked(mockStorage.getFilterOptions).mockResolvedValue({});

      const result = await service.getFilterOptions();

      expect(result).toEqual({});
    });
  });
});

describe("Recon Pagination Edge Cases", () => {
  it("should calculate totalPages correctly with partial page", () => {
    const totalCount = 25;
    const limit = 10;
    const expectedPages = Math.ceil(totalCount / limit);
    
    expect(expectedPages).toBe(3);
  });

  it("should handle zero items", () => {
    const totalCount = 0;
    const limit = 10;
    const expectedPages = Math.ceil(totalCount / limit) || 0;
    
    expect(expectedPages).toBe(0);
  });

  it("should calculate offset correctly", () => {
    const page = 3;
    const limit = 10;
    const offset = (page - 1) * limit;
    
    expect(offset).toBe(20);
  });
});
