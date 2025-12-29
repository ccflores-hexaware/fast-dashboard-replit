import { useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { useCMDBData } from './useCMDBData';
import { useCMDBHistory } from './useCMDBHistory';
import { useCMDBColumnVisibility } from './useCMDBColumnVisibility';
import { useCMDBDialogs } from './useCMDBDialogs';
import { usePagination, useSorting, useColumnFilters, useViewToggle } from '@/hooks';
import { useToast } from '@/hooks/use-toast';
import type { CMDBAsset } from '../types/asset.types';

export function useCMDBPage() {
  const { toast } = useToast();
  const columns = useCMDBColumnVisibility();
  const dataHook = useCMDBData(columns.allColumns);
  const history = useCMDBHistory();
  const dialogs = useCMDBDialogs();
  const { view, setView } = useViewToggle('table');

  const { columnFilters, setColumnFilters, filteredData } = useColumnFilters(dataHook.searchFilteredData);
  const { sortConfig, handleSort, sortedData } = useSorting(filteredData);
  const pagination = usePagination(sortedData);

  const allUniqueValues = useMemo(() => {
    const result: Record<string, string[]> = {};
    columns.allColumns.forEach(col => {
      const values = Array.from(new Set(
        dataHook.data.map((item: CMDBAsset) => String(item[col.accessorKey as keyof CMDBAsset] || ''))
      ));
      result[col.accessorKey] = values.sort();
    });
    return result;
  }, [dataHook.data, columns.allColumns]);

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
    const exportData = sortedData.map((item: CMDBAsset) => {
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
  }, [sortedData, columns.visibleColumns, toast]);

  return {
    data: {
      data: dataHook.data,
      isLoading: dataHook.isLoading,
    },
    search: {
      searchQuery: dataHook.searchQuery,
      setSearchQuery: dataHook.setSearchQuery,
      searchColumn: dataHook.searchColumn,
      setSearchColumn: dataHook.setSearchColumn,
      openCombobox: dataHook.openCombobox,
      setOpenCombobox: dataHook.setOpenCombobox,
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
      currentPage: pagination.currentPage,
      pageSize: pagination.pageSize,
      totalPages: pagination.totalPages,
      totalItems: pagination.totalItems,
      paginatedData: pagination.paginatedData,
      setCurrentPage: pagination.setCurrentPage,
      setPageSize: pagination.setPageSize,
    },
    view: {
      view,
      setView,
    },
    exportToExcel,
    allColumns: columns.allColumns,
  };
}
