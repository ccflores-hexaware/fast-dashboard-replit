import { useState, useEffect, useCallback } from 'react';
import type { TPIAsset } from '../types/asset.types';
import type { UseTPIDataReturn } from '../types/state.types';
import { useToast } from '@/hooks/use-toast';

export function useTPIData(): UseTPIDataReturn {
  const { toast } = useToast();
  const [assets, setAssets] = useState<TPIAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/tpi');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setAssets(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch TPI data');
      console.error('Error fetching TPI data:', error);
      setError(error);
      toast({ title: "Error", description: "Failed to load TPI data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    assets,
    isLoading,
    error,
    refetch: fetchData,
  };
}
