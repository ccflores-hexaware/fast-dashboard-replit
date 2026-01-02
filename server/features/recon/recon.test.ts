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
  findGrouped: vi.fn(),
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

describe("ReconService - Grouped Assets", () => {
  let mockStorage: ReturnType<typeof createMockStorage>;
  let service: ReconService;

  beforeEach(() => {
    mockStorage = createMockStorage();
    service = new ReconService(mockStorage as unknown as ReconStorage);
  });

  describe("getGroupedAssets", () => {
    it("should return grouped paginated results", async () => {
      const mockResult = {
        data: [
          {
            applicationName: "AWS Console",
            recordCount: 3,
            records: [
              createMockAsset({ internalId: 1, applicationname: "AWS Console" }),
              createMockAsset({ internalId: 2, applicationname: "AWS Console" }),
              createMockAsset({ internalId: 3, applicationname: "AWS Console" }),
            ],
          },
          {
            applicationName: "Salesforce",
            recordCount: 2,
            records: [
              createMockAsset({ internalId: 4, applicationname: "Salesforce" }),
              createMockAsset({ internalId: 5, applicationname: "Salesforce" }),
            ],
          },
        ],
        totalGroups: 2,
        totalRecords: 5,
        totalPages: 1,
        currentPage: 1,
      };
      vi.mocked(mockStorage.findGrouped).mockResolvedValue(mockResult);

      const result = await service.getGroupedAssets({ page: 1, limit: 10, sortOrder: "desc" });

      expect(result.data.length).toBe(2);
      expect(result.data[0].applicationName).toBe("AWS Console");
      expect(result.data[0].recordCount).toBe(3);
      expect(result.totalGroups).toBe(2);
      expect(result.totalRecords).toBe(5);
    });

    it("should return empty data array when no groups exist", async () => {
      const mockResult = {
        data: [],
        totalGroups: 0,
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1,
      };
      vi.mocked(mockStorage.findGrouped).mockResolvedValue(mockResult);

      const result = await service.getGroupedAssets({ page: 1, limit: 10, sortOrder: "desc" });

      expect(result.data).toEqual([]);
      expect(result.totalGroups).toBe(0);
      expect(result.totalRecords).toBe(0);
    });

    it("should sanitize negative page number to 1", async () => {
      const mockResult = {
        data: [],
        totalGroups: 0,
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1,
      };
      vi.mocked(mockStorage.findGrouped).mockResolvedValue(mockResult);

      await service.getGroupedAssets({ page: -5, limit: 10, sortOrder: "desc" });

      expect(mockStorage.findGrouped).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1 })
      );
    });

    it("should cap limit at 100", async () => {
      const mockResult = {
        data: [],
        totalGroups: 0,
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1,
      };
      vi.mocked(mockStorage.findGrouped).mockResolvedValue(mockResult);

      await service.getGroupedAssets({ page: 1, limit: 500, sortOrder: "desc" });

      expect(mockStorage.findGrouped).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 100 })
      );
    });

    it("should handle groups with single record", async () => {
      const mockResult = {
        data: [
          {
            applicationName: "Single App",
            recordCount: 1,
            records: [
              createMockAsset({ internalId: 1, applicationname: "Single App" }),
            ],
          },
        ],
        totalGroups: 1,
        totalRecords: 1,
        totalPages: 1,
        currentPage: 1,
      };
      vi.mocked(mockStorage.findGrouped).mockResolvedValue(mockResult);

      const result = await service.getGroupedAssets({ page: 1, limit: 10, sortOrder: "desc" });

      expect(result.data[0].recordCount).toBe(1);
      expect(result.data[0].records.length).toBe(1);
    });

    it("should pass sort order correctly for grouping", async () => {
      const mockResult = {
        data: [],
        totalGroups: 0,
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1,
      };
      vi.mocked(mockStorage.findGrouped).mockResolvedValue(mockResult);

      await service.getGroupedAssets({ page: 1, limit: 10, sortOrder: "asc" });

      expect(mockStorage.findGrouped).toHaveBeenCalledWith(
        expect.objectContaining({ sortOrder: "asc" })
      );
    });

    it("should pass search parameters correctly", async () => {
      const mockResult = {
        data: [],
        totalGroups: 0,
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1,
      };
      vi.mocked(mockStorage.findGrouped).mockResolvedValue(mockResult);

      await service.getGroupedAssets({
        page: 1,
        limit: 10,
        sortOrder: "desc",
        search: "test search",
        searchColumn: "applicationname",
      });

      expect(mockStorage.findGrouped).toHaveBeenCalledWith(
        expect.objectContaining({
          search: "test search",
          searchColumn: "applicationname",
        })
      );
    });

    it("should pass filters correctly", async () => {
      const mockResult = {
        data: [],
        totalGroups: 0,
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1,
      };
      vi.mocked(mockStorage.findGrouped).mockResolvedValue(mockResult);

      await service.getGroupedAssets({
        page: 1,
        limit: 10,
        sortOrder: "desc",
        filters: { status: ["Active", "Pending"] },
      });

      expect(mockStorage.findGrouped).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: { status: ["Active", "Pending"] },
        })
      );
    });
  });
});

describe("Grouped Data Structure", () => {
  it("should calculate group pagination correctly", () => {
    const totalGroups = 25;
    const limit = 10;
    const expectedPages = Math.ceil(totalGroups / limit);
    
    expect(expectedPages).toBe(3);
  });

  it("should handle zero groups", () => {
    const totalGroups = 0;
    const limit = 10;
    const expectedPages = Math.ceil(totalGroups / limit) || 0;
    
    expect(expectedPages).toBe(0);
  });

  it("should calculate group offset correctly", () => {
    const page = 2;
    const limit = 10;
    const offset = (page - 1) * limit;
    
    expect(offset).toBe(10);
  });

  it("should group records by application name", () => {
    const records = [
      createMockAsset({ internalId: 1, applicationname: "App A" }),
      createMockAsset({ internalId: 2, applicationname: "App A" }),
      createMockAsset({ internalId: 3, applicationname: "App B" }),
      createMockAsset({ internalId: 4, applicationname: "App B" }),
      createMockAsset({ internalId: 5, applicationname: "App B" }),
    ];

    const groupedMap = new Map<string, typeof records>();
    for (const record of records) {
      const appName = record.applicationname || "(No Application)";
      if (!groupedMap.has(appName)) {
        groupedMap.set(appName, []);
      }
      groupedMap.get(appName)!.push(record);
    }

    expect(groupedMap.size).toBe(2);
    expect(groupedMap.get("App A")?.length).toBe(2);
    expect(groupedMap.get("App B")?.length).toBe(3);
  });

  it("should handle null application names", () => {
    const records = [
      createMockAsset({ internalId: 1, applicationname: null }),
      createMockAsset({ internalId: 2, applicationname: null }),
    ];

    const groupedMap = new Map<string, typeof records>();
    for (const record of records) {
      const appName = record.applicationname || "(No Application)";
      if (!groupedMap.has(appName)) {
        groupedMap.set(appName, []);
      }
      groupedMap.get(appName)!.push(record);
    }

    expect(groupedMap.size).toBe(1);
    expect(groupedMap.get("(No Application)")?.length).toBe(2);
  });
});
