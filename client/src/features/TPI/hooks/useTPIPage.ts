import { useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import type { TPIAsset } from '../types/asset.types';
import type { ColumnDefinition, CardFieldDefinition } from '../types/column.types';
import type { UseTPIPageReturn } from '../types/state.types';
import { useTPIData } from './useTPIData';
import { useTPIHistory } from './useTPIHistory';
import { useTPIColumnVisibility } from './useTPIColumnVisibility';
import { useTPIDialogs } from './useTPIDialogs';
import { ALL_COLUMN_KEYS, COLUMN_HEADERS, CARD_FIELDS } from '../constants/columns';
import { usePagination, useSorting, useColumnFilters, useViewToggle } from '@/hooks';
import { useToast } from '@/hooks/use-toast';

export function useTPIPage(): UseTPIPageReturn {
  const { toast } = useToast();
  const data = useTPIData();
  const history = useTPIHistory();
  const columns = useTPIColumnVisibility();
  const dialogs = useTPIDialogs();
  const { view, setView } = useViewToggle('table');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState('all');
  const [openCombobox, setOpenCombobox] = useState(false);

  const allColumns: ColumnDefinition[] = useMemo(() => 
    ALL_COLUMN_KEYS.map(key => ({
      header: COLUMN_HEADERS[key],
      accessorKey: key,
    })), 
  []);

  const searchFilteredData = useMemo(() => {
    if (!searchQuery.trim()) return data.assets;
    const query = searchQuery.toLowerCase();
    return data.assets.filter((item: TPIAsset) => {
      if (searchColumn === 'all') {
        return allColumns.some(col => {
          const v = item[col.accessorKey];
          return v && String(v).toLowerCase().includes(query);
        });
      }
      const v = item[searchColumn as keyof TPIAsset];
      return v && String(v).toLowerCase().includes(query);
    });
  }, [data.assets, searchQuery, searchColumn, allColumns]);

  const { columnFilters, setColumnFilters, filteredData } = useColumnFilters(searchFilteredData);
  const { sortConfig, handleSort, sortedData } = useSorting(filteredData);
  const { currentPage, pageSize, setCurrentPage, setPageSize, paginatedData, totalPages, totalItems } = usePagination(sortedData);

  const allUniqueValues = useMemo(() => {
    const result: Record<string, string[]> = {};
    allColumns.forEach(col => {
      const key = col.accessorKey;
      const values = Array.from(new Set(data.assets.map((item: TPIAsset) => String(item[key] || ''))));
      result[key] = values.sort();
    });
    return result;
  }, [data.assets, allColumns]);

  const getUniqueValues = useCallback((key: string) => {
    return allUniqueValues[key] || [];
  }, [allUniqueValues]);

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
  }, [columnFilters, setColumnFilters]);

  const handleSelectAll = useCallback((key: string) => {
    const currentFilters = columnFilters[key];
    const updatedFilters = { ...columnFilters };
    if (currentFilters === undefined) {
      updatedFilters[key] = [];
    } else {
      delete updatedFilters[key];
    }
    setColumnFilters(updatedFilters);
  }, [columnFilters, setColumnFilters]);

  const handleClearColumnFilter = useCallback((key: string) => {
    const updatedFilters = { ...columnFilters };
    delete updatedFilters[key];
    setColumnFilters(updatedFilters);
  }, [columnFilters, setColumnFilters]);

  const exportToExcel = useCallback(() => {
    const exportData = sortedData.map((item: TPIAsset) => {
      const row: Record<string, string> = {};
      columns.visibleColumns.forEach(col => {
        row[col.header] = String(item[col.accessorKey] ?? '');
      });
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'TPI');
    XLSX.writeFile(wb, `TPI_Export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast({ title: "Export Complete", description: `Exported ${exportData.length} records.`, variant: "success" });
  }, [sortedData, columns.visibleColumns, toast]);

  return {
    data,
    history,
    columns,
    dialogs,
    search: {
      searchQuery,
      setSearchQuery,
      searchColumn,
      setSearchColumn,
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
    },
    pagination: {
      currentPage,
      pageSize,
      totalPages,
      totalItems,
      setCurrentPage,
      setPageSize,
      paginatedData: paginatedData as TPIAsset[],
    },
    view: {
      view: view as 'table' | 'card',
      setView,
    },
    exportToExcel,
    allColumns,
    cardFields: CARD_FIELDS,
  };
}
