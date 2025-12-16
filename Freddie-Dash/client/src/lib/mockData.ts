export interface Asset {
  id: string;
  name: string;
  btoAlignment: string;
  version: string;
  cmdbStatus: string;
  deploymentLifecyclePhase: string;
  applicationTypeFinancial: string;
  itOwner: string;
  businessOwner: string;
  businessOwnerSME: string;
  supportedBy: string;
  supportSME: string;
  architect: string;
  division: string;
  blockFundingName: string;
  blockFundingOwner: string;
  assessmentCategory: string;
  deploymentLifecycleStartDate: string;
  type: string;
  hosted: string;
  sox: string;
  customerFacing: string;
  sppi: string;
  ppiClassification: string;
  foundational: string;
  missionCritical: string;
  businessCritical: string;
  supporting: string;
  cotsOrInHouse: string;
  isSaas: string;
  maintenanceWindow: string;
  operationalHours: string;
  description: string;
  // keeping status for compatibility with existing components if needed, or we alias it
  status: string; 
}

export interface TPI {
  id: string; // This will map to CI ID
  name: string;
  cmdbStatus: string;
  cmdbBeingRetired: string;
  cmdbLegalHold: string;
  affinityGroup: string;
  btoAlignment: string;
  version: string;
  infoSecCritical: string;
  spof: string;
  applicationTypeFinancial: string;
  itOwnerManagedBy: string;
  businessOwnerOwnedBy: string;
  businessOwnerSME: string;
  supportedBy: string;
  supportSME: string;
  architect: string;
  owningInternalOrg: string;
  blockFunding: string;
  assetType: string;
  hosted: string;
  sox: string;
  customerFacing: string;
  sppi: string;
  ppiClassification: string;
  cotsOrInHouseBuilt: string;
  isSaas: string;
  maintenanceWindow: string;
  operationalHours: string;
  description: string;
  externalFacing: string;
  foundational: string;
  default: string;
  nonDefaultTier1: string;
  nonDefaultTier2: string;
  nonDefaultTier3: string;
  nonDefaultTier4: string;
  assetTier: string;
  informationClassification: string;
  privilegedAccess: string;
  appApprModernDelivery: string;
  cashPaymentSystems: string;
  nfr9: string;
  nfr10: string;
  keyChainOnboardingStatus: string;
  multiFactorAuthentication: string;
  financialImpact4hrOutage: string;
  mdAssetDesignation: string;
  concatinatedBTOandDivision: string;
  highLevelBTO: string;
  itOwnerCommsCheck: string;
  businessOwnerCommsCheck: string;
  supportedByCommsCheck: string;
  assetIdInFAST: string;
  assetIdInSchedule: string;
  assetIdInWeeklyStatusReport: string;
  disposition: string;
  connectorStatus: string;
  onboardingStatus: string;
  // Legacy fields kept for safety if needed, though we should transition away
  status: string; 
}

export interface BTO {
  id: string;
  higherLevelBTO: string;
  bto: string;
  division: string;
  concatValue: string;
  owner: string;
  deadline: string;
  status: string;
  progress: number;
}

export interface CMDB {
  id: string;
  configItem: string;
  version: string;
  environment: string;
  status: string;
  owner: string;
  lastUpdated: string;
}

