import { useState, useMemo } from 'react';

interface Column {
  header: string;
  accessorKey: string;
}

interface UseSearchReturn<T> {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchColumn: string;
  setSearchColumn: (column: string) => void;
  searchedData: T[];
  resetSearch: () => void;
}

export function useSearch<T>(
  data: T[],
  columns: Column[]
): UseSearchReturn<T> {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState('all');

  const searchedData = useMemo(() => {
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();

    return data.filter((item: any) => {
      if (searchColumn === 'all') {
        return columns.some(col => {
          const value = item[col.accessorKey];
          return value && String(value).toLowerCase().includes(query);
        });
      } else {
        const value = item[searchColumn];
        return value && String(value).toLowerCase().includes(query);
      }
    });
  }, [data, searchQuery, searchColumn, columns]);

  const resetSearch = () => {
    setSearchQuery('');
    setSearchColumn('all');
  };

  return {
    searchQuery,
    setSearchQuery,
    searchColumn,
    setSearchColumn,
    searchedData,
    resetSearch,
  };
}
