import type { ReconAsset } from './asset.types';

export interface ColumnDefinition {
  header: string;
  accessorKey: keyof ReconAsset;
}

export interface CardFieldDefinition {
  label: string;
  key: keyof ReconAsset;
  format?: (val: any) => string;
}

export interface ColumnPreset {
  name: string;
  columns: (keyof ReconAsset)[] | 'default' | 'all';
}
