import { db } from "../../db";
import { tpiAssets, tpiAssetHistory } from "../../../shared/schema";
import type { TpiAsset, TpiAssetHistory } from "../../../shared/schema";
import { eq, desc, and, sql, or, ilike, asc, type SQL } from "drizzle-orm";
import type { PaginationParams, PaginatedResult } from "./tpi.types";

export class TpiStorage {
  async findById(id: string): Promise<TpiAsset | null> {
    const [asset] = await db.select().from(tpiAssets).where(eq(tpiAssets.id, id));
    return asset ?? null;
  }

  async findPaginated(params: PaginationParams): Promise<PaginatedResult<TpiAsset>> {
    const { page, limit, search, searchColumn, sortBy, sortOrder, filters } = params;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];

    if (search && search.trim()) {
      const searchPattern = `%${search.toLowerCase()}%`;
      if (searchColumn && searchColumn !== "all") {
        const column = (tpiAssets as any)[searchColumn];
        if (column) {
          conditions.push(ilike(column, searchPattern));
        }
      } else {
        conditions.push(
          or(
            ilike(tpiAssets.id, searchPattern),
            ilike(tpiAssets.name, searchPattern),
            ilike(tpiAssets.cmdbStatus, searchPattern),
            ilike(tpiAssets.affinityGroup, searchPattern),
            ilike(tpiAssets.btoAlignment, searchPattern),
            ilike(tpiAssets.itOwnerManagedBy, searchPattern),
            ilike(tpiAssets.businessOwnerOwnedBy, searchPattern),
            ilike(tpiAssets.supportedBy, searchPattern),
            ilike(tpiAssets.owningInternalOrg, searchPattern),
            ilike(tpiAssets.status, searchPattern)
          )!
        );
      }
    }

    if (filters) {
      for (const [key, values] of Object.entries(filters)) {
        if (values && values.length > 0) {
          const column = (tpiAssets as any)[key];
          if (column) {
            conditions.push(or(...values.map((v) => eq(column, v)))!);
          }
        }
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let orderByClause;
    if (sortBy) {
      const column = (tpiAssets as any)[sortBy];
      if (column) {
        orderByClause = sortOrder === "asc" ? asc(column) : desc(column);
      }
    }
    if (!orderByClause) {
      orderByClause = desc(tpiAssets.createdAt);
    }

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(tpiAssets)
      .where(whereClause);
    const totalCount = Number(countResult[0]?.count || 0);

    const data = await db
      .select()
      .from(tpiAssets)
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

  async getFilterOptions(): Promise<Record<string, string[]>> {
    const filterableColumns = [
      "id",
      "name",
      "cmdbStatus",
      "affinityGroup",
      "btoAlignment",
      "owningInternalOrg",
      "status",
      "assetType",
      "appApprModernDelivery",
      "applicationTypeFinancial",
      "architect",
      "assetIdInFAST",
      "assetIdInSchedule",
      "assetIdInWeeklyStatusReport",
      "assetTier",
      "blockFunding",
      "businessOwnerCommsCheck",
      "businessOwnerOwnedBy",
      "businessOwnerSME",
      "cashPaymentSystems",
      "cmdbBeingRetired",
      "cmdbLegalHold",
      "concatinatedBTOandDivision",
      "connectorStatus",
      "cotsOrInHouseBuilt",
      "customerFacing",
      "defaultTier",
      "description",
      "disposition",
      "externalFacing",
      "financialImpact4hrOutage",
      "foundational",
      "highLevelBTO",
      "hosted",
      "infoSecCritical",
      "informationClassification",
      "isSaas",
      "itOwnerCommsCheck",
      "itOwnerManagedBy",
      "keyChainOnboardingStatus",
      "maintenanceWindow",
      "mdAssetDesignation",
      "multiFactorAuthentication",
      "nfr9",
      "nfr10",
      "nonDefaultTier1",
      "nonDefaultTier2",
      "nonDefaultTier3",
      "nonDefaultTier4",
      "onboardingStatus",
      "operationalHours",
      "ppiClassification",
      "privilegedAccess",
      "sox",
      "spof",
      "sppi",
      "supportSME",
      "supportedBy",
      "supportedByCommsCheck",
      "version",
    ];
    const result: Record<string, string[]> = {};

    for (const columnName of filterableColumns) {
      const column = (tpiAssets as any)[columnName];
      if (column) {
        const values = await db
          .selectDistinct({ value: column })
          .from(tpiAssets)
          .where(sql`${column} IS NOT NULL AND ${column} != ''`);
        result[columnName] = values.map((v) => v.value).filter(Boolean).sort();
      }
    }

    return result;
  }

  async findHistoryByAssetId(tpiAssetId: string): Promise<TpiAssetHistory[]> {
    return db
      .select()
      .from(tpiAssetHistory)
      .where(eq(tpiAssetHistory.tpiAssetId, tpiAssetId))
      .orderBy(desc(tpiAssetHistory.endDate), desc(tpiAssetHistory.startDate));
  }

  async countHistoryByAssetId(tpiAssetId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(tpiAssetHistory)
      .where(eq(tpiAssetHistory.tpiAssetId, tpiAssetId));
    return Number(result[0]?.count || 0);
  }
}

export const tpiStorage = new TpiStorage();