// Helper functions
const pick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const randomDate = (startYear: number, endYear: number) => {
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

// Generators to create large datasets
const generateAssets = (count: number): Asset[] => {
  const assetNames = ['Harmony', 'Vertex', 'Apex', 'Nexus', 'Spectrum', 'Canvas', 'Portal', 'Bridge', 'Gateway', 'Core', 'Foundation', 'Summit', 'Beacon', 'Horizon', 'Orbit', 'Pulse', 'Vector', 'Matrix', 'Zenith', 'Echo'];
  const suffixes = ['Suite', 'Platform', 'System', 'Hub', 'Manager', 'Engine', 'Analyzer', 'Connector', 'Dashboard', 'Toolkit'];
  
  const owners = ['Sarah Jenkins', 'Mike Ross', 'Jessica Pearson', 'Louis Litt', 'Harvey Specter', 'Donna Paulsen', 'Rachel Zane', 'Alex Williams', 'Katrina Bennett', 'Robert Zane', 'Samantha Wheeler', 'Dana Scott'];
  const divisions = ['Single-Family', 'Multifamily', 'Capital Markets', 'Investments', 'Enterprise Ops', 'Legal', 'Finance', 'Risk Management', 'Human Resources', 'Information Technology'];
  
  return Array.from({ length: count }).map((_, i) => {
    const idNum = (i + 1).toString().padStart(4, '0');
    const name = `${pick(assetNames)} ${pick(suffixes)} ${i + 1}`;
    const cmdbStatus = pick(['Active', 'Retired', 'Provisioning', 'Maintenance', 'Decommissioned']);
    
    return {
      name: name,
      id: `AST-${idNum}`,
      btoAlignment: `BTO-${Math.floor(Math.random() * 500) + 100}`,
      version: `${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 9)}.${Math.floor(Math.random() * 9)}`,
      cmdbStatus: cmdbStatus,
      deploymentLifecyclePhase: pick(['Analysis', 'Design', 'Development', 'Testing', 'Staging', 'Production', 'Decommission']),
      applicationTypeFinancial: pick(['Financial', 'Non-Financial']),
      itOwner: pick(owners),
      businessOwner: pick(owners),
      businessOwnerSME: pick(owners),
      supportedBy: pick(['Internal IT', 'Vendor Managed', 'Hybrid Team', 'Offshore Partner']),
      supportSME: pick(owners),
      architect: pick(owners),
      division: pick(divisions),
      blockFundingName: `Block Fund ${['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'][i % 5]}`,
      blockFundingOwner: pick(owners),
      assessmentCategory: pick(['Mission Critical', 'Business Critical', 'Business Operational', 'Administrative']),
      deploymentLifecycleStartDate: randomDate(2020, 2024),
      type: pick(['Application', 'Microservice', 'Database', 'Infrastructure', 'Platform', 'SaaS']),
      hosted: pick(['On-Premise', 'AWS Cloud', 'Azure Cloud', 'Hybrid', 'Vendor Cloud']),
      sox: pick(['Yes', 'No']),
      customerFacing: pick(['Yes', 'No']),
      sppi: pick(['Yes', 'No']),
      ppiClassification: pick(['Public', 'Internal Use', 'Confidential', 'Restricted']),
      foundational: pick(['Yes', 'No']),
      missionCritical: pick(['Yes', 'No']),
      businessCritical: pick(['Yes', 'No']),
      supporting: pick(['Yes', 'No']),
      cotsOrInHouse: pick(['COTS', 'In-House', 'Hybrid']),
      isSaas: pick(['Yes', 'No']),
      maintenanceWindow: pick(['Sundays 00:00-04:00', 'Weekends', 'Quarterly', 'Ad-hoc', 'Patch Tuesday']),
      operationalHours: pick(['24/7', 'Business Hours', 'Extended Business Hours', 'Weekdays Only']),
      description: `This asset provides critical functionality for the ${pick(divisions)} division, handling ${pick(['data processing', 'user authentication', 'reporting', 'transactions', 'communications'])} and integration with ${pick(['external partners', 'internal systems', 'legacy databases'])}.`,
      status: cmdbStatus // Mapping for compatibility
    };
  });
};

const generateTPI = (count: number): TPI[] => {
  const assetNames = ['Harmony', 'Vertex', 'Apex', 'Nexus', 'Spectrum', 'Canvas', 'Portal', 'Bridge', 'Gateway', 'Core'];
  const owners = ['Sarah Jenkins', 'Mike Ross', 'Jessica Pearson', 'Louis Litt', 'Harvey Specter', 'Donna Paulsen'];
  const divisions = ['Single-Family', 'Multifamily', 'Capital Markets', 'Investments'];
  
  return Array.from({ length: count }).map((_, i) => {
    const idNum = (i + 10001).toString();
    const cmdbStatus = pick(['Active', 'Retired', 'Provisioning', 'Maintenance']);
    const name = `${pick(assetNames)} Integration ${i + 1}`;
    
    return {
      id: `CI-${idNum}`,
      name: name,
      cmdbStatus: cmdbStatus,
      cmdbBeingRetired: pick(['Yes', 'No']),
      cmdbLegalHold: pick(['Yes', 'No']),
      affinityGroup: pick(['Group A', 'Group B', 'Group C']),
      btoAlignment: `BTO-${Math.floor(Math.random() * 500) + 100}`,
      version: `${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 9)}`,
      infoSecCritical: pick(['Yes', 'No']),
      spof: pick(['Yes', 'No']),
      applicationTypeFinancial: pick(['Financial', 'Non-Financial']),
      itOwnerManagedBy: pick(owners),
      businessOwnerOwnedBy: pick(owners),
      businessOwnerSME: pick(owners),
      supportedBy: pick(['Internal IT', 'Vendor', 'Hybrid']),
      supportSME: pick(owners),
      architect: pick(owners),
      owningInternalOrg: pick(divisions),
      blockFunding: pick(['Funded', 'Unfunded', 'Partial']),
      assetType: pick(['Application', 'Service', 'Interface']),
      hosted: pick(['On-Prem', 'Cloud', 'Hybrid']),
      sox: pick(['Yes', 'No']),
      customerFacing: pick(['Yes', 'No']),
      sppi: pick(['Yes', 'No']),
      ppiClassification: pick(['Public', 'Internal', 'Confidential']),
      cotsOrInHouseBuilt: pick(['COTS', 'In-House']),
      isSaas: pick(['Yes', 'No']),
      maintenanceWindow: pick(['Weekends', 'Sundays', 'Ad-hoc']),
      operationalHours: pick(['24/7', 'Business Hours']),
      description: `Integration for ${name} handling data exchange.`,
      externalFacing: pick(['Yes', 'No']),
      foundational: pick(['Yes', 'No']),
      default: pick(['Yes', 'No']),
      nonDefaultTier1: pick(['Yes', 'No']),
      nonDefaultTier2: pick(['Yes', 'No']),
      nonDefaultTier3: pick(['Yes', 'No']),
      nonDefaultTier4: pick(['Yes', 'No']),
      assetTier: pick(['Tier 1', 'Tier 2', 'Tier 3']),
      informationClassification: pick(['Public', 'Internal', 'Confidential']),
      privilegedAccess: pick(['Yes', 'No']),
      appApprModernDelivery: pick(['Yes', 'No']),
      cashPaymentSystems: pick(['Yes', 'No']),
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
      assetIdInFAST: pick(['Yes', 'No']),
      assetIdInSchedule: pick(['Yes', 'No']),
      assetIdInWeeklyStatusReport: pick(['Yes', 'No']),
      disposition: pick(['Keep', 'Retire', 'Replace']),
      connectorStatus: pick(['Active', 'Inactive']),
      onboardingStatus: pick(['Complete', 'In Progress', 'Not Started']),
      status: cmdbStatus
    };
  });
};

const generateBTO = (count: number): BTO[] => {
  const objectives = ['Enterprise BTO', 'CAO Divison (CAO)', 'Legal (LEG)', 'Finance Division'];
  const higherLevelObjectives = ['EBTO', 'EDO', 'EO&T', 'ICM', 'MF'];
  const divisions = ['Single-Family', 'Multifamily', 'Capital Markets', 'Investments', 'Enterprise Ops'];
  const owners = ['Sarah Jenkins', 'Mike Ross', 'Jessica Pearson', 'Louis Litt', 'Harvey Specter', 'Donna Paulsen', 'Rachel Zane', 'Alex Williams', 'Katrina Bennett', 'Robert Zane'];
  const statuses: BTO['status'][] = ['On Track', 'At Risk', 'Delayed', 'Completed'];
  
  return Array.from({ length: count }).map((_, i) => {
    const idNum = (i + 501).toString();
    const btoName = objectives[i % objectives.length];
    const hlBto = higherLevelObjectives[i % higherLevelObjectives.length];
    const division = divisions[i % divisions.length];
    
    return {
      id: `BTO-${idNum}`,
      higherLevelBTO: hlBto,
      bto: btoName,
      division: division,
      concatValue: `${btoName}; ${division}`,
      owner: owners[i % owners.length],
      deadline: `2025-${(Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0')}-${(Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0')}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      progress: Math.floor(Math.random() * 100)
    };
  });
};

const generateCMDB = (count: number): CMDB[] => {
  const items = ['Loan Origination', 'Underwriting', 'Customer Portal', 'Data Warehouse', 'Payment Gateway', 'Risk Engine', 'Document Mgmt', 'Identity Svc', 'Notification Svc', 'Reporting Hub'];
  const environments: CMDB['environment'][] = ['Production', 'Staging', 'Development', 'Disaster Recovery'];
  const statuses: CMDB['status'][] = ['Operational', 'Degraded', 'Offline', 'Maintenance'];
  const owners = ['IT Ops', 'Risk Tech', 'Digital Exp', 'Data Eng', 'FinTech', 'SecOps', 'DevOps', 'Platform Eng'];

  return Array.from({ length: count }).map((_, i) => {
    const idNum = (i + 9001).toString();
    return {
      id: `CI-${idNum}`,
      configItem: items[i % items.length],
      version: `v${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 9)}.${Math.floor(Math.random() * 9)}`,
      environment: environments[i % environments.length],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      owner: owners[i % owners.length],
      lastUpdated: randomDate(2023, 2025)
    };
  });
};

export interface FAST {
  id: string;
  name: string;
  version: number;
  isLatestVersion: boolean;
  kalmAssignee: string;
  onboardingStatus: string;
  onboardingDisposition: string;
  airDisposition: string;
  maintenanceDisposition: string;
  lastConnectorDeliveryDate: string;
  maintenanceSLAExpiration: string;
  technology: string;
  cmdbStatus: string;
  cmdbBeingRetired: string;
  cmdbLegalHold: string;
  ticketsOpened: number;
  assetType: string;
  yearOnboarded: number;
  monthOnboarded: string;
  assetPOCs: string;
  onboardingSchedule: string;
  entitlementsMissing: string;
  membersMissing: string;
  cisMissing: string;
  reliesOnCAFederation: string;
  connectorPattern: string;
  automationTeam: string;
  nameOfConnector: string;
  connectorStatus: string;
  enrollmentStatus: string;
  evidenceStatus: string;
  miSchedule: string;
  miLastAIRUpload: string;
  miDaysSince: number;
  miDueDate: string;
  miOnboardingChangeDate: string;
  miL2Assignee: string;
  miStatus: string;
  attestationKickedOff: string;
  attestationComplete: string;
  aiLastCandAAttestation: string;
  keychainAttestationKickoffDate: string;
  aiDaysSince: number;
  aiAttestationDueDate: string;
  aiOnboardingChangeDate: string;
  aiL2Assignee: string;
  aiStatus: string;
  theGap: string;
  comments: string;
  status: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
  isFakeAsset?: boolean;
}

const generateFAST = (count: number): FAST[] => {
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

  const allRecords: FAST[] = [];

  for (let i = 0; i < count; i++) {
    const idNum = (i + 1).toString().padStart(4, '0');
    const assetId = `AST-${idNum}`;
    const assetName = `${assetNames[i % assetNames.length]} ${Math.floor(i / assetNames.length) + 1}`;
    
    const numVersions = Math.random() < 0.4 ? Math.floor(Math.random() * 3) + 2 : 1;
    
    for (let v = 1; v <= numVersions; v++) {
      const isLatest = v === numVersions;
      const cmdbStatus = pick(cmdbStatuses);
      const yearOffset = numVersions - v;
      const modifiedYear = 2024 - yearOffset;
      
      allRecords.push({
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
        lastModifiedDate: randomDateTime(modifiedYear, modifiedYear),
        isFakeAsset: false
      });
    }
  }

  return allRecords;
};

export const mockAssets: Asset[] = generateAssets(1000);
export const mockTPI: TPI[] = generateTPI(1000);
export const mockBTO: BTO[] = generateBTO(60);
export const mockCMDB: CMDB[] = generateCMDB(100);
export const mockFAST: FAST[] = generateFAST(500);