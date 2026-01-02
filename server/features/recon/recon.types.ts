import { z } from "zod";
import type { ReconAsset } from "../../../shared/schema";

export const paginationParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  searchColumn: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  filters: z.record(z.array(z.string())).optional(),
});

export type PaginationParams = z.infer<typeof paginationParamsSchema>;

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface GroupedReconAsset {
  applicationName: string;
  recordCount: number;
  records: ReconAsset[];
}

export interface GroupedPaginatedResult {
  data: GroupedReconAsset[];
  totalGroups: number;
  totalRecords: number;
  totalPages: number;
  currentPage: number;
}

export interface ApplicationSummary {
  applicationName: string;
  applicationStatus: string | null;
  recordCount: number;
}

export interface ApplicationListResult {
  data: ApplicationSummary[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  statusOptions: string[];
}

export const applicationListParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type ApplicationListParams = z.infer<typeof applicationListParamsSchema>;

export interface AccountGroupedAsset {
  accountName: string;
  recordCount: number;
  records: ReconAsset[];
}

export interface ApplicationDetailResult {
  applicationName: string;
  applicationStatus: string | null;
  data: AccountGroupedAsset[];
  totalGroups: number;
  totalRecords: number;
  totalPages: number;
  currentPage: number;
}

export const applicationDetailParamsSchema = z.object({
  applicationName: z.string(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  filters: z.record(z.array(z.string())).optional(),
});

export type ApplicationDetailParams = z.infer<typeof applicationDetailParamsSchema>;

export type { ReconAsset };
