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

export type { ReconAsset };
