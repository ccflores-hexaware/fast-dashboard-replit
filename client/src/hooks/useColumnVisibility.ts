import { useState, useEffect, useMemo } from 'react';

interface Column {
  header: string;
  accessorKey: string;
}

interface UseColumnVisibilityOptions {
  storageKey: string;
  allColumnKeys: string[];
  defaultVisibleColumns: string[];
}

interface UseColumnVisibilityReturn {
  columnVisibility: Record<string, boolean>;
  setColumnVisibility: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  visibleColumns: Column[];
  visibleCount: number;
  totalCount: number;
  toggleColumn: (key: string) => void;
  showAllColumns: () => void;
  showDefaultColumns: () => void;
  applyPreset: (columns: string[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function useColumnVisibility(
  columns: Column[],
  options: UseColumnVisibilityOptions
): UseColumnVisibilityReturn {
  const { storageKey, allColumnKeys, defaultVisibleColumns } = options;
  
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        const visibility: Record<string, boolean> = {};
        allColumnKeys.forEach(key => {
          visibility[key] = defaultVisibleColumns.includes(key);
        });
        return visibility;
      }
    }
    const visibility: Record<string, boolean> = {};
    allColumnKeys.forEach(key => {
      visibility[key] = defaultVisibleColumns.includes(key);
    });
    return visibility;
  });

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (Object.keys(columnVisibility).length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(columnVisibility));
    }
  }, [columnVisibility, storageKey]);

  const visibleColumns = useMemo(() => {
    return columns.filter(col => columnVisibility[col.accessorKey] !== false);
  }, [columns, columnVisibility]);

  const visibleCount = Object.values(columnVisibility).filter(Boolean).length;
  const totalCount = allColumnKeys.length;

  const toggleColumn = (key: string) => {
    setColumnVisibility(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const showAllColumns = () => {
    const visibility: Record<string, boolean> = {};
    allColumnKeys.forEach(key => {
      visibility[key] = true;
    });
    setColumnVisibility(visibility);
  };

  const showDefaultColumns = () => {
    const visibility: Record<string, boolean> = {};
    allColumnKeys.forEach(key => {
      visibility[key] = defaultVisibleColumns.includes(key);
    });
    setColumnVisibility(visibility);
  };

  const applyPreset = (cols: string[]) => {
    const visibility: Record<string, boolean> = {};
    allColumnKeys.forEach(key => {
      visibility[key] = cols.includes(key);
    });
    setColumnVisibility(visibility);
  };

  return {
    columnVisibility,
    setColumnVisibility,
    visibleColumns,
    visibleCount,
    totalCount,
    toggleColumn,
    showAllColumns,
    showDefaultColumns,
    applyPreset,
    searchQuery,
    setSearchQuery,
  };
}
