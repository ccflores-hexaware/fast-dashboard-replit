import { useState, useMemo } from 'react';

interface UseColumnFiltersReturn<T> {
  columnFilters: Record<string, string[]>;
  setColumnFilters: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  filteredData: T[];
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

export function useColumnFilters<T>(data: T[]): UseColumnFiltersReturn<T> {
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});

  const hasActiveFilters = Object.values(columnFilters).some(arr => arr.length > 0);

  const filteredData = useMemo(() => {
    if (!hasActiveFilters) return data;

    return data.filter((item: any) => {
      return Object.entries(columnFilters).every(([key, values]) => {
        if (!values || values.length === 0) return true;
        const itemValue = String(item[key] ?? '');
        return values.includes(itemValue);
      });
    });
  }, [data, columnFilters, hasActiveFilters]);

  const resetFilters = () => {
    setColumnFilters({});
  };

  return {
    columnFilters,
    setColumnFilters,
    filteredData,
    resetFilters,
    hasActiveFilters,
  };
}
