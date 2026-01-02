import { reconStorage, ReconStorage } from "./recon.storage";
import type {
  PaginationParams,
  PaginatedResult,
  ReconAsset,
} from "./recon.types";

export class ReconService {
  constructor(private storage: ReconStorage = reconStorage) {}

  async getAssets(params: PaginationParams): Promise<PaginatedResult<ReconAsset>> {
    const sanitizedParams = this.sanitizePaginationParams(params);
    return this.storage.findPaginated(sanitizedParams);
  }

  async getAssetById(id: string): Promise<ReconAsset | null> {
    if (!id || typeof id !== "string" || id.trim() === "") {
      return null;
    }
    return this.storage.findById(id.trim());
  }

  async getFilterOptions(): Promise<Record<string, string[]>> {
    return this.storage.getFilterOptions();
  }

  private sanitizePaginationParams(params: PaginationParams): PaginationParams {
    return {
      page: Math.max(1, Math.floor(params.page || 1)),
      limit: Math.min(100, Math.max(1, Math.floor(params.limit || 10))),
      search: params.search?.trim() || undefined,
      searchColumn: params.searchColumn?.trim() || undefined,
      sortBy: params.sortBy?.trim() || undefined,
      sortOrder: params.sortOrder === "asc" ? "asc" : "desc",
      filters: this.sanitizeFilters(params.filters),
    };
  }

  private sanitizeFilters(
    filters: Record<string, string[]> | undefined
  ): Record<string, string[]> | undefined {
    if (!filters || typeof filters !== "object") {
      return undefined;
    }

    const sanitized: Record<string, string[]> = {};
    for (const [key, values] of Object.entries(filters)) {
      if (Array.isArray(values) && values.length > 0) {
        const cleanValues = values
          .filter((v) => typeof v === "string" && v.trim() !== "")
          .map((v) => v.trim());
        if (cleanValues.length > 0) {
          sanitized[key] = cleanValues;
        }
      }
    }

    return Object.keys(sanitized).length > 0 ? sanitized : undefined;
  }
}

export const reconService = new ReconService();
