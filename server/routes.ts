import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
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

  app.get("/api/tpi", async (req: Request, res: Response) => {
    try {
      const assets = await storage.getAllTpiAssets();
      res.json(assets);
    } catch (error) {
      console.error("Error fetching TPI assets:", error);
      res.status(500).json({ error: "Failed to fetch TPI assets" });
    }
  });

  app.get("/api/tpi/:id", async (req: Request, res: Response) => {
    try {
      const asset = await storage.getTpiAssetById(req.params.id);
      if (!asset) {
        return res.status(404).json({ error: "Asset not found" });
      }
      res.json(asset);
    } catch (error) {
      console.error("Error fetching TPI asset:", error);
      res.status(500).json({ error: "Failed to fetch TPI asset" });
    }
  });

  app.post("/api/tpi", async (req: Request, res: Response) => {
    try {
      const asset = await storage.createTpiAsset(req.body);
      res.status(201).json(asset);
    } catch (error) {
      console.error("Error creating TPI asset:", error);
      res.status(500).json({ error: "Failed to create TPI asset" });
    }
  });

  app.put("/api/tpi/:id", async (req: Request, res: Response) => {
    try {
      const asset = await storage.updateTpiAsset(req.params.id, req.body);
      if (!asset) {
        return res.status(404).json({ error: "Asset not found" });
      }
      res.json(asset);
    } catch (error) {
      console.error("Error updating TPI asset:", error);
      res.status(500).json({ error: "Failed to update TPI asset" });
    }
  });

  app.delete("/api/tpi/:id", async (req: Request, res: Response) => {
    try {
      await storage.deleteTpiAsset(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting TPI asset:", error);
      res.status(500).json({ error: "Failed to delete TPI asset" });
    }
  });

  app.get("/api/tpi/history/:tpiAssetId", async (req: Request, res: Response) => {
    try {
      const history = await storage.getTpiAssetHistory(req.params.tpiAssetId);
      const count = await storage.getTpiAssetHistoryCount(req.params.tpiAssetId);
      res.json({ history, total: count });
    } catch (error) {
      console.error("Error fetching TPI asset history:", error);
      res.status(500).json({ error: "Failed to fetch TPI asset history" });
    }
  });

  app.get("/api/cmdb", async (req: Request, res: Response) => {
    try {
      const assets = await storage.getAllCmdbAssets();
      res.json(assets);
    } catch (error) {
      console.error("Error fetching CMDB assets:", error);
      res.status(500).json({ error: "Failed to fetch CMDB assets" });
    }
  });

  app.get("/api/cmdb/:id", async (req: Request, res: Response) => {
    try {
      const asset = await storage.getCmdbAssetById(req.params.id);
      if (!asset) {
        return res.status(404).json({ error: "Asset not found" });
      }
      res.json(asset);
    } catch (error) {
      console.error("Error fetching CMDB asset:", error);
      res.status(500).json({ error: "Failed to fetch CMDB asset" });
    }
  });

  app.post("/api/cmdb", async (req: Request, res: Response) => {
    try {
      const asset = await storage.createCmdbAsset(req.body);
      res.status(201).json(asset);
    } catch (error) {
      console.error("Error creating CMDB asset:", error);
      res.status(500).json({ error: "Failed to create CMDB asset" });
    }
  });

  app.put("/api/cmdb/:id", async (req: Request, res: Response) => {
    try {
      const asset = await storage.updateCmdbAsset(req.params.id, req.body);
      if (!asset) {
        return res.status(404).json({ error: "Asset not found" });
      }
      res.json(asset);
    } catch (error) {
      console.error("Error updating CMDB asset:", error);
      res.status(500).json({ error: "Failed to update CMDB asset" });
    }
  });

  app.delete("/api/cmdb/:id", async (req: Request, res: Response) => {
    try {
      await storage.deleteCmdbAsset(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting CMDB asset:", error);
      res.status(500).json({ error: "Failed to delete CMDB asset" });
    }
  });

  app.get("/api/cmdb/history/:cmdbAssetId", async (req: Request, res: Response) => {
    try {
      const history = await storage.getCmdbAssetHistory(req.params.cmdbAssetId);
      const count = await storage.getCmdbAssetHistoryCount(req.params.cmdbAssetId);
      res.json({ history, total: count });
    } catch (error) {
      console.error("Error fetching CMDB asset history:", error);
      res.status(500).json({ error: "Failed to fetch CMDB asset history" });
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
      const asset = await storage.createSubAsset(req.body);
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

  return httpServer;
}
