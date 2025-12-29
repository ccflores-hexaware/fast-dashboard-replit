import { useState, useEffect, useMemo } from 'react';
import type { CMDBAsset } from '../types/asset.types';
import type { ColumnDefinition } from '../types/column.types';
import { useToast } from '@/hooks/use-toast';

export interface UseCMDBDataReturn {
  data: CMDBAsset[];
  isLoading: boolean;
  searchFilteredData: CMDBAsset[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchColumn: string;
  setSearchColumn: (column: string) => void;
  openCombobox: boolean;
  setOpenCombobox: (open: boolean) => void;
}

export function useCMDBData(columns: ColumnDefinition[]): UseCMDBDataReturn {
  const { toast } = useToast();
  const [data, setData] = useState<CMDBAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState('all');
  const [openCombobox, setOpenCombobox] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/cmdb');
        if (!response.ok) throw new Error('Failed to fetch');
        const assets = await response.json();
        setData(assets);
      } catch (error) {
        console.error('Error fetching CMDB data:', error);
        toast({ title: "Error", description: "Failed to load CMDB data", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const searchFilteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((item) => {
      if (searchColumn === 'all') {
        return columns.some(col => {
          const v = item[col.accessorKey as keyof CMDBAsset];
          return v && String(v).toLowerCase().includes(query);
        });
      }
      const v = item[searchColumn as keyof CMDBAsset];
      return v && String(v).toLowerCase().includes(query);
    });
  }, [data, searchQuery, searchColumn, columns]);

  return {
    data,
    isLoading,
    searchFilteredData,
    searchQuery,
    setSearchQuery,
    searchColumn,
    setSearchColumn,
    openCombobox,
    setOpenCombobox,
  };
}
