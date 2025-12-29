import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { useCMDBData } from './useCMDBData';
import { useCMDBHistory } from './useCMDBHistory';
import { useCMDBColumnVisibility } from './useCMDBColumnVisibility';
import { useCMDBDialogs } from './useCMDBDialogs';
import { useViewToggle } from '@/hooks';
import { useToast } from '@/hooks/use-toast';
import type { CMDBAsset } from '../types/asset.types';
import type { SortConfig } from '../types/column.types';
import type { PaginationParams } from '@/types/table.types';

export function useCMDBPage() {
  const { toast } = useToast();
  const columns = useCMDBColumnVisibility();
  const dataHook = useCMDBData();
  const history = useCMDBHistory();
  const dialogs = useCMDBDialogs();
  const { view, setView } = useViewToggle('table');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState('all');
  const [openCombobox, setOpenCombobox] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDataRef = useRef(dataHook.fetchData);
  fetchDataRef.current = dataHook.fetchData;

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
        sortBy: sortConfig?.key || undefined,
        sortOrder: sortConfig?.direction || 'desc',
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
      direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc',
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
    return dataHook.filterOptions[key] || [];
  }, [dataHook.filterOptions]);

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

  const exportToExcel = useCallback(() => {
    const exportData = dataHook.data.map((item: CMDBAsset) => {
      const row: Record<string, string> = {};
      columns.visibleColumns.forEach(col => {
        row[col.header] = String(item[col.accessorKey as keyof CMDBAsset] ?? '');
      });
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'CMDB');
    XLSX.writeFile(wb, `CMDB_Export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast({ title: "Export Complete", description: `Exported ${exportData.length} records.`, variant: "success" });
  }, [dataHook.data, columns.visibleColumns, toast]);

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
    history,
    columns,
    dialogs,
    table: {
      sortConfig,
      handleSort,
      columnFilters,
      getUniqueValues,
      handleFilterChange,
      handleSelectAll,
      handleClearColumnFilter,
    },
    pagination: {
      currentPage,
      pageSize,
      totalPages: dataHook.totalPages,
      totalItems: dataHook.totalCount,
      paginatedData: dataHook.data,
      setCurrentPage: handlePageChange,
      setPageSize: handlePageSizeChange,
    },
    view: {
      view,
      setView,
    },
    exportToExcel,
    allColumns: columns.allColumns,
  };
}
