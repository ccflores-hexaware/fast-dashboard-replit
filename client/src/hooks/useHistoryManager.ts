import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { HistoryRecord, HistoryResponse, HistoryCache, DialogHistoryData } from '@/types/history.types';

export interface UseHistoryManagerOptions {
  errorTitle?: string;
  errorDescription?: string;
}

export interface UseHistoryManagerReturn<T extends HistoryRecord> {
  historyCache: HistoryCache<T>;
  expandedRows: Set<string>;
  historyLoading: Record<string, boolean>;
  historyPage: Record<string, number>;
  toggleRowExpansion: (assetId: string) => void;
  fetchHistoryForAsset: (assetId: string) => Promise<void>;
  getHistoryPage: (assetId: string, page: number, pageSize: number) => T[];
  setHistoryPageForAsset: (assetId: string, page: number) => void;
  isLoadingHistory: (assetId: string) => boolean;
  dialogHistoryData: DialogHistoryData<T> | null;
  dialogHistoryLoading: boolean;
  dialogHistoryPage: number;
  setDialogHistoryPage: (page: number) => void;
  fetchDialogHistory: (assetId: string) => Promise<void>;
}

export function useHistoryManager<T extends HistoryRecord>(
  historyEndpointPattern: string,
  options: UseHistoryManagerOptions = {}
): UseHistoryManagerReturn<T> {
  const { toast } = useToast();
  const {
    errorTitle = 'Error',
    errorDescription = 'Failed to load history',
  } = options;

  const [historyCache, setHistoryCache] = useState<HistoryCache<T>>({});
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [historyLoading, setHistoryLoading] = useState<Record<string, boolean>>({});
  const [historyPage, setHistoryPage] = useState<Record<string, number>>({});

  const [dialogHistoryData, setDialogHistoryData] = useState<DialogHistoryData<T> | null>(null);
  const [dialogHistoryLoading, setDialogHistoryLoading] = useState(false);
  const [dialogHistoryPage, setDialogHistoryPage] = useState(1);

  const getEndpoint = (assetId: string) => historyEndpointPattern.replace(':assetId', assetId);

  const fetchHistoryForAsset = useCallback(async (assetId: string) => {
    if (historyCache[assetId]) return;
    
    setHistoryLoading(prev => ({ ...prev, [assetId]: true }));
    try {
      const response = await fetch(getEndpoint(assetId));
      if (!response.ok) throw new Error('Failed to fetch history');
      const data: HistoryResponse<T> = await response.json();
      setHistoryCache(prev => ({ ...prev, [assetId]: data }));
      setHistoryPage(prev => ({ ...prev, [assetId]: 1 }));
    } catch (error) {
      console.error('Error fetching history:', error);
      toast({ title: errorTitle, description: errorDescription, variant: 'destructive' });
    } finally {
      setHistoryLoading(prev => ({ ...prev, [assetId]: false }));
    }
  }, [historyCache, errorTitle, errorDescription, toast]);

  const toggleRowExpansion = useCallback((assetId: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(assetId)) {
        next.delete(assetId);
      } else {
        next.add(assetId);
        fetchHistoryForAsset(assetId);
      }
      return next;
    });
  }, [fetchHistoryForAsset]);

  const getHistoryPage = useCallback((assetId: string, page: number, pageSize: number): T[] => {
    const assetHistory = historyCache[assetId];
    if (!assetHistory) return [];
    return assetHistory.history.slice((page - 1) * pageSize, page * pageSize);
  }, [historyCache]);

  const setHistoryPageForAsset = useCallback((assetId: string, page: number) => {
    setHistoryPage(prev => ({ ...prev, [assetId]: page }));
  }, []);

  const isLoadingHistory = useCallback((assetId: string): boolean => {
    return historyLoading[assetId] || false;
  }, [historyLoading]);

  const fetchDialogHistory = useCallback(async (assetId: string) => {
    if (historyCache[assetId]) {
      setDialogHistoryData({ assetId, ...historyCache[assetId] });
      setDialogHistoryPage(1);
      return;
    }

    if (dialogHistoryData && dialogHistoryData.assetId === assetId) return;

    setDialogHistoryLoading(true);
    try {
      const response = await fetch(getEndpoint(assetId));
      if (!response.ok) throw new Error('Failed to fetch history');
      const data: HistoryResponse<T> = await response.json();
      setDialogHistoryData({ assetId, ...data });
      setHistoryCache(prev => ({ ...prev, [assetId]: data }));
      setDialogHistoryPage(1);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast({ title: errorTitle, description: errorDescription, variant: 'destructive' });
    } finally {
      setDialogHistoryLoading(false);
    }
  }, [dialogHistoryData, historyCache, errorTitle, errorDescription, toast]);

  return {
    historyCache,
    expandedRows,
    historyLoading,
    historyPage,
    toggleRowExpansion,
    fetchHistoryForAsset,
    getHistoryPage,
    setHistoryPageForAsset,
    isLoadingHistory,
    dialogHistoryData,
    dialogHistoryLoading,
    dialogHistoryPage,
    setDialogHistoryPage,
    fetchDialogHistory,
  };
}
