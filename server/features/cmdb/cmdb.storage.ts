import { db } from "../../db";
import { cmdbAssets, cmdbAssetHistory } from "../../../shared/schema";
import type { CmdbAsset, CmdbAssetHistory } from "../../../shared/schema";
import { eq, desc, and, sql, or, ilike, asc, type SQL } from "drizzle-orm";
import type { PaginationParams, PaginatedResult } from "./cmdb.types";

export class CmdbStorage {
  private static readonly SEARCHABLE_COLUMNS = [
    "id",
    "configItem",
    "version",
    "environment",
    "status",
    "owner",
  ] as const;

  private static readonly FILTERABLE_COLUMNS = [
    "id",
    "configItem",
    "environment",
    "status",
    "owner",
    "version",
  ] as const;

  async findById(id: string): Promise<CmdbAsset | null> {
    const [asset] = await db
      .select()
      .from(cmdbAssets)
      .where(eq(cmdbAssets.id, id));
    return asset ?? null;
  }

  async findPaginated(params: PaginationParams): Promise<PaginatedResult<CmdbAsset>> {
    const { page, limit, search, searchColumn, sortBy, sortOrder, filters } = params;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];

    if (search && search.trim()) {
      const searchPattern = `%${search.trim()}%`;

      if (searchColumn && CmdbStorage.SEARCHABLE_COLUMNS.includes(searchColumn as any)) {
        const column = (cmdbAssets as any)[searchColumn];
        if (column) {
          conditions.push(ilike(column, searchPattern));
        }
      } else {
        conditions.push(
          or(
            ilike(cmdbAssets.id, searchPattern),
            ilike(cmdbAssets.configItem, searchPattern),
            ilike(cmdbAssets.version, searchPattern),
            ilike(cmdbAssets.environment, searchPattern),
            ilike(cmdbAssets.status, searchPattern),
            ilike(cmdbAssets.owner, searchPattern)
          )!
        );
      }
    }

    if (filters && Object.keys(filters).length > 0) {
      for (const [key, values] of Object.entries(filters)) {
        if (values && values.length > 0) {
          const column = (cmdbAssets as any)[key];
          if (column) {
            const orConditions = values.map((value) => eq(column, value));
            conditions.push(or(...orConditions)!);
          }
        }
      }
    }

    let orderByClause: SQL;
    if (sortBy && (cmdbAssets as any)[sortBy]) {
      const column = (cmdbAssets as any)[sortBy];
      orderByClause = sortOrder === "asc" ? asc(column) : desc(column);
    } else {
      orderByClause = desc(cmdbAssets.createdAt);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(cmdbAssets)
      .where(whereClause);

    const data = await db
      .select()
      .from(cmdbAssets)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    const totalCount = countResult?.count ?? 0;

    return {
      data,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  }

  async getFilterOptions(): Promise<Record<string, string[]>> {
    const options: Record<string, string[]> = {};

    for (const columnName of CmdbStorage.FILTERABLE_COLUMNS) {
      const column = (cmdbAssets as any)[columnName];
      if (column) {
        const results = await db
          .selectDistinct({ value: column })
          .from(cmdbAssets)
          .where(sql`${column} IS NOT NULL`);
        options[columnName] = results.map((r) => r.value).filter(Boolean);
      }
    }

    return options;
  }

  async findHistoryByAssetId(cmdbAssetId: string): Promise<CmdbAssetHistory[]> {
    return db
      .select()
      .from(cmdbAssetHistory)
      .where(eq(cmdbAssetHistory.cmdbAssetId, cmdbAssetId))
      .orderBy(desc(cmdbAssetHistory.endDate), desc(cmdbAssetHistory.startDate));
  }

  async countHistoryByAssetId(cmdbAssetId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(cmdbAssetHistory)
      .where(eq(cmdbAssetHistory.cmdbAssetId, cmdbAssetId));
    return result?.count ?? 0;
  }

  async bulkInsertHistory(records: Omit<typeof cmdbAssetHistory.$inferInsert, 'id'>[]): Promise<number> {
    if (records.length === 0) return 0;
    
    const result = await db.insert(cmdbAssetHistory).values(records).returning({ id: cmdbAssetHistory.id });
    return result.length;
  }

  async clearAllHistory(): Promise<void> {
    await db.delete(cmdbAssetHistory);
  }
}

export const cmdbStorage = new CmdbStorage();
