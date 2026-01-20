export interface Control {
  id: string;
  name: string;
  isAutomated: boolean;
}

export interface EvidenceRequest {
  id: string;
  requestId: string;
  controlId: string;
  controlName: string;
  dateFrom: string;
  dateTo: string;
  status: 'In Progress' | 'Completed' | 'Failed';
  createdAt: string;
  userId: string;
}

export interface EvidenceReport {
  keychainDatabase: string;
  executedQuery: string;
  recordCount: number;
  executedAt: string;
}

export const AUTOMATED_CONTROL_IDS = [
  'C.IT.IACTM.004',
  'C.IT.IACTM.001',
  'C.IT.IACTM.010',
  'C.IT.IACTM.008',
  'C.IT.IACTM.017',
  'C.IT.IACTM.031',
  'C.IT.IACTM.007',
  'C.IT.IACTM.006',
  'C.IT.CRM.121',
];

export const ALL_CONTROLS: Control[] = [
  { id: 'C.IT.IACTM.001', name: 'User Access Provisioning', isAutomated: true },
  { id: 'C.IT.IACTM.002', name: 'User Access Review - Quarterly', isAutomated: false },
  { id: 'C.IT.IACTM.003', name: 'Privileged Access Management', isAutomated: false },
  { id: 'C.IT.IACTM.004', name: 'User Access Termination', isAutomated: true },
  { id: 'C.IT.IACTM.005', name: 'Password Policy Enforcement', isAutomated: false },
  { id: 'C.IT.IACTM.006', name: 'Multi-Factor Authentication', isAutomated: true },
  { id: 'C.IT.IACTM.007', name: 'Service Account Management', isAutomated: true },
  { id: 'C.IT.IACTM.008', name: 'Access Rights Recertification', isAutomated: true },
  { id: 'C.IT.IACTM.009', name: 'Role-Based Access Control', isAutomated: false },
  { id: 'C.IT.IACTM.010', name: 'Privileged User Monitoring', isAutomated: true },
  { id: 'C.IT.IACTM.011', name: 'Access Request Approval Workflow', isAutomated: false },
  { id: 'C.IT.IACTM.012', name: 'Emergency Access Procedures', isAutomated: false },
  { id: 'C.IT.IACTM.013', name: 'Third-Party Access Control', isAutomated: false },
  { id: 'C.IT.IACTM.014', name: 'Remote Access Security', isAutomated: false },
  { id: 'C.IT.IACTM.015', name: 'Access Logging and Monitoring', isAutomated: false },
  { id: 'C.IT.IACTM.016', name: 'Identity Lifecycle Management', isAutomated: false },
  { id: 'C.IT.IACTM.017', name: 'Session Timeout Controls', isAutomated: true },
  { id: 'C.IT.IACTM.018', name: 'Account Lockout Policies', isAutomated: false },
  { id: 'C.IT.IACTM.019', name: 'Segregation of Duties', isAutomated: false },
  { id: 'C.IT.IACTM.020', name: 'Access Control Matrix Review', isAutomated: false },
  { id: 'C.IT.IACTM.021', name: 'Privileged Access Approval', isAutomated: false },
  { id: 'C.IT.IACTM.022', name: 'System Administrator Controls', isAutomated: false },
  { id: 'C.IT.IACTM.023', name: 'Database Access Management', isAutomated: false },
  { id: 'C.IT.IACTM.024', name: 'Application Access Controls', isAutomated: false },
  { id: 'C.IT.IACTM.025', name: 'Network Access Controls', isAutomated: false },
  { id: 'C.IT.IACTM.026', name: 'VPN Access Management', isAutomated: false },
  { id: 'C.IT.IACTM.027', name: 'Cloud Access Security', isAutomated: false },
  { id: 'C.IT.IACTM.028', name: 'Mobile Device Access Control', isAutomated: false },
  { id: 'C.IT.IACTM.029', name: 'Guest Access Management', isAutomated: false },
  { id: 'C.IT.IACTM.030', name: 'Contractor Access Control', isAutomated: false },
  { id: 'C.IT.IACTM.031', name: 'Dormant Account Management', isAutomated: true },
  { id: 'C.IT.IACTM.032', name: 'Generic Account Controls', isAutomated: false },
  { id: 'C.IT.IACTM.033', name: 'Shared Account Management', isAutomated: false },
  { id: 'C.IT.IACTM.034', name: 'API Access Management', isAutomated: false },
  { id: 'C.IT.IACTM.035', name: 'Token-Based Authentication', isAutomated: false },
  { id: 'C.IT.IACTM.036', name: 'SSO Implementation', isAutomated: false },
  { id: 'C.IT.IACTM.037', name: 'Biometric Access Controls', isAutomated: false },
  { id: 'C.IT.IACTM.038', name: 'Physical Access Integration', isAutomated: false },
  { id: 'C.IT.IACTM.039', name: 'Access Provisioning SLA', isAutomated: false },
  { id: 'C.IT.IACTM.040', name: 'Access Deprovisioning SLA', isAutomated: false },
  { id: 'C.IT.IACTM.041', name: 'User Activity Monitoring', isAutomated: false },
  { id: 'C.IT.IACTM.042', name: 'Access Anomaly Detection', isAutomated: false },
  { id: 'C.IT.CRM.121', name: 'Customer Data Access Control', isAutomated: true },
];

