import type { CMDBAsset, CMDBHistoryRecord, CMDBHistoryCache, DialogHistoryData } from './asset.types';
import type { ColumnDefinition, ColumnVisibility, CardFieldVisibility, CardFieldDefinition, ColumnPreset, SortConfig, ColumnFilters } from './column.types';

export interface UseCMDBDataReturn {
  data: CMDBAsset[];
  isLoading: boolean;
  searchFilteredData: CMDBAsset[];
}

export interface UseCMDBHistoryReturn {
  expandedRows: Set<string>;
  historyCache: CMDBHistoryCache;
  historyLoading: Record<string, boolean>;
  historyPage: Record<string, number>;
  toggleRowExpansion: (assetId: string) => void;
  setHistoryPageForAsset: (assetId: string, page: number) => void;
  dialogHistoryData: DialogHistoryData | null;
  dialogHistoryLoading: boolean;
  dialogHistoryPage: number;
  setDialogHistoryPage: (page: number) => void;
  fetchDialogHistory: (assetId: string) => void;
}

export interface UseCMDBColumnVisibilityReturn {
  columnVisibility: ColumnVisibility;
  cardFieldVisibility: CardFieldVisibility;
  visibleColumns: ColumnDefinition[];
  visibleCardFields: CardFieldDefinition[];
  visibleColumnCount: number;
  setColumnVisibility: React.Dispatch<React.SetStateAction<ColumnVisibility>>;
  setCardFieldVisibility: React.Dispatch<React.SetStateAction<CardFieldVisibility>>;
  applyPreset: (preset: ColumnPreset) => void;
  columnSearchQuery: string;
  setColumnSearchQuery: (query: string) => void;
}

export interface UseCMDBDialogsReturn {
  selectedItem: CMDBAsset | null;
  isDialogOpen: boolean;
  dialogTab: 'details' | 'history';
  setDialogTab: (tab: 'details' | 'history') => void;
  openDetailsDialog: (item: CMDBAsset) => void;
  closeDetailsDialog: () => void;
  selectedHistoryItem: CMDBHistoryRecord | null;
  isHistoryDialogOpen: boolean;
  openHistorySnapshotDialog: (item: CMDBHistoryRecord) => void;
  closeHistorySnapshotDialog: () => void;
}

export interface UseCMDBSearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchColumn: string;
  setSearchColumn: (column: string) => void;
  openCombobox: boolean;
  setOpenCombobox: (open: boolean) => void;
}

export interface UseCMDBTableReturn {
  sortConfig: SortConfig | null;
  handleSort: (key: string) => void;
  columnFilters: ColumnFilters;
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFilters>>;
  getUniqueValues: (key: string) => string[];
  handleFilterChange: (key: string, value: string, uniqueValues: string[]) => void;
  handleSelectAll: (key: string) => void;
  handleClearColumnFilter: (key: string) => void;
}

export interface UseCMDBPaginationReturn {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  paginatedData: CMDBAsset[];
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export interface UseCMDBViewReturn {
  view: 'table' | 'cards';
  setView: (view: 'table' | 'cards') => void;
}
