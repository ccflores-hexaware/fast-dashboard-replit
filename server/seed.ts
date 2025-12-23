import { db } from "./db";
import { fastAssets, tpiAssets, btoAssets, cmdbAssets } from "@shared/schema";

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

  console.log("Database seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed error:", error);
  process.exit(1);
});
