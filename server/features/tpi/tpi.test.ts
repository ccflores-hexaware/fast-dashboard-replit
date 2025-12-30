import { describe, it, expect, vi, beforeEach } from "vitest";
import { TpiService } from "./tpi.service";
import type { TpiStorage } from "./tpi.storage";
import type { TpiAsset, TpiAssetHistory } from "../../../shared/schema";

const createMockAsset = (overrides: Partial<TpiAsset> = {}): TpiAsset => ({
  internalId: 1,
  id: "TPI-001",
  name: "Test Asset",
  cmdbStatus: "Active",
  cmdbBeingRetired: null,
  cmdbLegalHold: null,
  affinityGroup: "Group A",
  btoAlignment: "BTO1",
  version: "1.0",
  infoSecCritical: null,
  spof: null,
  applicationTypeFinancial: null,
  itOwnerManagedBy: "IT Owner",
  businessOwnerOwnedBy: "Business Owner",
  businessOwnerSME: null,
  supportedBy: "Support Team",
  supportSME: null,
  architect: null,
  owningInternalOrg: "Org A",
  blockFunding: null,
  assetType: "Application",
  hosted: null,
  sox: null,
  customerFacing: null,
  sppi: null,
  ppiClassification: null,
  cotsOrInHouseBuilt: null,
  isSaas: null,
  maintenanceWindow: null,
  operationalHours: null,
  description: null,
  externalFacing: null,
  foundational: null,
  defaultTier: null,
  nonDefaultTier1: null,
  nonDefaultTier2: null,
  nonDefaultTier3: null,
  nonDefaultTier4: null,
  assetTier: null,
  informationClassification: null,
  privilegedAccess: null,
  appApprModernDelivery: null,
  cashPaymentSystems: null,
  nfr9: null,
  nfr10: null,
  keyChainOnboardingStatus: null,
  multiFactorAuthentication: null,
  financialImpact4hrOutage: null,
  mdAssetDesignation: null,
  concatinatedBTOandDivision: null,
  highLevelBTO: null,
  itOwnerCommsCheck: null,
  businessOwnerCommsCheck: null,
  supportedByCommsCheck: null,
  assetIdInFAST: null,
  assetIdInSchedule: null,
  assetIdInWeeklyStatusReport: null,
  disposition: null,
  connectorStatus: null,
  onboardingStatus: null,
  status: "Active",
  createdAt: new Date(),
  ...overrides,
});

const createMockHistory = (overrides: Partial<TpiAssetHistory> = {}): TpiAssetHistory => ({
  id: 1,
  tpiAssetId: "TPI-001",
  name: "Test Asset",
  cmdbStatus: "Active",
  cmdbBeingRetired: null,
  cmdbLegalHold: null,
  affinityGroup: "Group A",
  btoAlignment: "BTO1",
  version: "1.0",
  infoSecCritical: null,
  spof: null,
  applicationTypeFinancial: null,
  itOwnerManagedBy: "IT Owner",
  businessOwnerOwnedBy: "Business Owner",
  businessOwnerSME: null,
  supportedBy: "Support Team",
  supportSME: null,
  architect: null,
  owningInternalOrg: "Org A",
  blockFunding: null,
  assetType: "Application",
  hosted: null,
  sox: null,
  customerFacing: null,
  sppi: null,
  ppiClassification: null,
  cotsOrInHouseBuilt: null,
  isSaas: null,
  maintenanceWindow: null,
  operationalHours: null,
  description: null,
  externalFacing: null,
  foundational: null,
  defaultTier: null,
  nonDefaultTier1: null,
  nonDefaultTier2: null,
  nonDefaultTier3: null,
  nonDefaultTier4: null,
  assetTier: null,
  informationClassification: null,
  privilegedAccess: null,
  appApprModernDelivery: null,
  cashPaymentSystems: null,
  nfr9: null,
  nfr10: null,
  keyChainOnboardingStatus: null,
  multiFactorAuthentication: null,
  financialImpact4hrOutage: null,
  mdAssetDesignation: null,
  concatinatedBTOandDivision: null,
  highLevelBTO: null,
  itOwnerCommsCheck: null,
  businessOwnerCommsCheck: null,
  supportedByCommsCheck: null,
  assetIdInFAST: null,
  assetIdInSchedule: null,
  assetIdInWeeklyStatusReport: null,
  disposition: null,
  connectorStatus: null,
  onboardingStatus: null,
  status: "Active",
  startDate: new Date("2024-01-01"),
  endDate: new Date("2024-06-01"),
  ...overrides,
});

const createMockStorage = (): TpiStorage => ({
  findById: vi.fn(),
  findPaginated: vi.fn(),
  getFilterOptions: vi.fn(),
  findHistoryByAssetId: vi.fn(),
  countHistoryByAssetId: vi.fn(),
});

describe("TpiService", () => {
  let mockStorage: ReturnType<typeof createMockStorage>;
  let service: TpiService;

  beforeEach(() => {
    mockStorage = createMockStorage();
    service = new TpiService(mockStorage as unknown as TpiStorage);
  });

  describe("getAssetById", () => {
    it("should return asset when found", async () => {
      const mockAsset = createMockAsset();
      vi.mocked(mockStorage.findById).mockResolvedValue(mockAsset);

      const result = await service.getAssetById("TPI-001");

      expect(result).toEqual(mockAsset);
      expect(mockStorage.findById).toHaveBeenCalledWith("TPI-001");
    });

    it("should return null when asset not found", async () => {
      vi.mocked(mockStorage.findById).mockResolvedValue(null);

      const result = await service.getAssetById("INVALID-ID");

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
      const mockAsset = createMockAsset();
      vi.mocked(mockStorage.findById).mockResolvedValue(mockAsset);

      await service.getAssetById("  TPI-001  ");

      expect(mockStorage.findById).toHaveBeenCalledWith("TPI-001");
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
  });

  describe("getFilterOptions", () => {
    it("should return filter options from storage", async () => {
      const mockOptions = {
        status: ["Active", "Inactive"],
        cmdbStatus: ["Live", "Retired"],
      };
      vi.mocked(mockStorage.getFilterOptions).mockResolvedValue(mockOptions);

      const result = await service.getFilterOptions();

      expect(result).toEqual(mockOptions);
    });
  });

  describe("getAssetHistory", () => {
    it("should return history with total count", async () => {
      const mockHistory = [createMockHistory()];
      vi.mocked(mockStorage.findHistoryByAssetId).mockResolvedValue(mockHistory);
      vi.mocked(mockStorage.countHistoryByAssetId).mockResolvedValue(1);

      const result = await service.getAssetHistory("TPI-001");

      expect(result).toEqual({ history: mockHistory, total: 1 });
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

      await service.getAssetHistory("  TPI-001  ");

      expect(mockStorage.findHistoryByAssetId).toHaveBeenCalledWith("TPI-001");
      expect(mockStorage.countHistoryByAssetId).toHaveBeenCalledWith("TPI-001");
    });
  });
});
