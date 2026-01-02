import { db } from "../../db";
import { reconAssets } from "../../../shared/schema";
import type { ReconAsset } from "../../../shared/schema";
import { eq, desc, and, sql, or, ilike, asc, type SQL } from "drizzle-orm";
import type { PaginationParams, PaginatedResult, GroupedReconAsset, GroupedPaginatedResult } from "./recon.types";

export class ReconStorage {
  async findByInternalId(internalId: number): Promise<ReconAsset | null> {
    const [asset] = await db.select().from(reconAssets).where(eq(reconAssets.internalId, internalId));
    return asset ?? null;
  }

  async findPaginated(params: PaginationParams): Promise<PaginatedResult<ReconAsset>> {
    const { page, limit, search, searchColumn, sortBy, sortOrder, filters } = params;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];

    if (search && search.trim()) {
      const searchPattern = `%${search.toLowerCase()}%`;
      if (searchColumn && searchColumn !== "all") {
        const column = (reconAssets as any)[searchColumn];
        if (column) {
          conditions.push(ilike(column, searchPattern));
        }
      } else {
        conditions.push(
          or(
            ilike(reconAssets.applicationname, searchPattern),
            ilike(reconAssets.accountname, searchPattern),
            ilike(reconAssets.entitlementcolumn, searchPattern),
            ilike(reconAssets.entitlementvalue, searchPattern),
            ilike(reconAssets.filepath, searchPattern),
            ilike(reconAssets.applicationstatus, searchPattern),
            ilike(reconAssets.status, searchPattern)
          )!
        );
      }
    }

    if (filters) {
      for (const [key, values] of Object.entries(filters)) {
        if (values && values.length > 0) {
          const column = (reconAssets as any)[key];
          if (column) {
            conditions.push(or(...values.map((v) => eq(column, v)))!);
          }
        }
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let orderByClause;
    if (sortBy) {
      const column = (reconAssets as any)[sortBy];
      if (column) {
        orderByClause = sortOrder === "asc" ? asc(column) : desc(column);
      }
    }
    if (!orderByClause) {
      orderByClause = desc(reconAssets.internalId);
    }

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(reconAssets)
      .where(whereClause);
    const totalCount = Number(countResult[0]?.count || 0);

    const data = await db
      .select()
      .from(reconAssets)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    return {
      data,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  }

  async findGrouped(params: PaginationParams): Promise<GroupedPaginatedResult> {
    const { page, limit, search, searchColumn, sortOrder, filters } = params;

    const conditions: SQL[] = [];

    if (search && search.trim()) {
      const searchPattern = `%${search.toLowerCase()}%`;
      if (searchColumn && searchColumn !== "all") {
        const column = (reconAssets as any)[searchColumn];
        if (column) {
          conditions.push(ilike(column, searchPattern));
        }
      } else {
        conditions.push(
          or(
            ilike(reconAssets.applicationname, searchPattern),
            ilike(reconAssets.accountname, searchPattern),
            ilike(reconAssets.entitlementcolumn, searchPattern),
            ilike(reconAssets.entitlementvalue, searchPattern),
            ilike(reconAssets.filepath, searchPattern),
            ilike(reconAssets.applicationstatus, searchPattern),
            ilike(reconAssets.status, searchPattern)
          )!
        );
      }
    }

    if (filters) {
      for (const [key, values] of Object.entries(filters)) {
        if (values && values.length > 0) {
          const column = (reconAssets as any)[key];
          if (column) {
            conditions.push(or(...values.map((v) => eq(column, v)))!);
          }
        }
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const allData = await db
      .select()
      .from(reconAssets)
      .where(whereClause)
      .orderBy(
        sortOrder === "asc" ? asc(reconAssets.applicationname) : desc(reconAssets.applicationname),
        desc(reconAssets.internalId)
      );

    const groupedMap = new Map<string, ReconAsset[]>();
    for (const record of allData) {
      const appName = record.applicationname || "(No Application)";
      if (!groupedMap.has(appName)) {
        groupedMap.set(appName, []);
      }
      groupedMap.get(appName)!.push(record);
    }

    const allGroups: GroupedReconAsset[] = Array.from(groupedMap.entries())
      .sort((a, b) => sortOrder === "asc" ? a[0].localeCompare(b[0]) : b[0].localeCompare(a[0]))
      .map(([applicationName, records]) => ({
        applicationName,
        recordCount: records.length,
        records,
      }));

    const totalGroups = allGroups.length;
    const totalRecords = allData.length;
    const offset = (page - 1) * limit;
    const paginatedGroups = allGroups.slice(offset, offset + limit);

    return {
      data: paginatedGroups,
      totalGroups,
      totalRecords,
      totalPages: Math.ceil(totalGroups / limit),
      currentPage: page,
    };
  }

  async getFilterOptions(): Promise<Record<string, string[]>> {
    const filterableColumns = [
      "applicationname",
      "accountname",
      "entitlementcolumn",
      "entitlementvalue",
      "filepath",
      "applicationstatus",
      "status",
    ];
    const result: Record<string, string[]> = {};

    for (const columnName of filterableColumns) {
      const column = (reconAssets as any)[columnName];
      if (column) {
        const values = await db
          .selectDistinct({ value: column })
          .from(reconAssets)
          .where(sql`${column} IS NOT NULL AND ${column} != ''`);
        result[columnName] = values.map((v) => v.value).filter(Boolean).sort();
      }
    }

    return result;
  }
}

export const reconStorage = new ReconStorage();
