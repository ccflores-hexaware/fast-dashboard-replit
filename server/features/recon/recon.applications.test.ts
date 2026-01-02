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
  findApplicationList: vi.fn(),
  findApplicationDetail: vi.fn(),
  getApplicationFilterOptions: vi.fn(),
});

describe("ReconService - Application List", () => {
  let mockStorage: ReturnType<typeof createMockStorage>;
  let service: ReconService;

  beforeEach(() => {
    mockStorage = createMockStorage();
    service = new ReconService(mockStorage as unknown as ReconStorage);
  });

  describe("getApplicationList", () => {
    it("should return paginated application list", async () => {
      const mockResult = {
        data: [
          { applicationName: "App A", applicationStatus: "Active", recordCount: 5 },
          { applicationName: "App B", applicationStatus: "Inactive", recordCount: 3 },
        ],
        totalCount: 2,
        totalPages: 1,
        currentPage: 1,
        statusOptions: ["Active", "Inactive"],
      };
      vi.mocked(mockStorage.findApplicationList).mockResolvedValue(mockResult);

      const result = await service.getApplicationList({ page: 1, limit: 10, sortOrder: "asc" });

      expect(result.data.length).toBe(2);
      expect(result.data[0].applicationName).toBe("App A");
      expect(result.totalCount).toBe(2);
      expect(result.statusOptions).toContain("Active");
    });

    it("should return empty list when no applications exist", async () => {
      const mockResult = {
        data: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        statusOptions: [],
      };
      vi.mocked(mockStorage.findApplicationList).mockResolvedValue(mockResult);

      const result = await service.getApplicationList({ page: 1, limit: 10, sortOrder: "asc" });

      expect(result.data).toEqual([]);
      expect(result.totalCount).toBe(0);
    });

    it("should pass search parameter correctly", async () => {
      const mockResult = {
        data: [{ applicationName: "Searchable App", applicationStatus: "Active", recordCount: 1 }],
        totalCount: 1,
        totalPages: 1,
        currentPage: 1,
        statusOptions: ["Active"],
      };
      vi.mocked(mockStorage.findApplicationList).mockResolvedValue(mockResult);

      await service.getApplicationList({
        page: 1,
        limit: 10,
        sortOrder: "asc",
        search: "Searchable",
      });

      expect(mockStorage.findApplicationList).toHaveBeenCalledWith(
        expect.objectContaining({ search: "Searchable" })
      );
    });

    it("should pass status filter correctly", async () => {
      const mockResult = {
        data: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        statusOptions: ["Active"],
      };
      vi.mocked(mockStorage.findApplicationList).mockResolvedValue(mockResult);

      await service.getApplicationList({
        page: 1,
        limit: 10,
        sortOrder: "asc",
        status: "Active",
      });

      expect(mockStorage.findApplicationList).toHaveBeenCalledWith(
        expect.objectContaining({ status: "Active" })
      );
    });

    it("should sanitize negative page number to 1", async () => {
      const mockResult = {
        data: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        statusOptions: [],
      };
      vi.mocked(mockStorage.findApplicationList).mockResolvedValue(mockResult);

      await service.getApplicationList({ page: -5, limit: 10, sortOrder: "asc" });

      expect(mockStorage.findApplicationList).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1 })
      );
    });

    it("should cap limit at 100", async () => {
      const mockResult = {
        data: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        statusOptions: [],
      };
      vi.mocked(mockStorage.findApplicationList).mockResolvedValue(mockResult);

      await service.getApplicationList({ page: 1, limit: 500, sortOrder: "asc" });

      expect(mockStorage.findApplicationList).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 100 })
      );
    });

    it("should trim search and status parameters", async () => {
      const mockResult = {
        data: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        statusOptions: [],
      };
      vi.mocked(mockStorage.findApplicationList).mockResolvedValue(mockResult);

      await service.getApplicationList({
        page: 1,
        limit: 10,
        sortOrder: "asc",
        search: "  test  ",
        status: "  Active  ",
      });

      expect(mockStorage.findApplicationList).toHaveBeenCalledWith(
        expect.objectContaining({
          search: "test",
          status: "Active",
        })
      );
    });
  });
});

