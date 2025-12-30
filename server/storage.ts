import { 
  type User, type InsertUser, users,
  type FastAsset, type InsertFastAsset, fastAssets,
  type TpiAsset, type InsertTpiAsset, tpiAssets,
  type TpiAssetHistory, type InsertTpiAssetHistory, tpiAssetHistory,
  type CmdbAsset, type InsertCmdbAsset, cmdbAssets,
  type CmdbAssetHistory, type InsertCmdbAssetHistory, cmdbAssetHistory,
  type AssetActivity, type InsertAssetActivity, assetActivity,
  type SubAsset, type InsertSubAsset, subAssets,
  type BtoMapping, btoMapping
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, or, ilike, SQL, asc } from "drizzle-orm";

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  searchColumn?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, string[]>;
}

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllFastAssets(): Promise<(FastAsset & { isSubAsset: boolean })[]>;
  getFastAssetById(id: string): Promise<FastAsset[]>;
  createFastAsset(asset: InsertFastAsset): Promise<FastAsset>;
  updateFastAsset(internalId: number, asset: Partial<InsertFastAsset>): Promise<FastAsset | undefined>;
  deleteFastAsset(internalId: number): Promise<boolean>;
  
  getAllTpiAssets(): Promise<TpiAsset[]>;
  getTpiAssetsPaginated(params: PaginationParams): Promise<PaginatedResult<TpiAsset>>;
  getTpiAssetById(id: string): Promise<TpiAsset | undefined>;
  createTpiAsset(asset: InsertTpiAsset): Promise<TpiAsset>;
  updateTpiAsset(id: string, asset: Partial<InsertTpiAsset>): Promise<TpiAsset | undefined>;
  deleteTpiAsset(id: string): Promise<boolean>;
  getTpiFilterOptions(): Promise<Record<string, string[]>>;
  
  getAllCmdbAssets(): Promise<CmdbAsset[]>;
  getCmdbAssetsPaginated(params: PaginationParams): Promise<PaginatedResult<CmdbAsset>>;
  getCmdbAssetById(id: string): Promise<CmdbAsset | undefined>;
  createCmdbAsset(asset: InsertCmdbAsset): Promise<CmdbAsset>;
  updateCmdbAsset(id: string, asset: Partial<InsertCmdbAsset>): Promise<CmdbAsset | undefined>;
  deleteCmdbAsset(id: string): Promise<boolean>;
  getCmdbFilterOptions(): Promise<Record<string, string[]>>;
  
  getAssetActivities(assetId: string): Promise<AssetActivity[]>;
  createAssetActivity(activity: InsertAssetActivity): Promise<AssetActivity>;
  
  getTpiAssetHistory(tpiAssetId: string): Promise<TpiAssetHistory[]>;
  getTpiAssetHistoryCount(tpiAssetId: string): Promise<number>;
  
  getCmdbAssetHistory(cmdbAssetId: string): Promise<CmdbAssetHistory[]>;
  getCmdbAssetHistoryCount(cmdbAssetId: string): Promise<number>;
  
  getAllSubAssets(): Promise<SubAsset[]>;
  getSubAssetById(internalId: number): Promise<SubAsset | undefined>;
  getSubAssetsByParentId(parentAssetId: string): Promise<SubAsset[]>;
  createSubAsset(asset: InsertSubAsset): Promise<SubAsset>;
  updateSubAsset(internalId: number, asset: Partial<InsertSubAsset>): Promise<SubAsset | undefined>;
  getNextSubAssetNumber(baseAssetId: string): Promise<number>;
  getSubAssetCounts(): Promise<Record<string, number>>;
  
  getBtoSummary(): Promise<{ higherLevelBto: string; bto: string | null; division: string | null; totalAssets: number }[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllFastAssets(): Promise<(FastAsset & { isSubAsset: boolean })[]> {
    const results = await db
      .select({
        asset: fastAssets,
        subAssetId: subAssets.assetId,
      })
      .from(fastAssets)
      .leftJoin(subAssets, eq(fastAssets.id, subAssets.assetId))
      .orderBy(desc(fastAssets.createdAt));
    
    return results.map(row => ({
      ...row.asset,
      isSubAsset: row.subAssetId !== null,
    }));
  }

  async getFastAssetById(id: string): Promise<FastAsset[]> {
    return db.select().from(fastAssets).where(eq(fastAssets.id, id));
  }

  async createFastAsset(asset: InsertFastAsset): Promise<FastAsset> {
    const [newAsset] = await db.insert(fastAssets).values(asset).returning();
    return newAsset;
  }

  async updateFastAsset(internalId: number, asset: Partial<InsertFastAsset>): Promise<FastAsset | undefined> {
    const [updated] = await db.update(fastAssets)
      .set(asset)
      .where(eq(fastAssets.internalId, internalId))
      .returning();
    return updated;
  }

  async deleteFastAsset(internalId: number): Promise<boolean> {
    const result = await db.delete(fastAssets).where(eq(fastAssets.internalId, internalId));
    return true;
  }

  async getAllTpiAssets(): Promise<TpiAsset[]> {
    return db.select().from(tpiAssets).orderBy(desc(tpiAssets.createdAt));
  }

  async getTpiAssetsPaginated(params: PaginationParams): Promise<PaginatedResult<TpiAsset>> {
    const { page, limit, search, searchColumn, sortBy, sortOrder, filters } = params;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];

    if (search && search.trim()) {
      const searchPattern = `%${search.toLowerCase()}%`;
      if (searchColumn && searchColumn !== 'all') {
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
            conditions.push(
              or(...values.map(v => eq(column, v)))!
            );
          }
        }
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let orderByClause;
    if (sortBy) {
      const column = (tpiAssets as any)[sortBy];
      if (column) {
        orderByClause = sortOrder === 'asc' ? asc(column) : desc(column);
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

  async getTpiFilterOptions(): Promise<Record<string, string[]>> {
    const filterableColumns = [
      'id', 'name', 'cmdbStatus', 'affinityGroup', 'btoAlignment', 'owningInternalOrg', 'status', 'assetType',
      'appApprModernDelivery', 'applicationTypeFinancial', 'architect', 'assetIdInFAST',
      'assetIdInSchedule', 'assetIdInWeeklyStatusReport', 'assetTier', 'blockFunding',
      'businessOwnerCommsCheck', 'businessOwnerOwnedBy', 'businessOwnerSME', 'cashPaymentSystems',
      'cmdbBeingRetired', 'cmdbLegalHold', 'concatinatedBTOandDivision', 'connectorStatus',
      'cotsOrInHouseBuilt', 'customerFacing', 'defaultTier', 'description', 'disposition', 'externalFacing',
      'financialImpact4hrOutage', 'foundational', 'highLevelBTO', 'hosted', 'infoSecCritical',
      'informationClassification', 'isSaas', 'itOwnerCommsCheck', 'itOwnerManagedBy',
      'keyChainOnboardingStatus', 'maintenanceWindow', 'mdAssetDesignation', 'multiFactorAuthentication',
      'nfr9', 'nfr10', 'nonDefaultTier1', 'nonDefaultTier2', 'nonDefaultTier3', 'nonDefaultTier4',
      'onboardingStatus', 'operationalHours', 'ppiClassification', 'privilegedAccess', 'sox',
      'spof', 'sppi', 'supportSME', 'supportedBy', 'supportedByCommsCheck', 'version'
    ];
    const result: Record<string, string[]> = {};

    for (const columnName of filterableColumns) {
      const column = (tpiAssets as any)[columnName];
      if (column) {
        const values = await db
          .selectDistinct({ value: column })
          .from(tpiAssets)
          .where(sql`${column} IS NOT NULL AND ${column} != ''`);
        result[columnName] = values.map(v => v.value).filter(Boolean).sort();
      }
    }

    return result;
  }

  async getTpiAssetById(id: string): Promise<TpiAsset | undefined> {
    const [asset] = await db.select().from(tpiAssets).where(eq(tpiAssets.id, id));
    return asset;
  }

  async createTpiAsset(asset: InsertTpiAsset): Promise<TpiAsset> {
    const [newAsset] = await db.insert(tpiAssets).values(asset).returning();
    return newAsset;
  }

  async updateTpiAsset(id: string, asset: Partial<InsertTpiAsset>): Promise<TpiAsset | undefined> {
    const [updated] = await db.update(tpiAssets)
      .set(asset)
      .where(eq(tpiAssets.id, id))
      .returning();
    return updated;
  }

  async deleteTpiAsset(id: string): Promise<boolean> {
    await db.delete(tpiAssets).where(eq(tpiAssets.id, id));
    return true;
  }

  async getAllCmdbAssets(): Promise<CmdbAsset[]> {
    return db.select().from(cmdbAssets).orderBy(desc(cmdbAssets.createdAt));
  }

  async getCmdbAssetsPaginated(params: PaginationParams): Promise<PaginatedResult<CmdbAsset>> {
    const { page, limit, search, searchColumn, sortBy, sortOrder, filters } = params;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];

    if (search && search.trim()) {
      const searchPattern = `%${search.toLowerCase()}%`;
      if (searchColumn && searchColumn !== 'all') {
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

    if (filters) {
      for (const [key, values] of Object.entries(filters)) {
        if (values && values.length > 0) {
          const column = (cmdbAssets as any)[key];
          if (column) {
            conditions.push(
              or(...values.map(v => eq(column, v)))!
            );
          }
        }
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let orderByClause;
    if (sortBy) {
      const column = (cmdbAssets as any)[sortBy];
      if (column) {
        orderByClause = sortOrder === 'asc' ? asc(column) : desc(column);
      }
    }
    if (!orderByClause) {
      orderByClause = desc(cmdbAssets.createdAt);
    }

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(cmdbAssets)
      .where(whereClause);
    const totalCount = Number(countResult[0]?.count || 0);

    const data = await db
      .select()
      .from(cmdbAssets)
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

  async getCmdbFilterOptions(): Promise<Record<string, string[]>> {
    const filterableColumns = ['id', 'status', 'environment', 'owner', 'configItem', 'version'];
    const result: Record<string, string[]> = {};

    for (const columnName of filterableColumns) {
      const column = (cmdbAssets as any)[columnName];
      if (column) {
        const values = await db
          .selectDistinct({ value: column })
          .from(cmdbAssets)
          .where(sql`${column} IS NOT NULL AND ${column} != ''`);
        result[columnName] = values.map(v => v.value).filter(Boolean).sort();
      }
    }

    return result;
  }

  async getCmdbAssetById(id: string): Promise<CmdbAsset | undefined> {
    const [asset] = await db.select().from(cmdbAssets).where(eq(cmdbAssets.id, id));
    return asset;
  }

  async createCmdbAsset(asset: InsertCmdbAsset): Promise<CmdbAsset> {
    const [newAsset] = await db.insert(cmdbAssets).values(asset).returning();
    return newAsset;
  }

  async updateCmdbAsset(id: string, asset: Partial<InsertCmdbAsset>): Promise<CmdbAsset | undefined> {
    const [updated] = await db.update(cmdbAssets)
      .set(asset)
      .where(eq(cmdbAssets.id, id))
      .returning();
    return updated;
  }

  async deleteCmdbAsset(id: string): Promise<boolean> {
    await db.delete(cmdbAssets).where(eq(cmdbAssets.id, id));
    return true;
  }

  async getAssetActivities(assetId: string): Promise<AssetActivity[]> {
    return db.select().from(assetActivity)
      .where(eq(assetActivity.assetId, assetId))
      .orderBy(desc(assetActivity.modifiedDate));
  }

  async createAssetActivity(activity: InsertAssetActivity): Promise<AssetActivity> {
    const [newActivity] = await db.insert(assetActivity).values(activity).returning();
    return newActivity;
  }

  async getTpiAssetHistory(tpiAssetId: string): Promise<TpiAssetHistory[]> {
    return db.select().from(tpiAssetHistory)
      .where(eq(tpiAssetHistory.tpiAssetId, tpiAssetId))
      .orderBy(desc(tpiAssetHistory.endDate), desc(tpiAssetHistory.startDate));
  }

  async getTpiAssetHistoryCount(tpiAssetId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(tpiAssetHistory)
      .where(eq(tpiAssetHistory.tpiAssetId, tpiAssetId));
    return Number(result[0]?.count || 0);
  }

  async getCmdbAssetHistory(cmdbAssetId: string): Promise<CmdbAssetHistory[]> {
    return db.select().from(cmdbAssetHistory)
      .where(eq(cmdbAssetHistory.cmdbAssetId, cmdbAssetId))
      .orderBy(desc(cmdbAssetHistory.endDate), desc(cmdbAssetHistory.startDate));
  }

  async getCmdbAssetHistoryCount(cmdbAssetId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(cmdbAssetHistory)
      .where(eq(cmdbAssetHistory.cmdbAssetId, cmdbAssetId));
    return Number(result[0]?.count || 0);
  }

  async getAllSubAssets(): Promise<SubAsset[]> {
    return db.select().from(subAssets).orderBy(desc(subAssets.createdAt));
  }

  async getSubAssetById(internalId: number): Promise<SubAsset | undefined> {
    const [asset] = await db.select().from(subAssets).where(eq(subAssets.internalId, internalId));
    return asset;
  }

  async getSubAssetsByParentId(parentAssetId: string): Promise<SubAsset[]> {
    return db.select().from(subAssets).where(eq(subAssets.parentAssetId, parentAssetId));
  }

  async createSubAsset(asset: InsertSubAsset): Promise<SubAsset> {
    const [newAsset] = await db.insert(subAssets).values(asset).returning();
    return newAsset;
  }

  async updateSubAsset(internalId: number, asset: Partial<InsertSubAsset>): Promise<SubAsset | undefined> {
    const [updated] = await db.update(subAssets)
      .set(asset)
      .where(eq(subAssets.internalId, internalId))
      .returning();
    return updated;
  }

  async getNextSubAssetNumber(baseAssetId: string): Promise<number> {
    const allFastAssets = await db.select({ id: fastAssets.id }).from(fastAssets);
    const subPattern = new RegExp(`^${baseAssetId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-SUB(\\d+)$`);
    let maxNum = 0;
    for (const asset of allFastAssets) {
      const match = asset.id.match(subPattern);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
    return maxNum + 1;
  }

  async getSubAssetCounts(): Promise<Record<string, number>> {
    const results = await db.select({
      parentAssetId: subAssets.parentAssetId,
      count: sql<number>`count(*)`
    })
    .from(subAssets)
    .groupBy(subAssets.parentAssetId);
    
    const counts: Record<string, number> = {};
    for (const row of results) {
      counts[row.parentAssetId] = Number(row.count);
    }
    return counts;
  }

  async getBtoSummary(): Promise<{ higherLevelBto: string; bto: string | null; division: string | null; totalAssets: number }[]> {
    const results = await db.select({
      higherLevelBto: btoMapping.higherLevelBto,
      bto: btoMapping.bto,
      division: btoMapping.division,
      totalAssets: sql<number>`count(${tpiAssets.id})`
    })
    .from(btoMapping)
    .leftJoin(tpiAssets, and(
      eq(tpiAssets.btoAlignment, btoMapping.bto),
      eq(tpiAssets.owningInternalOrg, btoMapping.division)
    ))
    .groupBy(btoMapping.higherLevelBto, btoMapping.bto, btoMapping.division)
    .orderBy(btoMapping.higherLevelBto, btoMapping.bto, btoMapping.division);
    
    return results.map(row => ({
      higherLevelBto: row.higherLevelBto,
      bto: row.bto,
      division: row.division,
      totalAssets: Number(row.totalAssets)
    }));
  }
}

export const storage = new DatabaseStorage();
