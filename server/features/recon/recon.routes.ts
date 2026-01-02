import { Router, type Request, type Response } from "express";
import { reconService } from "./recon.service";
import { paginationParamsSchema, applicationListParamsSchema, applicationDetailParamsSchema } from "./recon.types";
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

    const result = await reconService.getAssets(parseResult.data);
    res.json(result);
  } catch (error) {
    console.error("Error fetching Recon assets:", error);
    res.status(500).json({ error: "Failed to fetch Recon assets" });
  }
});

router.get("/filter-options", async (_req: Request, res: Response) => {
  try {
    const options = await reconService.getFilterOptions();
    res.json(options);
  } catch (error) {
    console.error("Error fetching Recon filter options:", error);
    res.status(500).json({ error: "Failed to fetch Recon filter options" });
  }
});

router.get("/grouped", async (req: Request, res: Response) => {
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

    const result = await reconService.getGroupedAssets(parseResult.data);
    res.json(result);
  } catch (error) {
    console.error("Error fetching grouped Recon assets:", error);
    res.status(500).json({ error: "Failed to fetch grouped Recon assets" });
  }
});

const assetIdSchema = z.string().min(1, "Asset ID is required");

router.get("/applications", async (req: Request, res: Response) => {
  try {
    const parseResult = applicationListParamsSchema.safeParse({
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      status: req.query.status,
      sortOrder: req.query.sortOrder,
    });

    if (!parseResult.success) {
      return res.status(400).json({
        error: "Invalid query parameters",
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const result = await reconService.getApplicationList(parseResult.data);
    res.json(result);
  } catch (error) {
    console.error("Error fetching application list:", error);
    res.status(500).json({ error: "Failed to fetch application list" });
  }
});

router.get("/applications/:applicationName", async (req: Request, res: Response) => {
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

    const parseResult = applicationDetailParamsSchema.safeParse({
      applicationName: decodeURIComponent(req.params.applicationName),
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
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

    const result = await reconService.getApplicationDetail(parseResult.data);
    res.json(result);
  } catch (error) {
    console.error("Error fetching application detail:", error);
    res.status(500).json({ error: "Failed to fetch application detail" });
  }
});

router.get("/applications/:applicationName/filter-options", async (req: Request, res: Response) => {
  try {
    const applicationName = decodeURIComponent(req.params.applicationName);
    const options = await reconService.getApplicationFilterOptions(applicationName);
    res.json(options);
  } catch (error) {
    console.error("Error fetching application filter options:", error);
    res.status(500).json({ error: "Failed to fetch application filter options" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const internalId = parseInt(req.params.id, 10);
    
    if (isNaN(internalId) || internalId < 1) {
      return res.status(400).json({
        error: "Invalid asset ID",
      });
    }

    const asset = await reconService.getAssetByInternalId(internalId);
    
    if (!asset) {
      return res.status(404).json({ error: "Asset not found" });
    }
    
    res.json(asset);
  } catch (error) {
    console.error("Error fetching Recon asset:", error);
    res.status(500).json({ error: "Failed to fetch Recon asset" });
  }
});

export const reconRouter = router;
