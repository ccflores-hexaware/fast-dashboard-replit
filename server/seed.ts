import { db } from "./db";
import { fastAssets, tpiAssets, btoAssets, cmdbAssets, pbcControls, pbcEvidenceRequests, pbcEvidenceReports } from "@shared/schema";

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomDate = (startYear: number, endYear: number): string => {
  const start = new Date(startYear, 0, 1);
  const end = new Date(endYear, 11, 31);
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
};

const formatDateConsistent = (date: Date): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month} ${day}, ${year} ${hours}:${minutes}`;
};

const randomDateTime = (startYear: number, endYear: number): string => {
  const start = new Date(startYear, 0, 1);
  const end = new Date(endYear, 11, 31);
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return formatDateConsistent(date);
};

async function seed() {
  console.log("Starting database seed...");

  const assetNames = ['Core Banking System', 'Payment Gateway', 'Loan Origination Platform', 'Risk Analytics Engine', 'Customer Portal', 'Document Management', 'Fraud Detection', 'Data Warehouse', 'Mobile Banking App', 'Treasury Management', 'Reporting Hub', 'Identity Service', 'Notification Engine', 'Workflow Automation', 'Integration Hub'];
  const assignees = ['Sarah Jenkins', 'Mike Ross', 'Jessica Pearson', 'Louis Litt', 'Harvey Specter', 'Donna Paulsen', 'Rachel Zane', 'Alex Williams', 'Katrina Bennett', 'Robert Zane'];
  const onboardingStatuses = ['Onboarded', 'In Progress', 'Pending', 'Not Started', 'Blocked'];
  const dispositions = ['Approved', 'Pending Review', 'Rejected', 'N/A', 'Waived'];
  const technologies = ['Java', '.NET', 'Python', 'Node.js', 'Angular', 'React', 'Legacy', 'Mainframe', 'Cloud Native'];
  const cmdbStatuses = ['Active', 'Retired', 'Provisioning', 'Maintenance', 'Decommissioned'];
  const assetTypes = ['Application', 'Service', 'API', 'Database', 'Infrastructure', 'Platform'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const connectorPatterns = ['REST API', 'SOAP', 'File Transfer', 'Database Direct', 'Message Queue', 'Custom'];
  const teams = ['Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta', 'Enterprise Ops', 'Platform Team'];
  const schedules = ['Weekly', 'Bi-Weekly', 'Monthly', 'Quarterly', 'On-Demand'];
  const statuses = ['Green', 'Yellow', 'Red', 'N/A'];
  const yesNo = ['Yes', 'No'];

  console.log("Seeding FAST assets...");
  const fastRecords = [];
  for (let i = 0; i < 100; i++) {
    const idNum = (i + 1).toString().padStart(4, '0');
    const assetId = `AST-${idNum}`;
    const assetName = `${assetNames[i % assetNames.length]} ${Math.floor(i / assetNames.length) + 1}`;
    const numVersions = Math.random() < 0.4 ? Math.floor(Math.random() * 3) + 2 : 1;
    
    for (let v = 1; v <= numVersions; v++) {
      const isLatest = v === numVersions;
      const cmdbStatus = pick(cmdbStatuses);
      const yearOffset = numVersions - v;
      const modifiedYear = 2024 - yearOffset;
      
      fastRecords.push({
        id: assetId,
        name: assetName,
        version: v,
        isLatestVersion: isLatest,
        kalmAssignee: pick(assignees),
        onboardingStatus: pick(onboardingStatuses),
        onboardingDisposition: pick(dispositions),
        airDisposition: pick(dispositions),
        maintenanceDisposition: pick(dispositions),
        lastConnectorDeliveryDate: randomDate(2023, 2025),
        maintenanceSLAExpiration: randomDate(2025, 2027),
        technology: pick(technologies),
        cmdbStatus: cmdbStatus,
        cmdbBeingRetired: pick(yesNo),
        cmdbLegalHold: pick(yesNo),
        ticketsOpened: Math.floor(Math.random() * 20),
        assetType: pick(assetTypes),
        yearOnboarded: 2018 + Math.floor(Math.random() * 7),
        monthOnboarded: pick(months),
        assetPOCs: `${pick(assignees)}, ${pick(assignees)}`,
        onboardingSchedule: pick(schedules),
        entitlementsMissing: pick(yesNo),
        membersMissing: pick(yesNo),
        cisMissing: pick(yesNo),
        reliesOnCAFederation: pick(yesNo),
        connectorPattern: pick(connectorPatterns),
        automationTeam: pick(teams),
        nameOfConnector: `Connector-${Math.floor(Math.random() * 100) + 1}`,
        connectorStatus: pick(['Active', 'Inactive', 'Pending', 'Error']),
        enrollmentStatus: pick(['Enrolled', 'Not Enrolled', 'Pending', 'Exempt']),
        evidenceStatus: pick(['Complete', 'Incomplete', 'Pending Review', 'N/A']),
        miSchedule: pick(schedules),
        miLastAIRUpload: randomDate(2024, 2025),
        miDaysSince: Math.floor(Math.random() * 90),
        miDueDate: randomDate(2025, 2026),
        miOnboardingChangeDate: randomDate(2023, 2025),
        miL2Assignee: pick(assignees),
        miStatus: pick(statuses),
        attestationKickedOff: pick(yesNo),
        attestationComplete: pick(yesNo),
        aiLastCandAAttestation: randomDate(2024, 2025),
        keychainAttestationKickoffDate: randomDate(2024, 2025),
        aiDaysSince: Math.floor(Math.random() * 120),
        aiAttestationDueDate: randomDate(2025, 2026),
        aiOnboardingChangeDate: randomDate(2023, 2025),
        aiL2Assignee: pick(assignees),
        aiStatus: pick(statuses),
        theGap: `${Math.floor(Math.random() * 30)} days`,
        comments: pick(['On track', 'Needs attention', 'Escalated', 'Waiting for approval', 'Under review', '']),
        status: cmdbStatus,
        lastModifiedBy: pick(assignees),
        lastModifiedDate: randomDateTime(modifiedYear, modifiedYear)
      });
    }
  }
  
  await db.insert(fastAssets).values(fastRecords);
  console.log(`Inserted ${fastRecords.length} FAST records`);

  const divisions = ['Single-Family', 'Multifamily', 'Capital Markets', 'Investments', 'Enterprise Ops', 'Legal', 'Finance'];

  console.log("Seeding TPI assets...");
  const tpiRecords = [];
  
  for (let i = 0; i < 100; i++) {
    const idNum = (i + 10001).toString();
    const cmdbStatus = pick(cmdbStatuses);
    tpiRecords.push({
      id: `CI-${idNum}`,
      name: `${pick(['Harmony', 'Vertex', 'Apex', 'Nexus', 'Spectrum'])} Integration ${i + 1}`,
      cmdbStatus: cmdbStatus,
      cmdbBeingRetired: pick(yesNo),
      cmdbLegalHold: pick(yesNo),
      affinityGroup: pick(['Group A', 'Group B', 'Group C']),
      btoAlignment: `BTO-${Math.floor(Math.random() * 500) + 100}`,
      version: `${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 9)}`,
      infoSecCritical: pick(yesNo),
      spof: pick(yesNo),
      applicationTypeFinancial: pick(['Financial', 'Non-Financial']),
      itOwnerManagedBy: pick(assignees),
      businessOwnerOwnedBy: pick(assignees),
      businessOwnerSME: pick(assignees),
      supportedBy: pick(['Internal IT', 'Vendor', 'Hybrid']),
      supportSME: pick(assignees),
      architect: pick(assignees),
      owningInternalOrg: pick(divisions),
      blockFunding: pick(['Funded', 'Unfunded', 'Partial']),
      assetType: pick(['Application', 'Service', 'Interface']),
      hosted: pick(['On-Prem', 'Cloud', 'Hybrid']),
      sox: pick(yesNo),
      customerFacing: pick(yesNo),
      sppi: pick(yesNo),
      ppiClassification: pick(['Public', 'Internal', 'Confidential']),
      cotsOrInHouseBuilt: pick(['COTS', 'In-House']),
      isSaas: pick(yesNo),
      maintenanceWindow: pick(['Weekends', 'Sundays', 'Ad-hoc']),
      operationalHours: pick(['24/7', 'Business Hours']),
      description: `Integration handling data exchange.`,
      externalFacing: pick(yesNo),
      foundational: pick(yesNo),
      defaultTier: pick(yesNo),
      nonDefaultTier1: pick(yesNo),
      nonDefaultTier2: pick(yesNo),
      nonDefaultTier3: pick(yesNo),
      nonDefaultTier4: pick(yesNo),
      assetTier: pick(['Tier 1', 'Tier 2', 'Tier 3']),
      informationClassification: pick(['Public', 'Internal', 'Confidential']),
      privilegedAccess: pick(yesNo),
      appApprModernDelivery: pick(yesNo),
      cashPaymentSystems: pick(yesNo),
      nfr9: pick(['Compliant', 'Non-Compliant']),
      nfr10: pick(['Compliant', 'Non-Compliant']),
      keyChainOnboardingStatus: pick(['Onboarded', 'Pending', 'N/A']),
      multiFactorAuthentication: pick(['Enabled', 'Disabled']),
      financialImpact4hrOutage: pick(['High', 'Medium', 'Low']),
      mdAssetDesignation: pick(['Critical', 'Standard']),
      concatinatedBTOandDivision: `BTO-${Math.floor(Math.random() * 100)}-${pick(divisions)}`,
      highLevelBTO: `Objective ${Math.floor(Math.random() * 10)}`,
      itOwnerCommsCheck: pick(['Verified', 'Pending']),
      businessOwnerCommsCheck: pick(['Verified', 'Pending']),
      supportedByCommsCheck: pick(['Verified', 'Pending']),
      assetIdInFAST: pick(yesNo),
      assetIdInSchedule: pick(yesNo),
      assetIdInWeeklyStatusReport: pick(yesNo),
      disposition: pick(['Keep', 'Retire', 'Replace']),
      connectorStatus: pick(['Active', 'Inactive']),
      onboardingStatus: pick(['Complete', 'In Progress', 'Not Started']),
      status: cmdbStatus
    });
  }
  
  await db.insert(tpiAssets).values(tpiRecords);
  console.log(`Inserted ${tpiRecords.length} TPI records`);

  console.log("Seeding BTO assets...");
  const btoRecords = [];
  const objectives = ['Enterprise BTO', 'CAO Division (CAO)', 'Legal (LEG)', 'Finance Division'];
  const higherLevelObjectives = ['EBTO', 'EDO', 'EO&T', 'ICM', 'MF'];
  const btoStatuses = ['On Track', 'At Risk', 'Delayed', 'Completed'];
  
  for (let i = 0; i < 60; i++) {
    const idNum = (i + 501).toString();
    const btoName = objectives[i % objectives.length];
    const hlBto = higherLevelObjectives[i % higherLevelObjectives.length];
    const division = divisions[i % divisions.length];
    
    btoRecords.push({
      id: `BTO-${idNum}`,
      higherLevelBTO: hlBto,
      bto: btoName,
      division: division,
      concatValue: `${btoName}; ${division}`,
      owner: assignees[i % assignees.length],
      deadline: `2025-${(Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0')}-${(Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0')}`,
      status: pick(btoStatuses),
      progress: Math.floor(Math.random() * 100)
    });
  }
  
  await db.insert(btoAssets).values(btoRecords);
  console.log(`Inserted ${btoRecords.length} BTO records`);

  console.log("Seeding CMDB assets...");
  const cmdbRecords = [];
  const configItems = ['Loan Origination', 'Underwriting', 'Customer Portal', 'Data Warehouse', 'Payment Gateway', 'Risk Engine', 'Document Mgmt', 'Identity Svc', 'Notification Svc', 'Reporting Hub'];
  const environments = ['Production', 'Staging', 'Development', 'Disaster Recovery'];
  const cmdbItemStatuses = ['Operational', 'Degraded', 'Offline', 'Maintenance'];
  const owners = ['IT Ops', 'Risk Tech', 'Digital Exp', 'Data Eng', 'FinTech', 'SecOps', 'DevOps', 'Platform Eng'];

  for (let i = 0; i < 100; i++) {
    const idNum = (i + 9001).toString();
    cmdbRecords.push({
      id: `CI-${idNum}`,
      configItem: configItems[i % configItems.length],
      version: `v${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 9)}.${Math.floor(Math.random() * 9)}`,
      environment: environments[i % environments.length],
      status: pick(cmdbItemStatuses),
      owner: owners[i % owners.length],
      lastUpdated: randomDate(2023, 2025)
    });
  }
  
  await db.insert(cmdbAssets).values(cmdbRecords);
  console.log(`Inserted ${cmdbRecords.length} CMDB records`);

  console.log("Seeding PBC controls...");
  const pbcControlRecords = [
    { controlId: 'C.IT.IACTM.001', name: 'User Access Provisioning', isAutomated: true },
    { controlId: 'C.IT.IACTM.002', name: 'User Access Review - Quarterly', isAutomated: false },
    { controlId: 'C.IT.IACTM.003', name: 'Privileged Access Management', isAutomated: false },
    { controlId: 'C.IT.IACTM.004', name: 'User Access Termination', isAutomated: true },
    { controlId: 'C.IT.IACTM.005', name: 'Password Policy Enforcement', isAutomated: false },
    { controlId: 'C.IT.IACTM.006', name: 'Multi-Factor Authentication', isAutomated: true },
    { controlId: 'C.IT.IACTM.007', name: 'Service Account Management', isAutomated: true },
    { controlId: 'C.IT.IACTM.008', name: 'Access Rights Recertification', isAutomated: true },
    { controlId: 'C.IT.IACTM.009', name: 'Role-Based Access Control', isAutomated: false },
    { controlId: 'C.IT.IACTM.010', name: 'Privileged User Monitoring', isAutomated: true },
    { controlId: 'C.IT.IACTM.011', name: 'Access Request Approval Workflow', isAutomated: false },
    { controlId: 'C.IT.IACTM.012', name: 'Emergency Access Procedures', isAutomated: false },
    { controlId: 'C.IT.IACTM.013', name: 'Third-Party Access Control', isAutomated: false },
    { controlId: 'C.IT.IACTM.014', name: 'Remote Access Security', isAutomated: false },
    { controlId: 'C.IT.IACTM.015', name: 'Access Logging and Monitoring', isAutomated: false },
    { controlId: 'C.IT.IACTM.016', name: 'Identity Lifecycle Management', isAutomated: false },
    { controlId: 'C.IT.IACTM.017', name: 'Session Timeout Controls', isAutomated: true },
    { controlId: 'C.IT.IACTM.018', name: 'Account Lockout Policies', isAutomated: false },
    { controlId: 'C.IT.IACTM.019', name: 'Segregation of Duties', isAutomated: false },
    { controlId: 'C.IT.IACTM.020', name: 'Access Control Matrix Review', isAutomated: false },
    { controlId: 'C.IT.IACTM.021', name: 'Privileged Access Approval', isAutomated: false },
    { controlId: 'C.IT.IACTM.022', name: 'System Administrator Controls', isAutomated: false },
    { controlId: 'C.IT.IACTM.023', name: 'Database Access Management', isAutomated: false },
    { controlId: 'C.IT.IACTM.024', name: 'Application Access Controls', isAutomated: false },
    { controlId: 'C.IT.IACTM.025', name: 'Network Access Controls', isAutomated: false },
    { controlId: 'C.IT.IACTM.026', name: 'VPN Access Management', isAutomated: false },
    { controlId: 'C.IT.IACTM.027', name: 'Cloud Access Security', isAutomated: false },
    { controlId: 'C.IT.IACTM.028', name: 'Mobile Device Access Control', isAutomated: false },
    { controlId: 'C.IT.IACTM.029', name: 'Guest Access Management', isAutomated: false },
    { controlId: 'C.IT.IACTM.030', name: 'Contractor Access Control', isAutomated: false },
    { controlId: 'C.IT.IACTM.031', name: 'Dormant Account Management', isAutomated: true },
    { controlId: 'C.IT.IACTM.032', name: 'Generic Account Controls', isAutomated: false },
    { controlId: 'C.IT.IACTM.033', name: 'Shared Account Management', isAutomated: false },
    { controlId: 'C.IT.IACTM.034', name: 'API Access Management', isAutomated: false },
    { controlId: 'C.IT.IACTM.035', name: 'Token-Based Authentication', isAutomated: false },
    { controlId: 'C.IT.IACTM.036', name: 'SSO Implementation', isAutomated: false },
    { controlId: 'C.IT.IACTM.037', name: 'Biometric Access Controls', isAutomated: false },
    { controlId: 'C.IT.IACTM.038', name: 'Physical Access Integration', isAutomated: false },
    { controlId: 'C.IT.IACTM.039', name: 'Access Provisioning SLA', isAutomated: false },
    { controlId: 'C.IT.IACTM.040', name: 'Access Deprovisioning SLA', isAutomated: false },
    { controlId: 'C.IT.IACTM.041', name: 'User Activity Monitoring', isAutomated: false },
    { controlId: 'C.IT.IACTM.042', name: 'Access Anomaly Detection', isAutomated: false },
    { controlId: 'C.IT.CRM.121', name: 'Customer Data Access Control', isAutomated: true },
  ];
  
  await db.insert(pbcControls).values(pbcControlRecords);
  console.log(`Inserted ${pbcControlRecords.length} PBC control records`);

  console.log("Seeding PBC evidence requests...");
  const pbcRequestRecords = [
    {
      requestId: 'PBC-001-A2X',
      controlId: 'C.IT.IACTM.001',
      controlName: 'User Access Provisioning',
      dateFrom: '2025-01-01',
      dateTo: '2025-01-15',
      status: 'Completed',
      userId: 'user-001',
    },
    {
      requestId: 'PBC-002-B3Y',
      controlId: 'C.IT.IACTM.004',
      controlName: 'User Access Termination',
      dateFrom: '2025-01-01',
      dateTo: '2025-01-20',
      status: 'In Progress',
      userId: 'user-001',
    },
    {
      requestId: 'PBC-003-C4Z',
      controlId: 'C.IT.IACTM.010',
      controlName: 'Privileged User Monitoring',
      dateFrom: '2024-12-01',
      dateTo: '2024-12-31',
      status: 'Failed',
      userId: 'user-001',
    },
    {
      requestId: 'PBC-004-D5W',
      controlId: 'C.IT.CRM.121',
      controlName: 'Customer Data Access Control',
      dateFrom: '2024-11-01',
      dateTo: '2024-11-30',
      status: 'Completed',
      userId: 'user-001',
    },
    {
      requestId: 'PBC-005-E6V',
      controlId: 'C.IT.IACTM.006',
      controlName: 'Multi-Factor Authentication',
      dateFrom: '2024-10-01',
      dateTo: '2024-12-31',
      status: 'Completed',
      userId: 'user-001',
    },
  ];
  
  await db.insert(pbcEvidenceRequests).values(pbcRequestRecords);
  console.log(`Inserted ${pbcRequestRecords.length} PBC request records`);

  console.log("Seeding PBC evidence reports...");
  const pbcReportRecords = [
    {
      requestId: 'PBC-001-A2X',
      keychainDatabase: 'IAM_CENTRAL_DB',
      executedQuery: 'SELECT user_id, provision_date, approver, role_assigned FROM user_provisioning WHERE provision_date BETWEEN :start_date AND :end_date ORDER BY provision_date DESC',
      recordCount: 247,
    },
    {
      requestId: 'PBC-001-A2X',
      keychainDatabase: 'HR_SYSTEMS_DB',
      executedQuery: 'SELECT employee_id, hire_date, department, manager_id FROM employees WHERE hire_date BETWEEN :start_date AND :end_date',
      recordCount: 52,
    },
    {
      requestId: 'PBC-004-D5W',
      keychainDatabase: 'CRM_ACCESS_DB',
      executedQuery: 'SELECT access_id, user_id, customer_segment, access_level, granted_date, granted_by FROM customer_data_access WHERE granted_date BETWEEN :start_date AND :end_date',
      recordCount: 189,
    },
    {
      requestId: 'PBC-004-D5W',
      keychainDatabase: 'AUDIT_LOG_DB',
      executedQuery: 'SELECT log_id, user_id, action_type, customer_id, timestamp FROM customer_access_logs WHERE timestamp BETWEEN :start_date AND :end_date',
      recordCount: 3542,
    },
    {
      requestId: 'PBC-005-E6V',
      keychainDatabase: 'MFA_CENTRAL_DB',
      executedQuery: 'SELECT user_id, mfa_method, enrollment_date, last_verified, status FROM mfa_enrollment WHERE enrollment_date BETWEEN :start_date AND :end_date',
      recordCount: 1523,
    },
    {
      requestId: 'PBC-005-E6V',
      keychainDatabase: 'AUTH_SYSTEMS_DB',
      executedQuery: 'SELECT auth_id, user_id, auth_method, success, timestamp FROM authentication_logs WHERE auth_method IN (\'MFA_PUSH\', \'MFA_SMS\', \'MFA_TOTP\') AND timestamp BETWEEN :start_date AND :end_date',
      recordCount: 45672,
    },
  ];
  
  await db.insert(pbcEvidenceReports).values(pbcReportRecords);
  console.log(`Inserted ${pbcReportRecords.length} PBC report records`);

  console.log("Database seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed error:", error);
  process.exit(1);
});
