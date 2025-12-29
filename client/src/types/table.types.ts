export interface ColumnDefinition {
  header: string;
  accessorKey: string;
  cell?: (item: Record<string, unknown>) => React.ReactNode;
}

export type ColumnVisibility = Record<string, boolean>;

export type CardFieldVisibility = Record<string, boolean>;

export interface CardFieldDefinition {
  label: string;
  key: string;
}

export interface ColumnPreset {
  name: string;
  columns: string[] | 'all' | 'default';
}

export interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc';
}

export interface ColumnFilters {
  [key: string]: string[];
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}
