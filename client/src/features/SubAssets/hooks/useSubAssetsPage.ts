import { useState, useEffect, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import type { SubAsset } from '../types/asset.types';
import { ALL_COLUMN_KEYS, DEFAULT_COLUMNS, DEFAULT_CARD_FIELDS, COLUMN_HEADERS, COLUMN_PRESETS, CARD_FIELDS } from '../constants/columns';
import { useViewToggle, usePagination, useSorting, useColumnFilters } from '@/hooks';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/lib/userContext';
import { DEFAULT_TABLE_PAGE_SIZE, DEFAULT_CARD_PAGE_SIZE } from '@/components/Pagination';
import type { ColumnVisibility, ColumnDefinition, CardFieldDefinition } from '@/types/table.types';

export function useSubAssetsPage() {
  const { user, isAdmin } = useUser();
  const { toast } = useToast();
  const [baseData, setBaseData] = useState<SubAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { view, setView: baseSetView } = useViewToggle('table');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState('all');
  const [openCombobox, setOpenCombobox] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({});
  const [cardFieldVisibility, setCardFieldVisibility] = useState<ColumnVisibility>({});
  const [columnSearchQuery, setColumnSearchQuery] = useState('');
  
  const [selectedItem, setSelectedItem] = useState<SubAsset | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<SubAsset>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const storageKey = 'sub-assets-column-visibility';
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setColumnVisibility(JSON.parse(saved));
      } catch {
        const initial: ColumnVisibility = {};
        ALL_COLUMN_KEYS.forEach(key => { initial[key] = DEFAULT_COLUMNS.includes(key); });
        setColumnVisibility(initial);
      }
    } else {
      const initial: ColumnVisibility = {};
      ALL_COLUMN_KEYS.forEach(key => { initial[key] = DEFAULT_COLUMNS.includes(key); });
      setColumnVisibility(initial);
    }
  }, []);

  useEffect(() => {
    const storageKey = 'sub-assets-card-field-visibility';
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setCardFieldVisibility(JSON.parse(saved));
      } catch {
        const initial: ColumnVisibility = {};
        ALL_COLUMN_KEYS.forEach(key => { initial[key] = DEFAULT_CARD_FIELDS.includes(key); });
        setCardFieldVisibility(initial);
      }
    } else {
      const initial: ColumnVisibility = {};
      ALL_COLUMN_KEYS.forEach(key => { initial[key] = DEFAULT_CARD_FIELDS.includes(key); });
      setCardFieldVisibility(initial);
    }
  }, []);

  useEffect(() => {
    if (Object.keys(columnVisibility).length > 0) {
      localStorage.setItem('sub-assets-column-visibility', JSON.stringify(columnVisibility));
    }
  }, [columnVisibility]);

  useEffect(() => {
    if (Object.keys(cardFieldVisibility).length > 0) {
      localStorage.setItem('sub-assets-card-field-visibility', JSON.stringify(cardFieldVisibility));
    }
  }, [cardFieldVisibility]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/sub-assets');
      if (!response.ok) throw new Error('Failed to fetch');
      const result = await response.json();
      setBaseData(result);
    } catch (error) {
      console.error('Error fetching sub-assets:', error);
      toast({ title: "Error", description: "Failed to load sub-assets.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, []);

  const allColumns: ColumnDefinition[] = useMemo(() => 
    ALL_COLUMN_KEYS.map(key => ({
      header: COLUMN_HEADERS[key],
      accessorKey: key,
    })), 
  []);

  const searchFilteredData = useMemo(() => {
    if (!searchQuery.trim()) return baseData;
    const query = searchQuery.toLowerCase();
    return baseData.filter((item: SubAsset) => {
      if (searchColumn === 'all') {
        return allColumns.some(col => {
          const value = item[col.accessorKey];
          return value && String(value).toLowerCase().includes(query);
        });
      }
      const value = item[searchColumn];
      return value && String(value).toLowerCase().includes(query);
    });
  }, [baseData, searchQuery, searchColumn, allColumns]);

  const { columnFilters, setColumnFilters, filteredData } = useColumnFilters(searchFilteredData);
  const { sortConfig, handleSort, sortedData } = useSorting(filteredData);
  const { currentPage, pageSize, setCurrentPage, setPageSize, paginatedData, totalPages, totalItems } = usePagination(sortedData);

  const handleViewChange = useCallback((newView: 'table' | 'card') => {
    baseSetView(newView);
    setPageSize(newView === 'card' ? DEFAULT_CARD_PAGE_SIZE : DEFAULT_TABLE_PAGE_SIZE);
    setCurrentPage(1);
  }, [baseSetView, setPageSize, setCurrentPage]);

  const visibleColumns = useMemo(() => {
    if (Object.keys(columnVisibility).length === 0) {
      return allColumns.filter(col => DEFAULT_COLUMNS.includes(col.accessorKey as any));
    }
    return allColumns.filter(col => columnVisibility[col.accessorKey] !== false);
  }, [allColumns, columnVisibility]);

  const visibleCardFields: CardFieldDefinition[] = useMemo(() => {
    if (Object.keys(cardFieldVisibility).length === 0) {
      return CARD_FIELDS.filter(field => DEFAULT_CARD_FIELDS.includes(field.key as any));
    }
    return CARD_FIELDS.filter(field => cardFieldVisibility[field.key] !== false);
  }, [cardFieldVisibility]);

  const visibleColumnCount = useMemo(() => {
    if (Object.keys(columnVisibility).length === 0) {
      return DEFAULT_COLUMNS.length;
    }
    return Object.values(columnVisibility).filter(Boolean).length;
  }, [columnVisibility]);

  const applyPreset = useCallback((preset: any) => {
    let cols: readonly string[];
    if (preset.columns === 'all') cols = ALL_COLUMN_KEYS;
    else if (preset.columns === 'default') cols = DEFAULT_COLUMNS;
    else cols = preset.columns;
    
    const v: ColumnVisibility = {};
    ALL_COLUMN_KEYS.forEach(k => { v[k] = cols.includes(k); });
    setColumnVisibility(v);
  }, []);

  const handleItemClick = useCallback((item: SubAsset) => {
    setSelectedItem(item);
    setEditFormData(item);
    setIsEditing(false);
    setIsDialogOpen(true);
  }, []);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    if (selectedItem) {
      setEditFormData(selectedItem);
    }
  }, [selectedItem]);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    setIsEditing(false);
  }, []);

  const handleSave = useCallback(async () => {
    if (!editFormData || !selectedItem) return;
    setIsSaving(true);
    
    try {
      const updatedItem = {
        ...editFormData,
        lastModifiedBy: user?.name || 'Unknown User',
        lastModifiedDate: format(new Date(), 'MMM d, yyyy HH:mm'),
      };
      
      const response = await fetch(`/api/sub-assets/${selectedItem.internalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
      });
      
      if (!response.ok) throw new Error('Failed to update');
      const savedItem = await response.json();
      
      setBaseData(prev => prev.map(item => item.internalId === savedItem.internalId ? savedItem : item));
      setSelectedItem(savedItem);
      setEditFormData(savedItem);
      setIsEditing(false);
      toast({
        title: "Sub-asset Updated",
        description: `Changes to ${savedItem.parentAssetId} have been saved.`,
        variant: "success"
      });
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [editFormData, selectedItem, user, toast]);

  const exportToExcel = useCallback(() => {
    try {
      const exportData = sortedData.map((item: SubAsset) => {
        const row: Record<string, any> = {};
        visibleColumns.forEach(col => {
          row[col.header] = item[col.accessorKey] ?? '';
        });
        return row;
      });
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sub-assets');
      XLSX.writeFile(wb, `Sub-assets_Export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      toast({ title: "Export Complete", description: `Exported ${exportData.length} records.`, variant: "success" });
    } catch (error) {
      console.error('Export error:', error);
      toast({ title: "Export Failed", description: "Failed to export data to Excel. Please try again.", variant: "destructive" });
    }
  }, [sortedData, visibleColumns, toast]);

  return {
    data: {
      data: baseData,
      isLoading,
    },
    search: {
      searchQuery,
      setSearchQuery,
      searchColumn,
      setSearchColumn,
      openCombobox,
      setOpenCombobox,
    },
    columns: {
      columnVisibility,
      setColumnVisibility,
      cardFieldVisibility,
      setCardFieldVisibility,
      visibleColumns,
      visibleCardFields,
      visibleColumnCount,
      columnSearchQuery,
      setColumnSearchQuery,
      applyPreset,
      allColumns,
      cardFields: CARD_FIELDS,
    },
    dialogs: {
      selectedItem,
      isDialogOpen,
      isEditing,
      editFormData,
      isSaving,
      setEditFormData,
      openDetailsDialog: handleItemClick,
      handleEdit,
      handleCancelEdit,
      handleSave,
      closeDialog,
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
      paginatedData: paginatedData as SubAsset[],
      setCurrentPage,
      setPageSize,
    },
    view: {
      view,
      setView: handleViewChange,
    },
    exportToExcel,
    isAdmin,
  };
}
