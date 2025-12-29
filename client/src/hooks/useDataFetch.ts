import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface UseDataFetchOptions {
  errorTitle?: string;
  errorDescription?: string;
}

export interface UseDataFetchReturn<T> {
  data: T[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useDataFetch<T>(
  endpoint: string,
  options: UseDataFetchOptions = {}
): UseDataFetchReturn<T> {
  const { toast } = useToast();
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const {
    errorTitle = 'Error',
    errorDescription = 'Failed to load data',
  } = options;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch');
      const result = await response.json();
      setData(result);
    } catch (err) {
      const fetchError = err instanceof Error ? err : new Error('Failed to fetch data');
      console.error(`Error fetching from ${endpoint}:`, fetchError);
      setError(fetchError);
      toast({ title: errorTitle, description: errorDescription, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, errorTitle, errorDescription, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}
