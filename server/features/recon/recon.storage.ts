import { db } from "../../db";
import { reconAssets } from "../../../shared/schema";
import type { ReconAsset } from "../../../shared/schema";
import { eq, desc, and, sql, or, ilike, asc, type SQL } from "drizzle-orm";
import type { 
  PaginationParams, 
  PaginatedResult, 
  GroupedReconAsset, 
  GroupedPaginatedResult,
  ApplicationListParams,
  ApplicationListResult,
  ApplicationSummary,
  ApplicationDetailParams,
  ApplicationDetailResult,
  AccountGroupedAsset
} from "./recon.types";

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

  async findApplicationList(params: ApplicationListParams): Promise<ApplicationListResult> {
    const { page, limit, search, status, sortOrder } = params;

    const allData = await db
      .select()
      .from(reconAssets);

    const statusSet = new Set(allData.map(r => r.applicationstatus).filter(Boolean));
    const statusOptions = Array.from(statusSet).sort() as string[];

    const appMap = new Map<string, { status: string | null; count: number }>();
    for (const record of allData) {
      const appName = record.applicationname || "(No Application)";
      if (!appMap.has(appName)) {
        appMap.set(appName, { status: record.applicationstatus, count: 0 });
      }
      appMap.get(appName)!.count++;
    }

    let applications: ApplicationSummary[] = Array.from(appMap.entries())
      .map(([applicationName, { status: appStatus, count }]) => ({
        applicationName,
        applicationStatus: appStatus,
        recordCount: count,
      }));

    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      applications = applications.filter(app => 
        app.applicationName.toLowerCase().includes(searchLower)
      );
    }

    if (status && status.trim()) {
      applications = applications.filter(app => 
        app.applicationStatus === status
      );
    }

    applications.sort((a, b) => 
      sortOrder === "asc" 
        ? a.applicationName.localeCompare(b.applicationName)
        : b.applicationName.localeCompare(a.applicationName)
    );

    const totalCount = applications.length;
    const offset = (page - 1) * limit;
    const paginatedApps = applications.slice(offset, offset + limit);

    return {
      data: paginatedApps,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      statusOptions,
    };
  }

  async findApplicationDetail(params: ApplicationDetailParams): Promise<ApplicationDetailResult> {
    const { applicationName, page, limit, search, sortBy, sortOrder, filters } = params;

    const conditions: SQL[] = [];
    
    if (applicationName === "(No Application)") {
      conditions.push(
        or(
          eq(reconAssets.applicationname, ""),
          sql`${reconAssets.applicationname} IS NULL`
        )!
      );
    } else {
      conditions.push(eq(reconAssets.applicationname, applicationName));
    }

    if (search && search.trim()) {
      const searchPattern = `%${search.toLowerCase()}%`;
      conditions.push(
        or(
          ilike(reconAssets.accountname, searchPattern),
          ilike(reconAssets.entitlementcolumn, searchPattern),
          ilike(reconAssets.entitlementvalue, searchPattern),
          ilike(reconAssets.filepath, searchPattern),
          ilike(reconAssets.applicationstatus, searchPattern),
          ilike(reconAssets.status, searchPattern)
        )!
      );
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
      orderByClause = asc(reconAssets.accountname);
    }

    const allData = await db
      .select()
      .from(reconAssets)
      .where(whereClause)
      .orderBy(orderByClause, desc(reconAssets.internalId));

    const firstRecord = allData[0];
    const applicationStatus = firstRecord?.applicationstatus || null;

    const groupedMap = new Map<string, ReconAsset[]>();
    for (const record of allData) {
      const accName = record.accountname || "(No Account)";
      if (!groupedMap.has(accName)) {
        groupedMap.set(accName, []);
      }
      groupedMap.get(accName)!.push(record);
    }

    const allGroups: AccountGroupedAsset[] = Array.from(groupedMap.entries())
      .sort((a, b) => sortOrder === "asc" ? a[0].localeCompare(b[0]) : b[0].localeCompare(a[0]))
      .map(([accountName, records]) => ({
        accountName,
        recordCount: records.length,
        records,
      }));

    const totalGroups = allGroups.length;
    const totalRecords = allData.length;
    const offset = (page - 1) * limit;
    const paginatedGroups = allGroups.slice(offset, offset + limit);

    return {
      applicationName,
      applicationStatus,
      data: paginatedGroups,
      totalGroups,
      totalRecords,
      totalPages: Math.ceil(totalGroups / limit),
      currentPage: page,
    };
  }

  async getApplicationFilterOptions(applicationName: string): Promise<Record<string, string[]>> {
    const filterableColumns = [
      "accountname",
      "entitlementcolumn",
      "entitlementvalue",
      "filepath",
      "applicationstatus",
      "status",
    ];
    const result: Record<string, string[]> = {};

    const conditions: SQL[] = [];
    if (applicationName === "(No Application)") {
      conditions.push(
        or(
          eq(reconAssets.applicationname, ""),
          sql`${reconAssets.applicationname} IS NULL`
        )!
      );
    } else {
      conditions.push(eq(reconAssets.applicationname, applicationName));
    }
    const whereClause = and(...conditions);

    for (const columnName of filterableColumns) {
      const column = (reconAssets as any)[columnName];
      if (column) {
        const values = await db
          .selectDistinct({ value: column })
          .from(reconAssets)
          .where(and(whereClause, sql`${column} IS NOT NULL AND ${column} != ''`));
        result[columnName] = values.map((v) => v.value).filter(Boolean).sort();
      }
    }

    return result;
  }
}

export const reconStorage = new ReconStorage();
