import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import type { ReconAsset } from '../types/asset.types';
import type { ColumnDefinition, CardFieldDefinition } from '../types/column.types';
import type { UseReconPageReturn, SortConfig } from '../types/state.types';
import { useReconData } from './useReconData';
import { useReconDialogs } from './useReconDialogs';
import { useReconColumnVisibility } from './useReconColumnVisibility';
import { ALL_COLUMN_KEYS, COLUMN_HEADERS, CARD_FIELDS } from '../constants/columns';
import { useViewToggle } from '@/hooks';
import { useToast } from '@/hooks/use-toast';
import type { PaginationParams } from '@/types/table.types';
import { DEFAULT_TABLE_PAGE_SIZE, DEFAULT_CARD_PAGE_SIZE } from '@/components/Pagination';

export function useReconPage(): UseReconPageReturn {
  const { toast } = useToast();
  const data = useReconData();
  const columns = useReconColumnVisibility();
  const dialogs = useReconDialogs();
  const { view, setView: baseSetView } = useViewToggle('table');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState('all');
  const [openCombobox, setOpenCombobox] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_TABLE_PAGE_SIZE);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'desc' });
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const handleViewChange = useCallback((newView: 'table' | 'card') => {
    baseSetView(newView);
    setPageSize(newView === 'card' ? DEFAULT_CARD_PAGE_SIZE : DEFAULT_TABLE_PAGE_SIZE);
    setCurrentPage(1);
  }, [baseSetView]);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const allColumns: ColumnDefinition[] = useMemo(() => 
    ALL_COLUMN_KEYS.map(key => ({
      header: COLUMN_HEADERS[key],
      accessorKey: key,
    })), 
  []);

  const fetchDataRef = useRef(data.fetchData);
  fetchDataRef.current = data.fetchData;

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      const params: PaginationParams = {
        page: currentPage,
        limit: pageSize,
        search: searchQuery || undefined,
        searchColumn: searchColumn !== 'all' ? searchColumn : undefined,
        sortBy: sortConfig.key || undefined,
        sortOrder: sortConfig.direction,
        filters: Object.keys(columnFilters).length > 0 ? columnFilters : undefined,
      };
      fetchDataRef.current(params);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [currentPage, pageSize, searchQuery, searchColumn, sortConfig, columnFilters]);

  const handleSort = useCallback((key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const handleSearchQueryChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleSearchColumnChange = useCallback((column: string) => {
    setSearchColumn(column);
    setCurrentPage(1);
  }, []);

  const getUniqueValues = useCallback((key: string) => {
    return data.filterOptions[key] || [];
  }, [data.filterOptions]);

  const handleFilterChange = useCallback((key: string, value: string, uniqueValues: string[]) => {
    const currentFilters = columnFilters[key];
    let newFilters: string[];
    if (currentFilters === undefined) {
      newFilters = uniqueValues.filter(v => v !== value);
    } else {
      if (currentFilters.includes(value)) {
        newFilters = currentFilters.filter(v => v !== value);
      } else {
        newFilters = [...currentFilters, value];
      }
    }
    const updatedFilters = { ...columnFilters };
    if (newFilters.length === uniqueValues.length) {
      delete updatedFilters[key];
    } else {
      updatedFilters[key] = newFilters;
    }
    setColumnFilters(updatedFilters);
    setCurrentPage(1);
  }, [columnFilters]);

  const handleSelectAll = useCallback((key: string) => {
    const currentFilters = columnFilters[key];
    const updatedFilters = { ...columnFilters };
    if (currentFilters === undefined) {
      updatedFilters[key] = [];
    } else {
      delete updatedFilters[key];
    }
    setColumnFilters(updatedFilters);
    setCurrentPage(1);
  }, [columnFilters]);

  const handleClearColumnFilter = useCallback((key: string) => {
    const updatedFilters = { ...columnFilters };
    delete updatedFilters[key];
    setColumnFilters(updatedFilters);
    setCurrentPage(1);
  }, [columnFilters]);

  const toggleGroup = useCallback((applicationName: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(applicationName)) {
        next.delete(applicationName);
      } else {
        next.add(applicationName);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    const allGroupNames = data.groupedAssets.map(g => g.applicationName);
    setExpandedGroups(prev => {
      const next = new Set(prev);
      allGroupNames.forEach(name => next.add(name));
      return next;
    });
  }, [data.groupedAssets]);

  const collapseAll = useCallback(() => {
    const currentGroupNames = data.groupedAssets.map(g => g.applicationName);
    setExpandedGroups(prev => {
      const next = new Set(prev);
      currentGroupNames.forEach(name => next.delete(name));
      return next;
    });
  }, [data.groupedAssets]);

  const exportToExcel = useCallback(() => {
    const exportData = data.assets.map((item: ReconAsset) => {
      const row: Record<string, string> = {};
      columns.visibleColumns.forEach(col => {
        row[col.header] = String(item[col.accessorKey] ?? '');
      });
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Recon');
    XLSX.writeFile(wb, `Recon_Export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast({ title: "Export Complete", description: `Exported ${exportData.length} records.`, variant: "success" });
  }, [data.assets, columns.visibleColumns, toast]);

  return {
    data,
    columns,
    dialogs,
    search: {
      searchQuery,
      setSearchQuery: handleSearchQueryChange,
      searchColumn,
      setSearchColumn: handleSearchColumnChange,
      openCombobox,
      setOpenCombobox,
    },
    table: {
      sortConfig,
      handleSort,
      columnFilters,
      setColumnFilters,
      getUniqueValues,
      handleFilterChange,
      handleSelectAll,
      handleClearColumnFilter,
      expandedGroups,
      toggleGroup,
      expandAll,
      collapseAll,
    },
    pagination: {
      currentPage,
      pageSize,
      totalPages: data.totalPages,
      totalItems: data.totalCount,
      totalGroups: data.totalGroups,
      setCurrentPage: handlePageChange,
      setPageSize: handlePageSizeChange,
      paginatedData: data.assets,
      paginatedGroupedData: data.groupedAssets,
    },
    view: {
      view: view as 'table' | 'card',
      setView: handleViewChange,
    },
    exportToExcel,
    allColumns,
    cardFields: CARD_FIELDS,
  };
}
