import { useState, useMemo } from 'react';

interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc';
}

interface UseSortingReturn<T> {
  sortConfig: SortConfig;
  handleSort: (key: string) => void;
  sortedData: T[];
  resetSort: () => void;
}

export function useSorting<T>(data: T[]): UseSortingReturn<T> {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
    key: null, 
    direction: 'asc' 
  });

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const resetSort = () => {
    setSortConfig({ key: null, direction: 'asc' });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a: any, b: any) => {
      const aVal = a[sortConfig.key!];
      const bVal = b[sortConfig.key!];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig]);

  return {
    sortConfig,
    handleSort,
    sortedData,
    resetSort,
  };
}
