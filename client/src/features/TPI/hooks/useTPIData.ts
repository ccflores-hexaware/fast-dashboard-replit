import { useState, useEffect, useCallback, useRef } from 'react';
import type { TPIAsset } from '../types/asset.types';
import type { PaginatedResponse, PaginationParams } from '@/types/table.types';
import { useToast } from '@/hooks/use-toast';

export interface UseTPIDataReturn {
  assets: TPIAsset[];
  isLoading: boolean;
  error: Error | null;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  filterOptions: Record<string, string[]>;
  fetchData: (params: PaginationParams) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useTPIData(): UseTPIDataReturn {
  const { toast } = useToast();
  const [assets, setAssets] = useState<TPIAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOptions, setFilterOptions] = useState<Record<string, string[]>>({});
  
  const lastParamsRef = useRef<PaginationParams>({ page: 1, limit: 10 });

  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await fetch('/api/tpi/filter-options');
      if (response.ok) {
        const options = await response.json();
        setFilterOptions(options);
      }
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  }, []);

  const fetchData = useCallback(async (params: PaginationParams) => {
    setIsLoading(true);
    setError(null);
    lastParamsRef.current = params;
    
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('page', String(params.page));
      queryParams.set('limit', String(params.limit));
      
      if (params.search) {
        queryParams.set('search', params.search);
      }
      if (params.searchColumn) {
        queryParams.set('searchColumn', params.searchColumn);
      }
      if (params.sortBy) {
        queryParams.set('sortBy', params.sortBy);
      }
      if (params.sortOrder) {
        queryParams.set('sortOrder', params.sortOrder);
      }
      if (params.filters && Object.keys(params.filters).length > 0) {
        queryParams.set('filters', JSON.stringify(params.filters));
      }

      const response = await fetch(`/api/tpi?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const result: PaginatedResponse<TPIAsset> = await response.json();
      setAssets(result.data);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
      setCurrentPage(result.currentPage);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch TPI data');
      console.error('Error fetching TPI data:', error);
      setError(error);
      toast({ title: "Error", description: "Failed to load TPI data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const refetch = useCallback(async () => {
    await fetchData(lastParamsRef.current);
  }, [fetchData]);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  return {
    assets,
    isLoading,
    error,
    totalCount,
    totalPages,
    currentPage,
    filterOptions,
    fetchData,
    refetch,
  };
}
