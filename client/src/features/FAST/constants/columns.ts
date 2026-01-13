import type { CardFieldDefinition, ColumnPreset, FASTColumnKey } from '../types/column.types';

export const COLUMN_HEADERS: Record<FASTColumnKey, string> = {
  id: 'Asset ID',
  name: 'Name',
  kalmAssignee: 'KALM Assignee',
  onboardingStatus: 'Onboarding Status',
  onboardingDisposition: 'Onboarding Disposition',
  airDisposition: 'AIR Disposition',
  maintenanceDisposition: 'Maintenance Disposition',
  lastConnectorDeliveryDate: 'Last Connector Delivery Date',
  maintenanceSLAExpiration: 'Maintenance SLA Expiration',
  technology: 'Technology',
  cmdbStatus: 'CMDB Status',
  cmdbBeingRetired: 'CMDB Being Retired',
  cmdbLegalHold: 'CMDB Legal Hold',
  ticketsOpened: 'Tickets Opened',
  assetType: 'Asset Type',
  yearOnboarded: 'Year Onboarded',
  monthOnboarded: 'Month Onboarded',
  assetPOCs: 'Asset POCs',
  onboardingSchedule: 'Onboarding Schedule',
  entitlementsMissing: 'Entitlements Missing',
  membersMissing: 'Members Missing',
  cisMissing: 'CIS Missing',
  reliesOnCAFederation: 'Relies on CA Federation',
  connectorPattern: 'Connector Pattern',
  automationTeam: 'Automation Team',
  nameOfConnector: 'Name of Connector',
  connectorStatus: 'Connector Status',
  enrollmentStatus: 'Enrollment Status',
  evidenceStatus: 'Evidence Status',
  miSchedule: 'MI Schedule',
  miLastAIRUpload: 'MI Last AIR Upload',
  miDaysSince: 'MI Days Since',
  miDueDate: 'MI Due Date',
  miOnboardingChangeDate: 'MI Onboarding Change Date',
  miL2Assignee: 'MI L2 Assignee',
  miStatus: 'MI Status',
  attestationKickedOff: 'Attestation Kicked Off',
  attestationComplete: 'Attestation Complete',
  aiLastCandAAttestation: 'AI Last C&A Attestation',
  keychainAttestationKickoffDate: 'Keychain Attestation Kickoff Date',
  aiDaysSince: 'AI Days Since',
  aiAttestationDueDate: 'AI Attestation Due Date',
  aiOnboardingChangeDate: 'AI Onboarding Change Date',
  aiL2Assignee: 'AI L2 Assignee',
  aiStatus: 'AI Status',
  theGap: 'The Gap',
  comments: 'Comments',
  lastModifiedBy: 'Last Modified By',
  lastModifiedDate: 'Last Modified Date',
};

export const ALL_COLUMN_KEYS: FASTColumnKey[] = Object.keys(COLUMN_HEADERS) as FASTColumnKey[];

export const ADMIN_DEFAULT_COLUMNS: FASTColumnKey[] = [
  'id', 'name', 'kalmAssignee', 'onboardingStatus', 'onboardingDisposition',
  'airDisposition', 'maintenanceDisposition', 'cmdbStatus', 'assetType', 'technology',
  'connectorStatus', 'enrollmentStatus', 'evidenceStatus', 'lastModifiedBy', 'lastModifiedDate'
];

export const VIEWER_DEFAULT_COLUMNS: FASTColumnKey[] = [
  'id', 'name', 'assetType', 'technology', 'onboardingStatus', 'cmdbStatus',
  'maintenanceDisposition', 'airDisposition'
];

export const DEFAULT_CARD_FIELDS: FASTColumnKey[] = [
  'id', 'assetType', 'technology', 'onboardingStatus', 'maintenanceDisposition', 'connectorStatus', 'cmdbStatus'
];

export const CARD_FIELDS: CardFieldDefinition[] = [
  { label: 'Asset ID', key: 'id' },
  { label: 'Asset Type', key: 'assetType' },
  { label: 'Technology', key: 'technology' },
  { label: 'Onboarding Status', key: 'onboardingStatus' },
  { label: 'Maintenance Disposition', key: 'maintenanceDisposition' },
  { label: 'Connector Status', key: 'connectorStatus' },
  { label: 'CMDB Status', key: 'cmdbStatus' },
  { label: 'KALM Assignee', key: 'kalmAssignee' },
  { label: 'Year Onboarded', key: 'yearOnboarded' },
];

export const COLUMN_PRESETS: ColumnPreset[] = [
  { name: 'Default', columns: 'default' },
  { name: 'All Columns', columns: 'all' },
  { name: 'Onboarding Focus', columns: ['id', 'name', 'onboardingStatus', 'onboardingDisposition', 'kalmAssignee', 'yearOnboarded', 'monthOnboarded', 'onboardingSchedule'] },
  { name: 'Maintenance Focus', columns: ['id', 'name', 'maintenanceDisposition', 'maintenanceSLAExpiration', 'miStatus', 'miSchedule', 'miL2Assignee', 'miDueDate'] },
  { name: 'Attestation Focus', columns: ['id', 'name', 'attestationKickedOff', 'attestationComplete', 'aiStatus', 'aiL2Assignee', 'aiAttestationDueDate', 'aiLastCandAAttestation'] },
  { name: 'Connector Focus', columns: ['id', 'name', 'connectorStatus', 'connectorPattern', 'nameOfConnector', 'automationTeam', 'reliesOnCAFederation'] },
];

export const ENUM_FIELDS: Record<string, string[]> = {
  onboardingStatus: ['Not Started', 'Pending', 'In Progress', 'Blocked', 'Onboarded'],
  onboardingDisposition: ['N/A', 'Pending Review', 'Approved', 'Rejected', 'Waived'],
  airDisposition: ['N/A', 'Pending Review', 'Approved', 'Rejected', 'Waived'],
  maintenanceDisposition: ['N/A', 'Pending Review', 'Approved', 'Rejected', 'Waived'],
  cmdbStatus: ['Active', 'Retired', 'Provisioning', 'Maintenance', 'Decommissioned'],
  connectorStatus: ['Not Started', 'In Development', 'Testing', 'Deployed', 'Failed'],
  enrollmentStatus: ['Not Enrolled', 'Pending', 'Enrolled', 'Suspended'],
  evidenceStatus: ['Not Submitted', 'Pending Review', 'Approved', 'Rejected'],
  miStatus: ['Not Started', 'In Progress', 'Complete', 'Overdue'],
  aiStatus: ['Not Started', 'In Progress', 'Complete', 'Overdue'],
  assetType: ['Application', 'Service', 'Platform', 'API', 'Infrastructure'],
  technology: ['Java', '.NET', 'Python', 'Node.js', 'React', 'Angular', 'Legacy'],
};

export const MAX_CARD_FIELDS = 7;

export const getFieldLabel = (key: string): string => {
  return COLUMN_HEADERS[key as FASTColumnKey] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
};
