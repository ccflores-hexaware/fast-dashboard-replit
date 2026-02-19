import { useMemo, useCallback, useState } from 'react';
import { useFASTData } from './useFASTData';
import { useFASTColumnVisibility } from './useFASTColumnVisibility';
import { useFASTDialogs } from './useFASTDialogs';
import { useViewToggle, usePagination, useSorting, useColumnFilters } from '@/hooks';
import { useUser } from '@/lib/userContext';
import type { FASTAsset } from '../types/asset.types';
import { DEFAULT_TABLE_PAGE_SIZE, DEFAULT_CARD_PAGE_SIZE } from '@/components/Pagination';
import type { UseFASTPageReturn } from '../types/state.types';

export function useFASTPage(): UseFASTPageReturn {
  const { isAdmin } = useUser();
  const columns = useFASTColumnVisibility();
  const dataHook = useFASTData();
  const dialogs = useFASTDialogs();
  const { view, setView: baseSetView } = useViewToggle('table');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState('all');
  const [openCombobox, setOpenCombobox] = useState(false);

  const searchFilteredData = useMemo(() => {
    if (!searchQuery.trim()) return dataHook.data;
    const query = searchQuery.toLowerCase();
    return dataHook.data.filter((item: FASTAsset) => {
      if (searchColumn === 'all') {
        return columns.allColumns.some(col => {
          const value = (item as any)[col.accessorKey];
          return value && String(value).toLowerCase().includes(query);
        });
      }
      const value = (item as any)[searchColumn];
      return value && String(value).toLowerCase().includes(query);
    });
  }, [dataHook.data, searchQuery, searchColumn, columns.allColumns]);

  const { columnFilters, setColumnFilters, filteredData } = useColumnFilters(searchFilteredData);
  const { sortConfig, handleSort, sortedData } = useSorting(filteredData);
  const { currentPage, pageSize, setCurrentPage, setPageSize, paginatedData, totalPages, totalItems } = usePagination(sortedData);

  const handleViewChange = useCallback((newView: 'table' | 'card') => {
    baseSetView(newView);
    setPageSize(newView === 'card' ? DEFAULT_CARD_PAGE_SIZE : DEFAULT_TABLE_PAGE_SIZE);
    setCurrentPage(1);
  }, [baseSetView, setPageSize, setCurrentPage]);

  const handleSearchQueryChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, [setCurrentPage]);

  const handleSearchColumnChange = useCallback((column: string) => {
    setSearchColumn(column);
    setCurrentPage(1);
  }, [setCurrentPage]);

  const handleDialogSave = useCallback(async () => {
    await dialogs.handleSave(dataHook.data, dataHook.setData);
  }, [dialogs, dataHook.data, dataHook.setData]);

  const handleDialogDuplicate = useCallback(async () => {
    const refetchCounts = async () => {
      await dataHook.refetch();
    };
    await dialogs.handleDuplicate(dataHook.data, dataHook.setData, refetchCounts);
  }, [dialogs, dataHook]);

  const validateAssetIdWrapper = useCallback((id: string) => {
    return dialogs.validateAssetId(id, dataHook.data);
  }, [dialogs, dataHook.data]);

  return {
    data: {
      data: dataHook.data,
      isLoading: dataHook.isLoading,
    },
    search: {
      searchQuery,
      setSearchQuery: handleSearchQueryChange,
      searchColumn,
      setSearchColumn: handleSearchColumnChange,
      openCombobox,
      setOpenCombobox,
    },
    columns: {
      columnVisibility: columns.columnVisibility,
      setColumnVisibility: columns.setColumnVisibility,
      cardFieldVisibility: columns.cardFieldVisibility,
      setCardFieldVisibility: columns.setCardFieldVisibility,
      visibleColumns: columns.visibleColumns,
      visibleCardFields: columns.visibleCardFields,
      visibleColumnCount: columns.visibleColumnCount,
      columnSearchQuery: columns.columnSearchQuery,
      setColumnSearchQuery: columns.setColumnSearchQuery,
      applyPreset: columns.applyPreset,
      allColumns: columns.allColumns,
      cardFields: columns.cardFields,
    },
    dialogs: {
      ...dialogs,
      handleSave: handleDialogSave,
      handleDuplicate: handleDialogDuplicate,
      validateAssetId: validateAssetIdWrapper,
    },
    table: {
      sortConfig,
      handleSort,
      columnFilters,
      setColumnFilters,
    },
    pagination: {
      currentPage,
      pageSize,
      totalPages,
      totalItems,
      paginatedData: paginatedData as FASTAsset[],
      setCurrentPage,
      setPageSize,
    },
    view: {
      view,
      setView: handleViewChange,
    },
    subAssetCounts: dataHook.subAssetCounts,
    refreshData: dataHook.refetch,
  };
}
