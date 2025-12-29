import type { TPIAsset } from '../types/asset.types';
import type { ColumnPreset, CardFieldDefinition } from '../types/column.types';

export const ALL_COLUMN_KEYS: (keyof TPIAsset)[] = [
  'id', 'name', 'cmdbStatus', 'assetType', 'affinityGroup', 'appApprModernDelivery', 'applicationTypeFinancial',
  'architect', 'assetIdInFAST', 'assetIdInSchedule', 'assetIdInWeeklyStatusReport', 'assetTier', 'blockFunding',
  'btoAlignment', 'businessOwnerCommsCheck', 'businessOwnerOwnedBy', 'businessOwnerSME', 'cashPaymentSystems',
  'cmdbBeingRetired', 'cmdbLegalHold', 'concatinatedBTOandDivision', 'connectorStatus', 'cotsOrInHouseBuilt',
  'customerFacing', 'defaultTier', 'description', 'disposition', 'externalFacing', 'financialImpact4hrOutage',
  'foundational', 'highLevelBTO', 'hosted', 'infoSecCritical', 'informationClassification', 'isSaas',
  'itOwnerCommsCheck', 'itOwnerManagedBy', 'keyChainOnboardingStatus', 'maintenanceWindow', 'mdAssetDesignation',
  'multiFactorAuthentication', 'nfr9', 'nfr10', 'nonDefaultTier1', 'nonDefaultTier2', 'nonDefaultTier3',
  'nonDefaultTier4', 'onboardingStatus', 'operationalHours', 'owningInternalOrg', 'ppiClassification',
  'privilegedAccess', 'sox', 'spof', 'sppi', 'status', 'supportSME', 'supportedBy', 'supportedByCommsCheck', 'version'
];

export const DEFAULT_COLUMNS: (keyof TPIAsset)[] = [
  'id', 'name', 'cmdbStatus', 'assetType', 'btoAlignment', 'applicationTypeFinancial', 
  'itOwnerManagedBy', 'businessOwnerOwnedBy', 'connectorStatus', 'onboardingStatus', 
  'disposition', 'assetTier', 'foundational'
];

export const DEFAULT_CARD_FIELDS: (keyof TPIAsset)[] = ['id', 'cmdbStatus', 'assetType', 'hosted'];

export const COLUMN_PRESETS: ColumnPreset[] = [
  { name: 'Default', columns: 'default' },
  { name: 'All Columns', columns: 'all' },
  { name: 'Status Overview', columns: ['id', 'name', 'cmdbStatus', 'connectorStatus', 'onboardingStatus', 'disposition'] },
];

export const CARD_FIELDS: CardFieldDefinition[] = [
  { label: 'CI ID', key: 'id' },
  { label: 'CMDB Status', key: 'cmdbStatus' },
  { label: 'Asset Type', key: 'assetType' },
  { label: 'Hosted', key: 'hosted' }
];

export const HISTORY_PAGE_SIZE = 5;

export const COLUMN_HEADERS: Record<keyof TPIAsset, string> = {
  id: 'CI ID',
  name: 'Name',
  cmdbStatus: 'CMDB Status',
  assetType: 'Asset Type',
  affinityGroup: 'Affinity Group',
  appApprModernDelivery: 'APP APPR MODERN DELIVERY',
  applicationTypeFinancial: 'Application Type Financial',
  architect: 'Architect',
  assetIdInFAST: 'Asset ID in FAST?',
  assetIdInSchedule: 'Asset ID in Schedule?',
  assetIdInWeeklyStatusReport: 'Asset ID in Weekly Status Report',
  assetTier: 'Asset Tier',
  blockFunding: 'Block Funding',
  btoAlignment: 'BTO Alignment',
  businessOwnerCommsCheck: 'Business Owner Comms Check',
  businessOwnerOwnedBy: 'Business Owner Owned by',
  businessOwnerSME: 'Business Owner SME',
  cashPaymentSystems: 'Cash Payment Systems',
  cmdbBeingRetired: 'CMDB Being Retired',
  cmdbLegalHold: 'CMDB Legal Hold',
  concatinatedBTOandDivision: 'Concatinated BTO and Division',
  connectorStatus: 'Connector Status',
  cotsOrInHouseBuilt: 'COTS or In House Built',
  customerFacing: 'Customer Facing',
  defaultTier: 'Default Tier',
  description: 'Description',
  disposition: 'Disposition',
  externalFacing: 'External Facing',
  financialImpact4hrOutage: 'Financial Impact 4hr Outage',
  foundational: 'Foundational',
  highLevelBTO: 'High-Level BTO',
  hosted: 'Hosted',
  infoSecCritical: 'InfoSec Critical',
  informationClassification: 'Information Classification',
  isSaas: 'Is SAAS',
  itOwnerCommsCheck: 'IT Owner Comms Check',
  itOwnerManagedBy: 'IT Owner Managed by',
  keyChainOnboardingStatus: 'KeyChain Onboarding Status',
  maintenanceWindow: 'Maintenance Window',
  mdAssetDesignation: 'MD Asset Designation',
  multiFactorAuthentication: 'Multi Factor Authentication',
  nfr9: 'NFR 9',
  nfr10: 'NFR 10',
  nonDefaultTier1: 'Non Default Tier 1',
  nonDefaultTier2: 'Non Default Tier 2',
  nonDefaultTier3: 'Non Default Tier 3',
  nonDefaultTier4: 'Non Default Tier 4',
  onboardingStatus: 'Onboarding Status',
  operationalHours: 'Operational Hours',
  owningInternalOrg: 'Owning Internal Org',
  ppiClassification: 'PPI Classification',
  privilegedAccess: 'Privileged Access',
  sox: 'SOX',
  spof: 'SPOF',
  sppi: 'SPPI',
  status: 'Status',
  supportSME: 'Support SME',
  supportedBy: 'Supported by',
  supportedByCommsCheck: 'Supported By Comms Check',
  version: 'Version',
  createdAt: 'Created At',
};
