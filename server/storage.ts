import { 
  type User, type InsertUser, users,
  type FastAsset, type InsertFastAsset, fastAssets,
  type TpiAsset, type InsertTpiAsset, tpiAssets,
  type TpiAssetHistory, type InsertTpiAssetHistory, tpiAssetHistory,
  type BtoAsset, type InsertBtoAsset, btoAssets,
  type CmdbAsset, type InsertCmdbAsset, cmdbAssets,
  type AssetActivity, type InsertAssetActivity, assetActivity,
  type SubAsset, type InsertSubAsset, subAssets
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllFastAssets(): Promise<FastAsset[]>;
  getFastAssetById(id: string): Promise<FastAsset[]>;
  createFastAsset(asset: InsertFastAsset): Promise<FastAsset>;
  updateFastAsset(internalId: number, asset: Partial<InsertFastAsset>): Promise<FastAsset | undefined>;
  deleteFastAsset(internalId: number): Promise<boolean>;
  
  getAllTpiAssets(): Promise<TpiAsset[]>;
  getTpiAssetById(id: string): Promise<TpiAsset | undefined>;
  createTpiAsset(asset: InsertTpiAsset): Promise<TpiAsset>;
  updateTpiAsset(id: string, asset: Partial<InsertTpiAsset>): Promise<TpiAsset | undefined>;
  deleteTpiAsset(id: string): Promise<boolean>;
  
  getAllBtoAssets(): Promise<BtoAsset[]>;
  getBtoAssetById(id: string): Promise<BtoAsset | undefined>;
  createBtoAsset(asset: InsertBtoAsset): Promise<BtoAsset>;
  updateBtoAsset(id: string, asset: Partial<InsertBtoAsset>): Promise<BtoAsset | undefined>;
  deleteBtoAsset(id: string): Promise<boolean>;
  
  getAllCmdbAssets(): Promise<CmdbAsset[]>;
  getCmdbAssetById(id: string): Promise<CmdbAsset | undefined>;
  createCmdbAsset(asset: InsertCmdbAsset): Promise<CmdbAsset>;
  updateCmdbAsset(id: string, asset: Partial<InsertCmdbAsset>): Promise<CmdbAsset | undefined>;
  deleteCmdbAsset(id: string): Promise<boolean>;
  
  getAssetActivities(assetId: string): Promise<AssetActivity[]>;
  createAssetActivity(activity: InsertAssetActivity): Promise<AssetActivity>;
  
  getTpiAssetHistory(tpiAssetId: string): Promise<TpiAssetHistory[]>;
  getTpiAssetHistoryCount(tpiAssetId: string): Promise<number>;
  
  getAllSubAssets(): Promise<SubAsset[]>;
  getSubAssetById(internalId: number): Promise<SubAsset | undefined>;
  getSubAssetsByParentId(parentAssetId: string): Promise<SubAsset[]>;
  createSubAsset(asset: InsertSubAsset): Promise<SubAsset>;
  updateSubAsset(internalId: number, asset: Partial<InsertSubAsset>): Promise<SubAsset | undefined>;
  getNextSubAssetNumber(baseAssetId: string): Promise<number>;
  getSubAssetCounts(): Promise<Record<string, number>>;
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

  async getAllFastAssets(): Promise<FastAsset[]> {
    return db.select().from(fastAssets).orderBy(desc(fastAssets.createdAt));
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

  async getAllBtoAssets(): Promise<BtoAsset[]> {
    return db.select().from(btoAssets).orderBy(desc(btoAssets.createdAt));
  }

  async getBtoAssetById(id: string): Promise<BtoAsset | undefined> {
    const [asset] = await db.select().from(btoAssets).where(eq(btoAssets.id, id));
    return asset;
  }

  async createBtoAsset(asset: InsertBtoAsset): Promise<BtoAsset> {
    const [newAsset] = await db.insert(btoAssets).values(asset).returning();
    return newAsset;
  }

  async updateBtoAsset(id: string, asset: Partial<InsertBtoAsset>): Promise<BtoAsset | undefined> {
    const [updated] = await db.update(btoAssets)
      .set(asset)
      .where(eq(btoAssets.id, id))
      .returning();
    return updated;
  }

  async deleteBtoAsset(id: string): Promise<boolean> {
    await db.delete(btoAssets).where(eq(btoAssets.id, id));
    return true;
  }

  async getAllCmdbAssets(): Promise<CmdbAsset[]> {
    return db.select().from(cmdbAssets).orderBy(desc(cmdbAssets.createdAt));
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
}

export const storage = new DatabaseStorage();
