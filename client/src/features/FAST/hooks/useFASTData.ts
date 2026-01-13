import { useState, useEffect, useCallback } from 'react';
import type { FASTAsset } from '../types/asset.types';
import { useToast } from '@/hooks/use-toast';

export interface UseFASTDataReturn {
  data: FASTAsset[];
  isLoading: boolean;
  error: Error | null;
  subAssetCounts: Record<string, number>;
  fetchData: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<FASTAsset[]>>;
  refetch: () => Promise<void>;
}

export function useFASTData(): UseFASTDataReturn {
  const { toast } = useToast();
  const [data, setData] = useState<FASTAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [subAssetCounts, setSubAssetCounts] = useState<Record<string, number>>({});

  const fetchSubAssetCounts = useCallback(async () => {
    try {
      const response = await fetch('/api/sub-assets/counts');
      if (response.ok) {
        const counts = await response.json();
        setSubAssetCounts(counts);
      }
    } catch (err) {
      console.error('Error fetching sub-asset counts:', err);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/fast');
      if (!response.ok) throw new Error('Failed to fetch');
      const assets = await response.json();
      setData(assets);
      await fetchSubAssetCounts();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch FAST data');
      console.error('Error fetching FAST data:', error);
      setError(error);
      toast({ title: "Error", description: "Failed to load FAST data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchSubAssetCounts]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    isLoading,
    error,
    subAssetCounts,
    fetchData,
    setData,
    refetch,
  };
}