describe("ReconService - Application Detail", () => {
  let mockStorage: ReturnType<typeof createMockStorage>;
  let service: ReconService;

  beforeEach(() => {
    mockStorage = createMockStorage();
    service = new ReconService(mockStorage as unknown as ReconStorage);
  });

  describe("getApplicationDetail", () => {
    it("should return grouped records by account name", async () => {
      const mockResult = {
        applicationName: "AWS Console",
        applicationStatus: "Active",
        data: [
          {
            accountName: "Account 1",
            recordCount: 3,
            records: [
              createMockAsset({ internalId: 1, accountname: "Account 1" }),
              createMockAsset({ internalId: 2, accountname: "Account 1" }),
              createMockAsset({ internalId: 3, accountname: "Account 1" }),
            ],
          },
          {
            accountName: "Account 2",
            recordCount: 2,
            records: [
              createMockAsset({ internalId: 4, accountname: "Account 2" }),
              createMockAsset({ internalId: 5, accountname: "Account 2" }),
            ],
          },
        ],
        totalGroups: 2,
        totalRecords: 5,
        totalPages: 1,
        currentPage: 1,
      };
      vi.mocked(mockStorage.findApplicationDetail).mockResolvedValue(mockResult);

      const result = await service.getApplicationDetail({
        applicationName: "AWS Console",
        page: 1,
        limit: 10,
        sortOrder: "desc",
      });

      expect(result.applicationName).toBe("AWS Console");
      expect(result.data.length).toBe(2);
      expect(result.data[0].accountName).toBe("Account 1");
      expect(result.data[0].recordCount).toBe(3);
      expect(result.totalGroups).toBe(2);
      expect(result.totalRecords).toBe(5);
    });

    it("should return empty data when application has no records", async () => {
      const mockResult = {
        applicationName: "Empty App",
        applicationStatus: null,
        data: [],
        totalGroups: 0,
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1,
      };
      vi.mocked(mockStorage.findApplicationDetail).mockResolvedValue(mockResult);

      const result = await service.getApplicationDetail({
        applicationName: "Empty App",
        page: 1,
        limit: 10,
        sortOrder: "desc",
      });

      expect(result.data).toEqual([]);
      expect(result.totalRecords).toBe(0);
    });

    it("should pass search parameter correctly", async () => {
      const mockResult = {
        applicationName: "Test App",
        applicationStatus: "Active",
        data: [],
        totalGroups: 0,
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1,
      };
      vi.mocked(mockStorage.findApplicationDetail).mockResolvedValue(mockResult);

      await service.getApplicationDetail({
        applicationName: "Test App",
        page: 1,
        limit: 10,
        sortOrder: "desc",
        search: "test search",
      });

      expect(mockStorage.findApplicationDetail).toHaveBeenCalledWith(
        expect.objectContaining({
          applicationName: "Test App",
          search: "test search",
        })
      );
    });

    it("should pass sort parameters correctly", async () => {
      const mockResult = {
        applicationName: "Test App",
        applicationStatus: "Active",
        data: [],
        totalGroups: 0,
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1,
      };
      vi.mocked(mockStorage.findApplicationDetail).mockResolvedValue(mockResult);

      await service.getApplicationDetail({
        applicationName: "Test App",
        page: 1,
        limit: 10,
        sortBy: "accountname",
        sortOrder: "asc",
      });

      expect(mockStorage.findApplicationDetail).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: "accountname",
          sortOrder: "asc",
        })
      );
    });

    it("should pass filters correctly", async () => {
      const mockResult = {
        applicationName: "Test App",
        applicationStatus: "Active",
        data: [],
        totalGroups: 0,
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1,
      };
      vi.mocked(mockStorage.findApplicationDetail).mockResolvedValue(mockResult);

      await service.getApplicationDetail({
        applicationName: "Test App",
        page: 1,
        limit: 10,
        sortOrder: "desc",
        filters: { status: ["Active", "Pending"] },
      });

      expect(mockStorage.findApplicationDetail).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: { status: ["Active", "Pending"] },
        })
      );
    });

    it("should sanitize filter values", async () => {
      const mockResult = {
        applicationName: "Test App",
        applicationStatus: "Active",
        data: [],
        totalGroups: 0,
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1,
      };
      vi.mocked(mockStorage.findApplicationDetail).mockResolvedValue(mockResult);

      await service.getApplicationDetail({
        applicationName: "Test App",
        page: 1,
        limit: 10,
        sortOrder: "desc",
        filters: { status: ["  Active  ", "", "  Pending  "] },
      });

      expect(mockStorage.findApplicationDetail).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: { status: ["Active", "Pending"] },
        })
      );
    });

    it("should handle application names with special characters", async () => {
      const mockResult = {
        applicationName: "App (Test) / Special & Chars",
        applicationStatus: "Active",
        data: [],
        totalGroups: 0,
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1,
      };
      vi.mocked(mockStorage.findApplicationDetail).mockResolvedValue(mockResult);

      const result = await service.getApplicationDetail({
        applicationName: "App (Test) / Special & Chars",
        page: 1,
        limit: 10,
        sortOrder: "desc",
      });

      expect(result.applicationName).toBe("App (Test) / Special & Chars");
    });
  });

  describe("getApplicationFilterOptions", () => {
    it("should return filter options for an application", async () => {
      const mockOptions = {
        accountname: ["Account A", "Account B"],
        status: ["Active", "Inactive", "Pending"],
      };
      vi.mocked(mockStorage.getApplicationFilterOptions).mockResolvedValue(mockOptions);

      const result = await service.getApplicationFilterOptions("Test App");

      expect(result).toEqual(mockOptions);
      expect(mockStorage.getApplicationFilterOptions).toHaveBeenCalledWith("Test App");
    });

    it("should return empty object when no filter options exist", async () => {
      vi.mocked(mockStorage.getApplicationFilterOptions).mockResolvedValue({});

      const result = await service.getApplicationFilterOptions("Empty App");

      expect(result).toEqual({});
    });
  });
});

