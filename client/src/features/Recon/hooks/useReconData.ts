import { useState, useCallback } from 'react';
import type { ReconAsset } from '../types/asset.types';
import type { UseReconDataReturn } from '../types/state.types';
import { useToast } from '@/hooks/use-toast';
import type { PaginationParams } from '@/types/table.types';

export function useReconData(): UseReconDataReturn {
  const { toast } = useToast();
  const [assets, setAssets] = useState<ReconAsset[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<Record<string, string[]>>({});

  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await fetch('/api/recon/filter-options');
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

    try {
      const url = new URL('/api/recon', window.location.origin);
      url.searchParams.append('page', String(params.page || 1));
      url.searchParams.append('limit', String(params.limit || 10));
      
      if (params.search) {
        url.searchParams.append('search', params.search);
      }
      if (params.searchColumn) {
        url.searchParams.append('searchColumn', params.searchColumn);
      }
      if (params.sortBy) {
        url.searchParams.append('sortBy', params.sortBy);
      }
      if (params.sortOrder) {
        url.searchParams.append('sortOrder', params.sortOrder);
      }
      if (params.filters && Object.keys(params.filters).length > 0) {
        url.searchParams.append('filters', JSON.stringify(params.filters));
      }

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error('Failed to fetch Recon data');
      }

      const result = await response.json();
      setAssets(result.data);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
      setCurrentPage(result.currentPage);
      
      if (Object.keys(filterOptions).length === 0) {
        fetchFilterOptions();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, filterOptions, fetchFilterOptions]);

  return {
    assets,
    totalCount,
    totalPages,
    currentPage,
    isLoading,
    error,
    filterOptions,
    fetchData,
  };
}
