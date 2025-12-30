import { cmdbStorage, CmdbStorage } from "./cmdb.storage";
import type {
  PaginationParams,
  PaginatedResult,
  CmdbAsset,
  CmdbAssetHistoryResponse,
} from "./cmdb.types";

export class CmdbService {
  constructor(private storage: CmdbStorage = cmdbStorage) {}

  async getAssets(params: PaginationParams): Promise<PaginatedResult<CmdbAsset>> {
    const sanitizedParams = this.sanitizePaginationParams(params);
    return this.storage.findPaginated(sanitizedParams);
  }

  async getAssetById(id: string): Promise<CmdbAsset | null> {
    const trimmedId = id?.trim();
    if (!trimmedId) {
      return null;
    }
    return this.storage.findById(trimmedId);
  }

  async getFilterOptions(): Promise<Record<string, string[]>> {
    return this.storage.getFilterOptions();
  }

  async getAssetHistory(cmdbAssetId: string): Promise<CmdbAssetHistoryResponse> {
    const trimmedId = cmdbAssetId?.trim();
    if (!trimmedId) {
      return { history: [], total: 0 };
    }

    const [history, total] = await Promise.all([
      this.storage.findHistoryByAssetId(trimmedId),
      this.storage.countHistoryByAssetId(trimmedId),
    ]);

    return { history, total };
  }

  private sanitizePaginationParams(params: PaginationParams): PaginationParams {
    return {
      ...params,
      page: Math.max(1, params.page ?? 1),
      limit: Math.min(100, Math.max(1, params.limit ?? 10)),
      filters: this.sanitizeFilters(params.filters),
    };
  }

  private sanitizeFilters(
    filters: Record<string, string[]> | undefined
  ): Record<string, string[]> | undefined {
    if (!filters || Object.keys(filters).length === 0) {
      return undefined;
    }

    const sanitized: Record<string, string[]> = {};
    for (const [key, values] of Object.entries(filters)) {
      const filtered = values.filter((v) => v && v.trim() !== "");
      if (filtered.length > 0) {
        sanitized[key] = filtered;
      }
    }

    return Object.keys(sanitized).length > 0 ? sanitized : undefined;
  }
}

export const cmdbService = new CmdbService();