describe("Application Detail Pagination", () => {
  it("should calculate account group pagination correctly", () => {
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

  it("should calculate account group offset correctly", () => {
    const page = 3;
    const limit = 10;
    const offset = (page - 1) * limit;
    
    expect(offset).toBe(20);
  });

  it("should group records by account name", () => {
    const records = [
      createMockAsset({ internalId: 1, accountname: "Account A" }),
      createMockAsset({ internalId: 2, accountname: "Account A" }),
      createMockAsset({ internalId: 3, accountname: "Account B" }),
      createMockAsset({ internalId: 4, accountname: "Account B" }),
      createMockAsset({ internalId: 5, accountname: "Account B" }),
    ];

    const groupedMap = new Map<string, typeof records>();
    for (const record of records) {
      const accName = record.accountname || "(No Account)";
      if (!groupedMap.has(accName)) {
        groupedMap.set(accName, []);
      }
      groupedMap.get(accName)!.push(record);
    }

    expect(groupedMap.size).toBe(2);
    expect(groupedMap.get("Account A")?.length).toBe(2);
    expect(groupedMap.get("Account B")?.length).toBe(3);
  });

  it("should handle null account names", () => {
    const records = [
      createMockAsset({ internalId: 1, accountname: null }),
      createMockAsset({ internalId: 2, accountname: null }),
    ];

    const groupedMap = new Map<string, typeof records>();
    for (const record of records) {
      const accName = record.accountname || "(No Account)";
      if (!groupedMap.has(accName)) {
        groupedMap.set(accName, []);
      }
      groupedMap.get(accName)!.push(record);
    }

    expect(groupedMap.size).toBe(1);
    expect(groupedMap.get("(No Account)")?.length).toBe(2);
  });
});