export const MOCK_USER = {
  id: 'user-001',
  name: 'Auditor User',
  email: 'auditor@company.com',
};

export const SAMPLE_REQUESTS: EvidenceRequest[] = [
  {
    id: '1',
    requestId: 'PBC-001-A2X',
    controlId: 'C.IT.IACTM.001',
    controlName: 'User Access Provisioning',
    dateFrom: '2025-01-01',
    dateTo: '2025-01-15',
    status: 'Completed',
    createdAt: '2025-01-16T10:30:00Z',
    userId: 'user-001',
  },
  {
    id: '2',
    requestId: 'PBC-002-B3Y',
    controlId: 'C.IT.IACTM.004',
    controlName: 'User Access Termination',
    dateFrom: '2025-01-01',
    dateTo: '2025-01-20',
    status: 'In Progress',
    createdAt: '2025-01-20T14:45:00Z',
    userId: 'user-001',
  },
  {
    id: '3',
    requestId: 'PBC-003-C4Z',
    controlId: 'C.IT.IACTM.010',
    controlName: 'Privileged User Monitoring',
    dateFrom: '2024-12-01',
    dateTo: '2024-12-31',
    status: 'Failed',
    createdAt: '2025-01-05T09:15:00Z',
    userId: 'user-001',
  },
  {
    id: '4',
    requestId: 'PBC-004-D5W',
    controlId: 'C.IT.CRM.121',
    controlName: 'Customer Data Access Control',
    dateFrom: '2024-11-01',
    dateTo: '2024-11-30',
    status: 'Completed',
    createdAt: '2024-12-01T16:20:00Z',
    userId: 'user-001',
  },
  {
    id: '5',
    requestId: 'PBC-005-E6V',
    controlId: 'C.IT.IACTM.006',
    controlName: 'Multi-Factor Authentication',
    dateFrom: '2024-10-01',
    dateTo: '2024-12-31',
    status: 'Completed',
    createdAt: '2025-01-02T11:00:00Z',
    userId: 'user-001',
  },
];

export const SAMPLE_EVIDENCE_REPORTS: Record<string, EvidenceReport[]> = {
  'PBC-001-A2X': [
    {
      keychainDatabase: 'IAM_CENTRAL_DB',
      executedQuery: 'SELECT user_id, provision_date, approver, role_assigned FROM user_provisioning WHERE provision_date BETWEEN :start_date AND :end_date ORDER BY provision_date DESC',
      recordCount: 247,
      executedAt: '2025-01-16T10:35:22Z',
    },
    {
      keychainDatabase: 'HR_SYSTEMS_DB',
      executedQuery: 'SELECT employee_id, hire_date, department, manager_id FROM employees WHERE hire_date BETWEEN :start_date AND :end_date',
      recordCount: 52,
      executedAt: '2025-01-16T10:35:45Z',
    },
  ],
  'PBC-004-D5W': [
    {
      keychainDatabase: 'CRM_ACCESS_DB',
      executedQuery: 'SELECT access_id, user_id, customer_segment, access_level, granted_date, granted_by FROM customer_data_access WHERE granted_date BETWEEN :start_date AND :end_date',
      recordCount: 189,
      executedAt: '2024-12-01T16:25:15Z',
    },
    {
      keychainDatabase: 'AUDIT_LOG_DB',
      executedQuery: 'SELECT log_id, user_id, action_type, customer_id, timestamp FROM customer_access_logs WHERE timestamp BETWEEN :start_date AND :end_date',
      recordCount: 3542,
      executedAt: '2024-12-01T16:26:02Z',
    },
  ],
  'PBC-005-E6V': [
    {
      keychainDatabase: 'MFA_CENTRAL_DB',
      executedQuery: 'SELECT user_id, mfa_method, enrollment_date, last_verified, status FROM mfa_enrollment WHERE enrollment_date BETWEEN :start_date AND :end_date',
      recordCount: 1523,
      executedAt: '2025-01-02T11:05:33Z',
    },
    {
      keychainDatabase: 'AUTH_SYSTEMS_DB',
      executedQuery: 'SELECT auth_id, user_id, auth_method, success, timestamp FROM authentication_logs WHERE auth_method IN (\'MFA_PUSH\', \'MFA_SMS\', \'MFA_TOTP\') AND timestamp BETWEEN :start_date AND :end_date',
      recordCount: 45672,
      executedAt: '2025-01-02T11:06:12Z',
    },
  ],
};

export const EXTERNAL_LINKS = {
  sharepointIntakeForm: 'https://company.sharepoint.com/sites/pbc-intake',
  documentCentral: 'https://company.sharepoint.com/sites/eot-document-central',
};

export function generateRequestId(): string {
  const prefix = 'PBC';
  const num = Math.floor(Math.random() * 999).toString().padStart(3, '0');
  const suffix = Array.from({ length: 3 }, () => 
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join('');
  return `${prefix}-${num}-${suffix}`;
}

export function isAutomatedControl(controlId: string): boolean {
  return AUTOMATED_CONTROL_IDS.includes(controlId);
}
