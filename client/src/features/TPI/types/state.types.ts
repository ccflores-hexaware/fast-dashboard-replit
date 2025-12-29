import type { TPIAsset, TPIHistoryRecord, TPIHistoryResponse } from './asset.types';
import type { ColumnDefinition, ColumnVisibility, CardFieldVisibility, ColumnPreset, CardFieldDefinition } from './column.types';

export interface UseTPIDataReturn {
  assets: TPIAsset[];
  isLoading: boolean;
  error: Error | null;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  filterOptions: Record<string, string[]>;
  fetchData: (params: import('@/types/table.types').PaginationParams) => Promise<void>;
  refetch: () => Promise<void>;
}

export interface UseTPIHistoryReturn {
  historyCache: Record<string, TPIHistoryResponse>;
  expandedRows: Set<string>;
  historyLoading: Record<string, boolean>;
  historyPage: Record<string, number>;
  toggleRowExpansion: (assetId: string) => void;
  fetchHistoryForAsset: (assetId: string) => Promise<void>;
  getHistoryPage: (assetId: string, page: number, pageSize: number) => TPIHistoryRecord[];
  setHistoryPageForAsset: (assetId: string, page: number) => void;
  isLoadingHistory: (assetId: string) => boolean;
  dialogHistoryData: { assetId: string; history: TPIHistoryRecord[]; total: number } | null;
  dialogHistoryLoading: boolean;
  dialogHistoryPage: number;
  setDialogHistoryPage: (page: number) => void;
  fetchDialogHistory: (assetId: string) => Promise<void>;
}

export interface UseTPIColumnVisibilityReturn {
  columnVisibility: ColumnVisibility;
  cardFieldVisibility: CardFieldVisibility;
  visibleColumns: ColumnDefinition[];
  visibleCardFields: CardFieldDefinition[];
  visibleColumnCount: number;
  setColumnVisibility: React.Dispatch<React.SetStateAction<ColumnVisibility>>;
  setCardFieldVisibility: React.Dispatch<React.SetStateAction<CardFieldVisibility>>;
  applyPreset: (preset: ColumnPreset) => void;
  columnSearchQuery: string;
  setColumnSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

export interface UseTPIDialogsReturn {
  selectedItem: TPIAsset | null;
  isDialogOpen: boolean;
  dialogTab: 'details' | 'history';
  openDetailsDialog: (item: TPIAsset) => void;
  closeDetailsDialog: () => void;
  setDialogTab: (tab: 'details' | 'history') => void;
  selectedHistoryItem: TPIHistoryRecord | null;
  isHistoryDialogOpen: boolean;
  openHistorySnapshotDialog: (record: TPIHistoryRecord) => void;
  closeHistorySnapshotDialog: () => void;
}

export interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc';
}

export interface UseTPIPageReturn {
  data: UseTPIDataReturn;
  history: UseTPIHistoryReturn;
  columns: UseTPIColumnVisibilityReturn;
  dialogs: UseTPIDialogsReturn;
  search: {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    searchColumn: string;
    setSearchColumn: (column: string) => void;
    openCombobox: boolean;
    setOpenCombobox: React.Dispatch<React.SetStateAction<boolean>>;
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
  };
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    setCurrentPage: (page: number) => void;
    setPageSize: (size: number) => void;
    paginatedData: TPIAsset[];
  };
  view: {
    view: 'table' | 'card';
    setView: (view: 'table' | 'card') => void;
  };
  exportToExcel: () => void;
  allColumns: ColumnDefinition[];
  cardFields: CardFieldDefinition[];
}
