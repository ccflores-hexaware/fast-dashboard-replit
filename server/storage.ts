import { 
  type User, type InsertUser, users,
  type FastAsset, type InsertFastAsset, fastAssets,
  type TpiAsset, type InsertTpiAsset, tpiAssets,
  type BtoAsset, type InsertBtoAsset, btoAssets,
  type CmdbAsset, type InsertCmdbAsset, cmdbAssets
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
    return db.select().from(fastAssets).where(eq(fastAssets.id, id)).orderBy(desc(fastAssets.version));
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
}

export const storage = new DatabaseStorage();
