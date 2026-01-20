import { db } from "../../db";
import { pbcControls, pbcEvidenceRequests, pbcEvidenceReports } from "../../../shared/schema";
import type { PbcControl, PbcEvidenceRequest, PbcEvidenceReport, InsertPbcControl, InsertPbcEvidenceRequest, InsertPbcEvidenceReport } from "../../../shared/schema";
import { eq, desc, and, sql, or, ilike, asc } from "drizzle-orm";

export class PbcStorage {
  async getAllControls(): Promise<PbcControl[]> {
    return await db.select().from(pbcControls).orderBy(asc(pbcControls.controlId));
  }

  async getControlByControlId(controlId: string): Promise<PbcControl | null> {
    const [control] = await db.select().from(pbcControls).where(eq(pbcControls.controlId, controlId));
    return control ?? null;
  }

  async createControl(control: InsertPbcControl): Promise<PbcControl> {
    const [created] = await db.insert(pbcControls).values(control).returning();
    return created;
  }

  async bulkCreateControls(controls: InsertPbcControl[]): Promise<void> {
    if (controls.length === 0) return;
    await db.insert(pbcControls).values(controls).onConflictDoNothing();
  }

  async getEvidenceRequestsByUserId(userId: string): Promise<PbcEvidenceRequest[]> {
    return await db
      .select()
      .from(pbcEvidenceRequests)
      .where(eq(pbcEvidenceRequests.userId, userId))
      .orderBy(desc(pbcEvidenceRequests.createdAt));
  }

  async getEvidenceRequestByRequestId(requestId: string): Promise<PbcEvidenceRequest | null> {
    const [request] = await db.select().from(pbcEvidenceRequests).where(eq(pbcEvidenceRequests.requestId, requestId));
    return request ?? null;
  }

  async createEvidenceRequest(request: InsertPbcEvidenceRequest): Promise<PbcEvidenceRequest> {
    const [created] = await db.insert(pbcEvidenceRequests).values(request).returning();
    return created;
  }

  async updateEvidenceRequestStatus(requestId: string, status: string): Promise<PbcEvidenceRequest | null> {
    const [updated] = await db
      .update(pbcEvidenceRequests)
      .set({ status })
      .where(eq(pbcEvidenceRequests.requestId, requestId))
      .returning();
    return updated ?? null;
  }

  async getReportsByRequestId(requestId: string): Promise<PbcEvidenceReport[]> {
    return await db
      .select()
      .from(pbcEvidenceReports)
      .where(eq(pbcEvidenceReports.requestId, requestId))
      .orderBy(asc(pbcEvidenceReports.id));
  }

  async createEvidenceReport(report: InsertPbcEvidenceReport): Promise<PbcEvidenceReport> {
    const [created] = await db.insert(pbcEvidenceReports).values(report).returning();
    return created;
  }

  async bulkCreateEvidenceReports(reports: InsertPbcEvidenceReport[]): Promise<void> {
    if (reports.length === 0) return;
    await db.insert(pbcEvidenceReports).values(reports);
  }

  async getControlsCount(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(pbcControls);
    return Number(result?.count || 0);
  }

  async getRequestsCount(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(pbcEvidenceRequests);
    return Number(result?.count || 0);
  }
}

export const pbcStorage = new PbcStorage();
