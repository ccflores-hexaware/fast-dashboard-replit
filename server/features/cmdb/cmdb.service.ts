import { cmdbStorage, CmdbStorage } from "./cmdb.storage";
import type {
  PaginationParams,
  PaginatedResult,
  CmdbAsset,
  CmdbAssetHistoryResponse,
} from "./cmdb.types";
import * as XLSX from "xlsx";

export interface HistoryUploadResult {
  success: boolean;
  insertedCount: number;
  errors: Array<{ row: number; message: string }>;
  totalRows: number;
}

export interface ParsedHistoryRow {
  cmdbAssetId: string;
  configItem: string | null;
  version: string | null;
  environment: string | null;
  status: string | null;
  owner: string | null;
  lastUpdated: string | null;
  startDate: Date;
  endDate: Date;
}

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

  async uploadHistoryFromFile(fileBuffer: Buffer, replaceExisting: boolean = false): Promise<HistoryUploadResult> {
    const errors: Array<{ row: number; message: string }> = [];
    const validRecords: ParsedHistoryRow[] = [];

    try {
      const workbook = XLSX.read(fileBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { defval: null });

      if (data.length === 0) {
        return { success: false, insertedCount: 0, errors: [{ row: 0, message: "File is empty" }], totalRows: 0 };
      }

      for (let i = 0; i < data.length; i++) {
        const row = data[i] as Record<string, unknown>;
        const rowNumber = i + 2;

        try {
          const parsed = this.parseHistoryRow(row, rowNumber);
          validRecords.push(parsed);
        } catch (error) {
          errors.push({ row: rowNumber, message: error instanceof Error ? error.message : "Unknown error" });
        }
      }

      if (validRecords.length === 0) {
        return { success: false, insertedCount: 0, errors, totalRows: data.length };
      }

      if (replaceExisting) {
        await this.storage.clearAllHistory();
      }

      const insertedCount = await this.storage.bulkInsertHistory(validRecords);

      return {
        success: true,
        insertedCount,
        errors,
        totalRows: data.length,
      };
    } catch (error) {
      return {
        success: false,
        insertedCount: 0,
        errors: [{ row: 0, message: error instanceof Error ? error.message : "Failed to parse file" }],
        totalRows: 0,
      };
    }
  }

  private parseHistoryRow(row: Record<string, unknown>, rowNumber: number): ParsedHistoryRow {
    const cmdbAssetId = this.getStringValue(row, ["cmdbAssetId", "cmdb_asset_id", "CI ID", "Asset ID", "ID"]);
    if (!cmdbAssetId) {
      throw new Error("Missing required field: cmdbAssetId (or CI ID/Asset ID)");
    }

    const startDateRaw = this.getDateValue(row, ["startDate", "start_date", "Start Date"]);
    const endDateRaw = this.getDateValue(row, ["endDate", "end_date", "End Date"]);

    if (!startDateRaw) {
      throw new Error("Missing required field: startDate");
    }
    if (!endDateRaw) {
      throw new Error("Missing required field: endDate");
    }

    return {
      cmdbAssetId,
      configItem: this.getStringValue(row, ["configItem", "config_item", "Config Item"]),
      version: this.getStringValue(row, ["version", "Version"]),
      environment: this.getStringValue(row, ["environment", "Environment"]),
      status: this.getStringValue(row, ["status", "Status"]),
      owner: this.getStringValue(row, ["owner", "Owner"]),
      lastUpdated: this.getStringValue(row, ["lastUpdated", "last_updated", "Last Updated"]),
      startDate: startDateRaw,
      endDate: endDateRaw,
    };
  }

  private getStringValue(row: Record<string, unknown>, keys: string[]): string | null {
    for (const key of keys) {
      const value = row[key];
      if (value !== null && value !== undefined && value !== "") {
        return String(value).trim();
      }
    }
    return null;
  }

  private getDateValue(row: Record<string, unknown>, keys: string[]): Date | null {
    for (const key of keys) {
      const value = row[key];
      if (value !== null && value !== undefined && value !== "") {
        if (typeof value === "number") {
          const date = XLSX.SSF.parse_date_code(value);
          return new Date(date.y, date.m - 1, date.d, date.H || 0, date.M || 0, date.S || 0);
        }
        const parsed = new Date(String(value));
        if (!isNaN(parsed.getTime())) {
          return parsed;
        }
      }
    }
    return null;
  }

  generateHistoryTemplate(): Buffer {
    const templateData = [
      {
        cmdbAssetId: "EXAMPLE-001",
        configItem: "Example Config Item",
        version: "1.0",
        environment: "Production",
        status: "Active",
        owner: "John Doe",
        lastUpdated: "2024-01-01",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      },
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    
    worksheet["!cols"] = [
      { width: 15 }, { width: 25 }, { width: 10 },
      { width: 15 }, { width: 10 }, { width: 15 },
      { width: 15 }, { width: 15 }, { width: 15 },
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "CMDB History Template");
    return Buffer.from(XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }));
  }
}

export const cmdbService = new CmdbService();
