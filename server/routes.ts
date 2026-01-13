import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { tpiRouter } from "./features/tpi/tpi.routes";
import { cmdbRouter } from "./features/cmdb/cmdb.routes";
import { reconRouter } from "./features/recon/recon.routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.use("/api/tpi", tpiRouter);
  app.use("/api/cmdb", cmdbRouter);
  app.use("/api/recon", reconRouter);

  app.get("/api/fast", async (req: Request, res: Response) => {
    try {
      const assets = await storage.getAllFastAssets();
      res.json(assets);
    } catch (error) {
      console.error("Error fetching FAST assets:", error);
      res.status(500).json({ error: "Failed to fetch FAST assets" });
    }
  });

  app.get("/api/fast/:id", async (req: Request, res: Response) => {
    try {
      const assets = await storage.getFastAssetById(req.params.id);
      res.json(assets);
    } catch (error) {
      console.error("Error fetching FAST asset:", error);
      res.status(500).json({ error: "Failed to fetch FAST asset" });
    }
  });

  app.post("/api/fast", async (req: Request, res: Response) => {
    try {
      const asset = await storage.createFastAsset(req.body);
      res.status(201).json(asset);
    } catch (error) {
      console.error("Error creating FAST asset:", error);
      res.status(500).json({ error: "Failed to create FAST asset" });
    }
  });

  app.put("/api/fast/:internalId", async (req: Request, res: Response) => {
    try {
      const internalId = parseInt(req.params.internalId);
      const asset = await storage.updateFastAsset(internalId, req.body);
      if (!asset) {
        return res.status(404).json({ error: "Asset not found" });
      }
      res.json(asset);
    } catch (error) {
      console.error("Error updating FAST asset:", error);
      res.status(500).json({ error: "Failed to update FAST asset" });
    }
  });

  app.delete("/api/fast/:internalId", async (req: Request, res: Response) => {
    try {
      const internalId = parseInt(req.params.internalId);
      await storage.deleteFastAsset(internalId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting FAST asset:", error);
      res.status(500).json({ error: "Failed to delete FAST asset" });
    }
  });


  app.get("/api/activity/:assetId", async (req: Request, res: Response) => {
    try {
      const activities = await storage.getAssetActivities(req.params.assetId);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching asset activities:", error);
      res.status(500).json({ error: "Failed to fetch asset activities" });
    }
  });

  app.post("/api/activity", async (req: Request, res: Response) => {
    try {
      const activity = await storage.createAssetActivity(req.body);
      res.status(201).json(activity);
    } catch (error) {
      console.error("Error creating asset activity:", error);
      res.status(500).json({ error: "Failed to create asset activity" });
    }
  });

  app.get("/api/sub-assets", async (req: Request, res: Response) => {
    try {
      const assets = await storage.getAllSubAssets();
      res.json(assets);
    } catch (error) {
      console.error("Error fetching sub-assets:", error);
      res.status(500).json({ error: "Failed to fetch sub-assets" });
    }
  });

  app.get("/api/sub-assets/counts", async (req: Request, res: Response) => {
    try {
      const counts = await storage.getSubAssetCounts();
      res.json(counts);
    } catch (error) {
      console.error("Error fetching sub-asset counts:", error);
      res.status(500).json({ error: "Failed to fetch sub-asset counts" });
    }
  });

  app.get("/api/sub-assets/:internalId", async (req: Request, res: Response) => {
    try {
      const internalId = parseInt(req.params.internalId);
      const asset = await storage.getSubAssetById(internalId);
      if (!asset) {
        return res.status(404).json({ error: "Sub-asset not found" });
      }
      res.json(asset);
    } catch (error) {
      console.error("Error fetching sub-asset:", error);
      res.status(500).json({ error: "Failed to fetch sub-asset" });
    }
  });

  app.get("/api/sub-assets/by-parent/:parentAssetId", async (req: Request, res: Response) => {
    try {
      const assets = await storage.getSubAssetsByParentId(req.params.parentAssetId);
      res.json(assets);
    } catch (error) {
      console.error("Error fetching sub-assets by parent:", error);
      res.status(500).json({ error: "Failed to fetch sub-assets" });
    }
  });

  app.post("/api/sub-assets", async (req: Request, res: Response) => {
    try {
      const { parentAssetId, createdBy } = req.body;
      
      if (!parentAssetId) {
        return res.status(400).json({ error: "parentAssetId is required" });
      }
      
      const [parentAsset] = await storage.getFastAssetById(parentAssetId);
      if (!parentAsset) {
        return res.status(404).json({ error: "Parent asset not found" });
      }
      
      const nextNum = await storage.getNextSubAssetNumber(parentAssetId);
      const assetId = `${parentAssetId}-SUB${nextNum}`;
      const now = new Date().toISOString();
      
      const subAssetData = {
        parentAssetId,
        assetId,
        name: `${parentAsset.name || 'Sub-asset'} (Sub-asset)`,
        lastModifiedBy: createdBy || 'Unknown User',
        lastModifiedDate: now,
      };
      
      const asset = await storage.createSubAsset(subAssetData);
      res.status(201).json(asset);
    } catch (error) {
      console.error("Error creating sub-asset:", error);
      res.status(500).json({ error: "Failed to create sub-asset" });
    }
  });

  app.put("/api/sub-assets/:internalId", async (req: Request, res: Response) => {
    try {
      const internalId = parseInt(req.params.internalId);
      const { createdAt, internalId: _, ...updateData } = req.body;
      const asset = await storage.updateSubAsset(internalId, updateData);
      if (!asset) {
        return res.status(404).json({ error: "Sub-asset not found" });
      }
      res.json(asset);
    } catch (error) {
      console.error("Error updating sub-asset:", error);
      res.status(500).json({ error: "Failed to update sub-asset" });
    }
  });

  app.get("/api/fast/next-sub-id/:baseAssetId", async (req: Request, res: Response) => {
    try {
      const nextNum = await storage.getNextSubAssetNumber(req.params.baseAssetId);
      res.json({ nextId: `${req.params.baseAssetId}-SUB${nextNum}` });
    } catch (error) {
      console.error("Error getting next sub-asset ID:", error);
      res.status(500).json({ error: "Failed to get next sub-asset ID" });
    }
  });

  app.get("/api/bto/summary", async (req: Request, res: Response) => {
    try {
      const summary = await storage.getBtoSummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching BTO summary:", error);
      res.status(500).json({ error: "Failed to fetch BTO summary" });
    }
  });

  app.get("/api/bto/mappings", async (req: Request, res: Response) => {
    try {
      const mappings = await storage.getAllBtoMappings();
      res.json(mappings);
    } catch (error) {
      console.error("Error fetching BTO mappings:", error);
      res.status(500).json({ error: "Failed to fetch BTO mappings" });
    }
  });

  app.get("/api/bto/higher-level-btos", async (req: Request, res: Response) => {
    try {
      const higherLevelBtos = await storage.getDistinctHigherLevelBtos();
      res.json(higherLevelBtos);
    } catch (error) {
      console.error("Error fetching higher level BTOs:", error);
      res.status(500).json({ error: "Failed to fetch higher level BTOs" });
    }
  });

  app.get("/api/bto/mappings/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid mapping ID" });
      }
      const mapping = await storage.getBtoMappingById(id);
      if (!mapping) {
        return res.status(404).json({ error: "BTO mapping not found" });
      }
      res.json(mapping);
    } catch (error) {
      console.error("Error fetching BTO mapping:", error);
      res.status(500).json({ error: "Failed to fetch BTO mapping" });
    }
  });

  app.put("/api/bto/mappings/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid mapping ID" });
      }
      const { higherLevelBto } = req.body;
      if (!higherLevelBto || typeof higherLevelBto !== 'string') {
        return res.status(400).json({ error: "higherLevelBto is required and must be a string" });
      }
      const updated = await storage.updateBtoMapping(id, { higherLevelBto });
      if (!updated) {
        return res.status(404).json({ error: "BTO mapping not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating BTO mapping:", error);
      res.status(500).json({ error: "Failed to update BTO mapping" });
    }
  });

  return httpServer;
}
