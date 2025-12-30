import { Router, type Request, type Response } from "express";
import { cmdbService } from "./cmdb.service";
import { paginationParamsSchema } from "./cmdb.types";
import { z } from "zod";

export const cmdbRouter = Router();

cmdbRouter.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    let filters: Record<string, string[]> | undefined;
    if (req.query.filters && typeof req.query.filters === "string") {
      try {
        filters = JSON.parse(req.query.filters);
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
      res.status(400).json({
        error: "Invalid pagination parameters",
        details: parseResult.error.flatten(),
      });
      return;
    }

    const result = await cmdbService.getAssets(parseResult.data);
    res.json(result);
  } catch (error) {
    console.error("Error fetching CMDB assets:", error);
    res.status(500).json({ error: "Failed to fetch CMDB assets" });
  }
});

cmdbRouter.get("/filter-options", async (_req: Request, res: Response): Promise<void> => {
  try {
    const options = await cmdbService.getFilterOptions();
    res.json(options);
  } catch (error) {
    console.error("Error fetching CMDB filter options:", error);
    res.status(500).json({ error: "Failed to fetch CMDB filter options" });
  }
});

cmdbRouter.get("/history/:cmdbAssetId", async (req: Request, res: Response): Promise<void> => {
  try {
    const { cmdbAssetId } = req.params;

    if (!cmdbAssetId || !cmdbAssetId.trim()) {
      res.status(400).json({ error: "Asset ID is required" });
      return;
    }

    const result = await cmdbService.getAssetHistory(cmdbAssetId);
    res.json(result);
  } catch (error) {
    console.error("Error fetching CMDB asset history:", error);
    res.status(500).json({ error: "Failed to fetch CMDB asset history" });
  }
});

cmdbRouter.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || !id.trim()) {
      res.status(400).json({ error: "Asset ID is required" });
      return;
    }

    const asset = await cmdbService.getAssetById(id);

    if (!asset) {
      res.status(404).json({ error: "Asset not found" });
      return;
    }

    res.json(asset);
  } catch (error) {
    console.error("Error fetching CMDB asset:", error);
    res.status(500).json({ error: "Failed to fetch CMDB asset" });
  }
});
