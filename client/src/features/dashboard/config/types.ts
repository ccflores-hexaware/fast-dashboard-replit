export type ModuleType = 'fast' | 'assets' | 'tpi' | 'bto' | 'cmdb';

export interface ColumnConfig {
  header: string;
  accessorKey: string;
  isAction?: boolean;
}

export interface CardFieldConfig {
  label: string;
  key: string;
}

export interface ColumnPreset {
  name: string;
  columns: string[] | 'all' | 'default';
}

export interface ModuleConfig {
  type: ModuleType;
  title: string;
  description: string;
  titleKey: string;
  statusKey?: string;
  columns: ColumnConfig[];
  cardFields: CardFieldConfig[];
  adminDefaultColumns: string[];
  viewerDefaultColumns: string[];
  defaultCardFields: string[];
  columnPresets: ColumnPreset[];
  allColumnKeys: string[];
  hasVersioning: boolean;
  hasAddNew: boolean;
  hasHistoryToggle: boolean;
  hasCheckHistory: boolean;
}
