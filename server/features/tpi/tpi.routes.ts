import { Router, type Request, type Response } from "express";
import { tpiService } from "./tpi.service";
import { paginationParamsSchema } from "./tpi.types";
import { z } from "zod";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    let filters: Record<string, string[]> | undefined;
    const filtersParam = req.query.filters as string | undefined;
    
    if (filtersParam) {
      try {
        filters = JSON.parse(filtersParam);
      } catch {
        filters = undefined;
      }
    }

    const parseResult = paginationParamsSchema.safeParse({
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      searchColumn: req.query.searchColumn,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
      filters,
    });

    if (!parseResult.success) {
      return res.status(400).json({
        error: "Invalid query parameters",
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const result = await tpiService.getAssets(parseResult.data);
    res.json(result);
  } catch (error) {
    console.error("Error fetching TPI assets:", error);
    res.status(500).json({ error: "Failed to fetch TPI assets" });
  }
});

router.get("/filter-options", async (_req: Request, res: Response) => {
  try {
    const options = await tpiService.getFilterOptions();
    res.json(options);
  } catch (error) {
    console.error("Error fetching TPI filter options:", error);
    res.status(500).json({ error: "Failed to fetch TPI filter options" });
  }
});

const assetIdSchema = z.string().min(1, "Asset ID is required");

router.get("/history/:tpiAssetId", async (req: Request, res: Response) => {
  try {
    const parseResult = assetIdSchema.safeParse(req.params.tpiAssetId);
    
    if (!parseResult.success) {
      return res.status(400).json({
        error: "Invalid asset ID",
        details: parseResult.error.flatten().formErrors,
      });
    }

    const result = await tpiService.getAssetHistory(parseResult.data);
    res.json(result);
  } catch (error) {
    console.error("Error fetching TPI asset history:", error);
    res.status(500).json({ error: "Failed to fetch TPI asset history" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const parseResult = assetIdSchema.safeParse(req.params.id);
    
    if (!parseResult.success) {
      return res.status(400).json({
        error: "Invalid asset ID",
        details: parseResult.error.flatten().formErrors,
      });
    }

    const asset = await tpiService.getAssetById(parseResult.data);
    
    if (!asset) {
      return res.status(404).json({ error: "Asset not found" });
    }
    
    res.json(asset);
  } catch (error) {
    console.error("Error fetching TPI asset:", error);
    res.status(500).json({ error: "Failed to fetch TPI asset" });
  }
});

export const tpiRouter = router;
