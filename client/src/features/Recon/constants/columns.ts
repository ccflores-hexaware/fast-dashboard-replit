import type { ReconAsset } from '../types/asset.types';
import type { ColumnPreset, CardFieldDefinition } from '../types/column.types';

export const ALL_COLUMN_KEYS: (keyof ReconAsset)[] = [
  'applicationname',
  'accountname',
  'entitlementcolumn',
  'entitlementvalue',
  'filepath',
  'status',
];

export const DEFAULT_COLUMNS: (keyof ReconAsset)[] = [
  'applicationname',
  'accountname',
  'entitlementcolumn',
  'entitlementvalue',
  'status',
];

export const DEFAULT_CARD_FIELDS: (keyof ReconAsset)[] = [
  'applicationname',
  'accountname',
  'status',
];

export const COLUMN_PRESETS: ColumnPreset[] = [
  { name: 'Default', columns: 'default' },
  { name: 'All Columns', columns: 'all' },
  { name: 'Status Overview', columns: ['applicationname', 'status'] },
];

export const CARD_FIELDS: CardFieldDefinition[] = [
  { label: 'Application Name', key: 'applicationname' },
  { label: 'Account Name', key: 'accountname' },
  { label: 'Status', key: 'status' },
];

export const COLUMN_HEADERS: Record<string, string> = {
  applicationname: 'Application Name',
  accountname: 'Account Name',
  entitlementcolumn: 'Entitlement Column',
  entitlementvalue: 'Entitlement Value',
  filepath: 'File Path',
  status: 'Status',
};

export const RECORDS_PAGE_SIZE = 5;
