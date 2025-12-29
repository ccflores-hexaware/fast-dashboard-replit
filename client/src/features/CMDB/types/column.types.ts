export type CMDBColumnKey = 
  | 'id' | 'configItem' | 'status' | 'environment' | 'owner' | 'version' | 'lastUpdated';

export interface ColumnDefinition {
  header: string;
  accessorKey: CMDBColumnKey;
}

export interface ColumnVisibility {
  [key: string]: boolean;
}

export interface CardFieldVisibility {
  [key: string]: boolean;
}

export interface CardFieldDefinition {
  label: string;
  key: CMDBColumnKey;
}

export interface ColumnPreset {
  name: string;
  columns: CMDBColumnKey[] | 'all' | 'default';
}

export interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc';
}

export interface ColumnFilters {
  [key: string]: string[];
}
