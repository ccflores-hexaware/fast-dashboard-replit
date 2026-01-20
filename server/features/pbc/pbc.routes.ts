import { Router, type Request, type Response } from "express";
import { pbcStorage } from "./pbc.storage";
import { z } from "zod";

const router = Router();

const createRequestSchema = z.object({
  controlId: z.string().min(1),
  controlName: z.string().min(1),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  userId: z.string().min(1),
});

function generateRequestId(): string {
  const prefix = 'PBC';
  const num = Math.floor(Math.random() * 999).toString().padStart(3, '0');
  const suffix = Array.from({ length: 3 }, () => 
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join('');
  return `${prefix}-${num}-${suffix}`;
}

router.get("/controls", async (_req: Request, res: Response) => {
  try {
    const controls = await pbcStorage.getAllControls();
    res.json(controls);
  } catch (error) {
    console.error("Error fetching PBC controls:", error);
    res.status(500).json({ error: "Failed to fetch controls" });
  }
});

router.get("/requests", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    const requests = await pbcStorage.getEvidenceRequestsByUserId(userId);
    res.json(requests);
  } catch (error) {
    console.error("Error fetching PBC requests:", error);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

router.get("/requests/:requestId", async (req: Request, res: Response) => {
  try {
    const request = await pbcStorage.getEvidenceRequestByRequestId(req.params.requestId);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }
    res.json(request);
  } catch (error) {
    console.error("Error fetching PBC request:", error);
    res.status(500).json({ error: "Failed to fetch request" });
  }
});

router.post("/requests", async (req: Request, res: Response) => {
  try {
    const parseResult = createRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: "Invalid request body",
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const requestId = generateRequestId();
    const newRequest = await pbcStorage.createEvidenceRequest({
      requestId,
      controlId: parseResult.data.controlId,
      controlName: parseResult.data.controlName,
      dateFrom: parseResult.data.dateFrom,
      dateTo: parseResult.data.dateTo,
      userId: parseResult.data.userId,
      status: 'In Progress',
    });

    res.status(201).json(newRequest);
  } catch (error) {
    console.error("Error creating PBC request:", error);
    res.status(500).json({ error: "Failed to create request" });
  }
});

router.patch("/requests/:requestId/status", async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!status || !['In Progress', 'Completed', 'Failed'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updated = await pbcStorage.updateEvidenceRequestStatus(req.params.requestId, status);
    if (!updated) {
      return res.status(404).json({ error: "Request not found" });
    }
    res.json(updated);
  } catch (error) {
    console.error("Error updating PBC request status:", error);
    res.status(500).json({ error: "Failed to update request status" });
  }
});

router.get("/requests/:requestId/reports", async (req: Request, res: Response) => {
  try {
    const reports = await pbcStorage.getReportsByRequestId(req.params.requestId);
    res.json(reports);
  } catch (error) {
    console.error("Error fetching PBC reports:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

export const pbcRouter = router;
