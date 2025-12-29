import type { TPIAsset } from './asset.types';

export interface ColumnDefinition {
  header: string;
  accessorKey: keyof TPIAsset;
  cell?: (item: TPIAsset) => React.ReactNode;
}

export interface CardFieldDefinition {
  label: string;
  key: keyof TPIAsset;
}

export interface ColumnPreset {
  name: string;
  columns: (keyof TPIAsset)[] | 'all' | 'default';
}

export type ColumnVisibility = Record<string, boolean>;
export type CardFieldVisibility = Record<string, boolean>;
