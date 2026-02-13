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

const CONTROL_REPORT_TEMPLATES: Record<string, Array<{ keychainDatabase: string; queryTemplate: string }>> = {
  'C.IT.IACTM.001': [
    { keychainDatabase: 'IAM_CENTRAL_DB', queryTemplate: 'SELECT user_id, provision_date, approver, role_assigned FROM user_provisioning WHERE provision_date BETWEEN :start_date AND :end_date ORDER BY provision_date DESC' },
    { keychainDatabase: 'HR_SYSTEMS_DB', queryTemplate: 'SELECT employee_id, hire_date, department, manager_id FROM employees WHERE hire_date BETWEEN :start_date AND :end_date' },
  ],
  'C.IT.IACTM.004': [
    { keychainDatabase: 'IAM_CENTRAL_DB', queryTemplate: 'SELECT user_id, termination_date, processed_by, access_revoked FROM user_terminations WHERE termination_date BETWEEN :start_date AND :end_date ORDER BY termination_date DESC' },
    { keychainDatabase: 'HR_SYSTEMS_DB', queryTemplate: 'SELECT employee_id, termination_date, department, last_access_date FROM terminated_employees WHERE termination_date BETWEEN :start_date AND :end_date' },
  ],
  'C.IT.IACTM.006': [
    { keychainDatabase: 'MFA_CENTRAL_DB', queryTemplate: 'SELECT user_id, mfa_method, enrollment_date, last_verified, status FROM mfa_enrollment WHERE enrollment_date BETWEEN :start_date AND :end_date' },
    { keychainDatabase: 'AUTH_SYSTEMS_DB', queryTemplate: "SELECT auth_id, user_id, auth_method, success, timestamp FROM authentication_logs WHERE auth_method IN ('MFA_PUSH', 'MFA_SMS', 'MFA_TOTP') AND timestamp BETWEEN :start_date AND :end_date" },
  ],
  'C.IT.IACTM.007': [
    { keychainDatabase: 'SERVICE_ACCOUNT_DB', queryTemplate: 'SELECT account_id, account_name, owner, purpose, last_password_rotation, status FROM service_accounts WHERE created_date <= :end_date' },
    { keychainDatabase: 'AUDIT_LOG_DB', queryTemplate: 'SELECT log_id, service_account_id, action, timestamp FROM service_account_audit WHERE timestamp BETWEEN :start_date AND :end_date' },
  ],
  'C.IT.IACTM.008': [
    { keychainDatabase: 'ACCESS_REVIEW_DB', queryTemplate: 'SELECT review_id, reviewer_id, user_reviewed, access_confirmed, review_date FROM periodic_access_reviews WHERE review_date BETWEEN :start_date AND :end_date' },
    { keychainDatabase: 'AUDIT_LOG_DB', queryTemplate: 'SELECT log_id, action, reviewer_id, timestamp FROM review_audit_logs WHERE timestamp BETWEEN :start_date AND :end_date' },
  ],
  'C.IT.IACTM.010': [
    { keychainDatabase: 'PRIV_MONITORING_DB', queryTemplate: 'SELECT session_id, user_id, action_performed, resource_accessed, timestamp FROM privileged_user_activity WHERE timestamp BETWEEN :start_date AND :end_date ORDER BY timestamp DESC' },
    { keychainDatabase: 'AUDIT_LOG_DB', queryTemplate: 'SELECT log_id, user_id, privilege_level, action, timestamp FROM privilege_audit_logs WHERE timestamp BETWEEN :start_date AND :end_date' },
  ],
  'C.IT.IACTM.017': [
    { keychainDatabase: 'SESSION_MGMT_DB', queryTemplate: 'SELECT session_id, user_id, login_time, logout_time, timeout_applied FROM user_sessions WHERE login_time BETWEEN :start_date AND :end_date' },
  ],
  'C.IT.IACTM.031': [
    { keychainDatabase: 'IAM_CENTRAL_DB', queryTemplate: 'SELECT account_id, user_id, last_login_date, dormant_since, status, action_taken FROM dormant_accounts WHERE dormant_since BETWEEN :start_date AND :end_date' },
    { keychainDatabase: 'AUDIT_LOG_DB', queryTemplate: 'SELECT log_id, account_id, action, processed_by, timestamp FROM dormant_account_actions WHERE timestamp BETWEEN :start_date AND :end_date' },
  ],
  'C.IT.CRM.121': [
    { keychainDatabase: 'CRM_ACCESS_DB', queryTemplate: 'SELECT access_id, user_id, customer_segment, access_level, granted_date, granted_by FROM customer_data_access WHERE granted_date BETWEEN :start_date AND :end_date' },
    { keychainDatabase: 'AUDIT_LOG_DB', queryTemplate: 'SELECT log_id, user_id, action_type, customer_id, timestamp FROM customer_access_logs WHERE timestamp BETWEEN :start_date AND :end_date' },
  ],
};

router.post("/requests", async (req: Request, res: Response) => {
  try {
    const parseResult = createRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: "Invalid request body",
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    await new Promise(resolve => setTimeout(resolve, 3000));

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

    const templates = CONTROL_REPORT_TEMPLATES[parseResult.data.controlId] || [
      { keychainDatabase: 'IAM_CENTRAL_DB', queryTemplate: 'SELECT * FROM control_evidence WHERE control_id = :control_id AND execution_date BETWEEN :start_date AND :end_date' },
    ];

    const generatedReports = [];
    for (const template of templates) {
      const report = await pbcStorage.createEvidenceReport({
        requestId,
        keychainDatabase: template.keychainDatabase,
        executedQuery: template.queryTemplate,
        recordCount: Math.floor(Math.random() * 5000) + 50,
      });
      generatedReports.push(report);
    }

    const updatedRequest = await pbcStorage.updateEvidenceRequestStatus(requestId, 'Completed');

    res.status(201).json({
      request: updatedRequest || newRequest,
      reports: generatedReports,
    });
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
