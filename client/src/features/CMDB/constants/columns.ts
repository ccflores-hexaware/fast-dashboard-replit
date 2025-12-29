import type { CardFieldDefinition, ColumnPreset } from '../types/column.types';

export const COLUMN_HEADERS = {
  id: 'CI ID',
  configItem: 'Config Item',
  status: 'Status',
  environment: 'Environment',
  owner: 'Owner',
  version: 'Version',
  lastUpdated: 'Last Updated',
} as const;

export const ALL_COLUMN_KEYS = Object.keys(COLUMN_HEADERS) as (keyof typeof COLUMN_HEADERS)[];

export const DEFAULT_COLUMNS: (keyof typeof COLUMN_HEADERS)[] = [
  'id', 'configItem', 'status', 'environment', 'owner', 'version'
];

export const DEFAULT_CARD_FIELDS: (keyof typeof COLUMN_HEADERS)[] = [
  'id', 'version', 'environment', 'owner', 'status', 'lastUpdated'
];

export const CARD_FIELDS: CardFieldDefinition[] = [
  { label: 'CI ID', key: 'id' },
  { label: 'Config Item', key: 'configItem' },
  { label: 'Version', key: 'version' },
  { label: 'Environment', key: 'environment' },
  { label: 'Owner', key: 'owner' },
  { label: 'Status', key: 'status' },
  { label: 'Last Updated', key: 'lastUpdated' },
];

export const COLUMN_PRESETS: ColumnPreset[] = [
  { name: 'Default', columns: 'default' },
  { name: 'All Columns', columns: 'all' },
];

export const HISTORY_PAGE_SIZE = 5;
