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

  app.get("/api/bto", async (req: Request, res: Response) => {
    try {
      const assets = await storage.getAllBtoAssets();
      res.json(assets);
    } catch (error) {
      console.error("Error fetching BTO assets:", error);
      res.status(500).json({ error: "Failed to fetch BTO assets" });
    }
  });

  app.get("/api/bto/:id", async (req: Request, res: Response) => {
    try {
      const asset = await storage.getBtoAssetById(req.params.id);
      if (!asset) {
        return res.status(404).json({ error: "Asset not found" });
      }
      res.json(asset);
    } catch (error) {
      console.error("Error fetching BTO asset:", error);
      res.status(500).json({ error: "Failed to fetch BTO asset" });
    }
  });

  app.post("/api/bto", async (req: Request, res: Response) => {
    try {
      const asset = await storage.createBtoAsset(req.body);
      res.status(201).json(asset);
    } catch (error) {
      console.error("Error creating BTO asset:", error);
      res.status(500).json({ error: "Failed to create BTO asset" });
    }
  });

  app.put("/api/bto/:id", async (req: Request, res: Response) => {
    try {
      const asset = await storage.updateBtoAsset(req.params.id, req.body);
      if (!asset) {
        return res.status(404).json({ error: "Asset not found" });
      }
      res.json(asset);
    } catch (error) {
      console.error("Error updating BTO asset:", error);
      res.status(500).json({ error: "Failed to update BTO asset" });
    }
  });

  app.delete("/api/bto/:id", async (req: Request, res: Response) => {
    try {
      await storage.deleteBtoAsset(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting BTO asset:", error);
      res.status(500).json({ error: "Failed to delete BTO asset" });
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

  return httpServer;
}
