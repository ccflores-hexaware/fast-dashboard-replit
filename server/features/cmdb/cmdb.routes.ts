import { Router, type Request, type Response } from "express";
import { cmdbService } from "./cmdb.service";
import { paginationParamsSchema } from "./cmdb.types";
import { z } from "zod";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(xlsx|xls|csv)$/i)) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel (.xlsx, .xls) and CSV files are allowed"));
    }
  },
});

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

cmdbRouter.post("/history/upload", upload.single("file"), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const replaceExisting = req.body.replaceExisting === "true";
    const result = await cmdbService.uploadHistoryFromFile(req.file.buffer, replaceExisting);

    if (result.success) {
      res.json({
        success: true,
        message: `Successfully imported ${result.insertedCount} records`,
        insertedCount: result.insertedCount,
        totalRows: result.totalRows,
        errors: result.errors,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to import records",
        errors: result.errors,
        totalRows: result.totalRows,
      });
    }
  } catch (error) {
    console.error("Error uploading CMDB history:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to upload CMDB history" });
  }
});

cmdbRouter.get("/history/template/download", async (_req: Request, res: Response): Promise<void> => {
  try {
    const templateBuffer = cmdbService.generateHistoryTemplate();
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=cmdb_history_template.xlsx");
    res.send(templateBuffer);
  } catch (error) {
    console.error("Error generating CMDB history template:", error);
    res.status(500).json({ error: "Failed to generate template" });
  }
});
