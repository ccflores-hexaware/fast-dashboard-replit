export const ALL_COLUMN_KEYS = [
  'parentAssetId', 'name', 'assetId', 'btoAlignment', 'version', 'cmdbStatus', 
  'deploymentLifecyclePhase', 'applicationTypeFinancial', 'itOwner', 'businessOwner', 
  'businessOwnerSme', 'supportedBy', 'supportSme', 'architect', 'division', 
  'blockFundingName', 'blockFundingOwner', 'assessmentCategory', 'deploymentLifecycleStartDate', 
  'assetType', 'hosted', 'sox', 'customerFacing', 'sppi', 'ppiClassification', 
  'foundational', 'missionCritical', 'businessCritical', 'supporting', 
  'cotsOrInHouseBuilt', 'isSaas', 'maintenanceWindow', 'operationalHours', 
  'description', 'externalFacing', 'financialImpact4hrOutage', 'assetTier', 
  'informationClassification', 'lastModifiedBy', 'lastModifiedDate'
] as const;

export type SubAssetColumnKey = typeof ALL_COLUMN_KEYS[number];

export const DEFAULT_COLUMNS: SubAssetColumnKey[] = [
  'parentAssetId', 'name', 'assetId', 'btoAlignment', 'cmdbStatus', 'assetType',
  'itOwner', 'businessOwner', 'architect', 'assetTier'
];

export const DEFAULT_CARD_FIELDS: SubAssetColumnKey[] = [
  'parentAssetId', 'assetId', 'btoAlignment', 'cmdbStatus', 'assetType', 'itOwner', 'assetTier'
];

export const COLUMN_HEADERS: Record<SubAssetColumnKey, string> = {
  parentAssetId: 'Parent Asset ID',
  name: 'Name',
  assetId: 'Asset ID',
  btoAlignment: 'BTO Alignment',
  version: 'Version',
  cmdbStatus: 'CMDB Status',
  deploymentLifecyclePhase: 'Deployment Lifecycle Phase',
  applicationTypeFinancial: 'Application Type Financial',
  itOwner: 'IT Owner',
  businessOwner: 'Business Owner',
  businessOwnerSme: 'Business Owner SME',
  supportedBy: 'Supported By',
  supportSme: 'Support SME',
  architect: 'Architect',
  division: 'Division',
  blockFundingName: 'Block Funding Name',
  blockFundingOwner: 'Block Funding Owner',
  assessmentCategory: 'Assessment Category',
  deploymentLifecycleStartDate: 'Deployment Lifecycle Start Date',
  assetType: 'Asset Type',
  hosted: 'Hosted',
  sox: 'SOX',
  customerFacing: 'Customer Facing',
  sppi: 'SPPI',
  ppiClassification: 'PPI Classification',
  foundational: 'Foundational',
  missionCritical: 'Mission Critical',
  businessCritical: 'Business Critical',
  supporting: 'Supporting',
  cotsOrInHouseBuilt: 'COTS or In-House Built',
  isSaas: 'Is SAAS',
  maintenanceWindow: 'Maintenance Window',
  operationalHours: 'Operational Hours',
  description: 'Description',
  externalFacing: 'External Facing',
  financialImpact4hrOutage: 'Financial Impact of 4hr Outage',
  assetTier: 'Asset Tier',
  informationClassification: 'Information Classification',
  lastModifiedBy: 'Last Modified By',
  lastModifiedDate: 'Last Modified Date',
};

export const COLUMN_PRESETS = [
  { name: 'Default', columns: 'default' as const },
  { name: 'All Columns', columns: 'all' as const },
  { name: 'Ownership Focus', columns: ['parentAssetId', 'name', 'itOwner', 'businessOwner', 'businessOwnerSme', 'supportedBy', 'supportSme', 'architect'] as SubAssetColumnKey[] },
  { name: 'Technical Focus', columns: ['parentAssetId', 'name', 'assetType', 'hosted', 'cotsOrInHouseBuilt', 'isSaas', 'maintenanceWindow', 'operationalHours'] as SubAssetColumnKey[] },
  { name: 'Compliance Focus', columns: ['parentAssetId', 'name', 'sox', 'customerFacing', 'sppi', 'ppiClassification', 'foundational', 'missionCritical', 'businessCritical'] as SubAssetColumnKey[] },
];

export const ENUM_FIELDS: Record<string, string[]> = {
  cmdbStatus: ['Active', 'Retired', 'Provisioning', 'Maintenance', 'Decommissioned'],
  deploymentLifecyclePhase: ['Development', 'Testing', 'Staging', 'Production', 'Deprecated'],
  applicationTypeFinancial: ['Financial', 'Non-Financial'],
  assetType: ['Application', 'Service', 'Platform', 'API', 'Infrastructure'],
  hosted: ['On-Premise', 'Cloud', 'Hybrid'],
  sox: ['Yes', 'No'],
  customerFacing: ['Yes', 'No'],
  sppi: ['Yes', 'No'],
  ppiClassification: ['Public', 'Internal', 'Confidential', 'Restricted'],
  foundational: ['Yes', 'No'],
  missionCritical: ['Yes', 'No'],
  businessCritical: ['Yes', 'No'],
  supporting: ['Yes', 'No'],
  cotsOrInHouseBuilt: ['COTS', 'In-House', 'Hybrid'],
  isSaas: ['Yes', 'No'],
  externalFacing: ['Yes', 'No'],
  assetTier: ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'],
  informationClassification: ['Public', 'Internal', 'Confidential', 'Restricted'],
};

export const CARD_FIELDS = ALL_COLUMN_KEYS.map(key => ({
  key,
  label: COLUMN_HEADERS[key],
}));

export const MAX_CARD_FIELDS = 7;
