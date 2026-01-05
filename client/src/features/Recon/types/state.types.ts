import type { ReconAsset, GroupedReconAsset } from './asset.types';
import type { ColumnDefinition, CardFieldDefinition } from './column.types';
import type { ColumnPreset } from '@/types/table.types';

export interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc';
}

export interface UseReconDataReturn {
  assets: ReconAsset[];
  groupedAssets: GroupedReconAsset[];
  totalCount: number;
  totalGroups: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  filterOptions: Record<string, string[]>;
  fetchData: (params: any) => Promise<void>;
}

export interface UseReconDialogsReturn {
  isDialogOpen: boolean;
  selectedItem: ReconAsset | null;
  openDetailsDialog: (item: ReconAsset) => void;
  closeDetailsDialog: () => void;
}

export interface UseReconColumnVisibilityReturn {
  columnVisibility: Record<string, boolean>;
  setColumnVisibility: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  visibleColumns: ColumnDefinition[];
  visibleCardFields: CardFieldDefinition[];
  columnSearchQuery: string;
  setColumnSearchQuery: (query: string) => void;
  visibleColumnCount: number;
  applyPreset: (preset: ColumnPreset) => void;
}

export interface UseReconPageReturn {
  data: UseReconDataReturn;
  columns: UseReconColumnVisibilityReturn;
  dialogs: UseReconDialogsReturn;
  search: {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    searchColumn: string;
    setSearchColumn: (column: string) => void;
    openCombobox: boolean;
    setOpenCombobox: (open: boolean) => void;
  };
  table: {
    sortConfig: SortConfig;
    handleSort: (key: string) => void;
    columnFilters: Record<string, string[]>;
    setColumnFilters: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
    getUniqueValues: (key: string) => string[];
    handleFilterChange: (key: string, value: string, uniqueValues: string[]) => void;
    handleSelectAll: (key: string) => void;
    handleClearColumnFilter: (key: string) => void;
    expandedGroups: Set<string>;
    toggleGroup: (applicationName: string) => void;
    expandAll: () => void;
    collapseAll: () => void;
  };
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    totalGroups: number;
    setCurrentPage: (page: number) => void;
    setPageSize: (size: number) => void;
    paginatedData: ReconAsset[];
    paginatedGroupedData: GroupedReconAsset[];
  };
  view: {
    view: 'table' | 'card';
    setView: (view: 'table' | 'card') => void;
  };
  exportToExcel: () => Promise<void>;
  allColumns: ColumnDefinition[];
  cardFields: CardFieldDefinition[];
}
