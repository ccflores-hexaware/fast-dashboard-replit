import type { FASTAsset, FASTActivity } from './asset.types';
import type { ColumnDefinition, CardFieldDefinition, ColumnVisibility, SortConfig } from './column.types';

export type { SortConfig };

export interface FASTDataState {
  data: FASTAsset[];
  isLoading: boolean;
}

export interface FASTSearchState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchColumn: string;
  setSearchColumn: (column: string) => void;
  openCombobox: boolean;
  setOpenCombobox: (open: boolean) => void;
}

export interface FASTColumnsState {
  columnVisibility: ColumnVisibility;
  setColumnVisibility: React.Dispatch<React.SetStateAction<ColumnVisibility>>;
  cardFieldVisibility: ColumnVisibility;
  setCardFieldVisibility: React.Dispatch<React.SetStateAction<ColumnVisibility>>;
  visibleColumns: ColumnDefinition[];
  visibleCardFields: CardFieldDefinition[];
  visibleColumnCount: number;
  columnSearchQuery: string;
  setColumnSearchQuery: (query: string) => void;
  applyPreset: (preset: any) => void;
  allColumns: ColumnDefinition[];
  cardFields: CardFieldDefinition[];
}

export interface FASTTableState {
  sortConfig: SortConfig | null;
  handleSort: (key: string) => void;
  columnFilters: Record<string, string[]>;
  setColumnFilters: (filters: Record<string, string[]>) => void;
}

export interface FASTPaginationState {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  paginatedData: FASTAsset[];
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export interface FASTDialogsState {
  selectedItem: FASTAsset | null;
  isDialogOpen: boolean;
  isEditing: boolean;
  editFormData: Partial<FASTAsset>;
  originalItem: FASTAsset | null;
  isSaving: boolean;
  comment: string;
  assetIdError: string | null;
  assetIdAvailable: boolean;
  dateFieldErrors: Record<string, string | null>;
  activeTab: 'details' | 'activity';
  activities: FASTActivity[];
  isLoadingActivities: boolean;
  activityDisplayLimit: number;
  isDuplicateConfirmOpen: boolean;
  isCreatingSubAsset: boolean;
  setComment: (comment: string) => void;
  setActiveTab: (tab: 'details' | 'activity') => void;
  setActivityDisplayLimit: (limit: number | ((prev: number) => number)) => void;
  setEditFormData: React.Dispatch<React.SetStateAction<Partial<FASTAsset>>>;
  setDateFieldErrors: React.Dispatch<React.SetStateAction<Record<string, string | null>>>;
  setIsDuplicateConfirmOpen: (open: boolean) => void;
  openDetailsDialog: (item: FASTAsset) => void;
  openEditDialog: (item?: FASTAsset) => void;
  closeDialog: () => void;
  handleSave: () => Promise<void>;
  handleDuplicate: () => Promise<void>;
  validateAssetId: (id: string) => boolean;
}

export interface FASTViewState {
  view: 'table' | 'card';
  setView: (view: 'table' | 'card') => void;
}

export interface UseFASTPageReturn {
  data: FASTDataState;
  search: FASTSearchState;
  columns: FASTColumnsState;
  dialogs: FASTDialogsState;
  table: FASTTableState;
  pagination: FASTPaginationState;
  view: FASTViewState;
  exportToExcel: () => void;
  subAssetCounts: Record<string, number>;
  refreshData: () => Promise<void>;
}
