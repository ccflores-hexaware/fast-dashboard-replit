import { useState, useCallback } from 'react';
import type { TPIHistoryRecord, TPIHistoryResponse } from '../types/asset.types';
import type { UseTPIHistoryReturn } from '../types/state.types';
import { useToast } from '@/hooks/use-toast';

export function useTPIHistory(): UseTPIHistoryReturn {
  const { toast } = useToast();
  
  const [historyCache, setHistoryCache] = useState<Record<string, TPIHistoryResponse>>({});
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [historyLoading, setHistoryLoading] = useState<Record<string, boolean>>({});
  const [historyPage, setHistoryPage] = useState<Record<string, number>>({});

  const [dialogHistoryData, setDialogHistoryData] = useState<{ assetId: string; history: TPIHistoryRecord[]; total: number } | null>(null);
  const [dialogHistoryLoading, setDialogHistoryLoading] = useState(false);
  const [dialogHistoryPage, setDialogHistoryPage] = useState(1);

  const fetchHistoryForAsset = useCallback(async (assetId: string) => {
    if (historyCache[assetId]) return;
    
    setHistoryLoading(prev => ({ ...prev, [assetId]: true }));
    try {
      const response = await fetch(`/api/tpi/history/${assetId}`);
      if (!response.ok) throw new Error('Failed to fetch history');
      const data: TPIHistoryResponse = await response.json();
      setHistoryCache(prev => ({ ...prev, [assetId]: data }));
      setHistoryPage(prev => ({ ...prev, [assetId]: 1 }));
    } catch (error) {
      console.error('Error fetching TPI history:', error);
      toast({ title: "Error", description: "Failed to load history", variant: "destructive" });
    } finally {
      setHistoryLoading(prev => ({ ...prev, [assetId]: false }));
    }
  }, [historyCache, toast]);

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

  const getHistoryPage = useCallback((assetId: string, page: number, pageSize: number): TPIHistoryRecord[] => {
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
    if (dialogHistoryData && dialogHistoryData.assetId === assetId) return;
    
    setDialogHistoryLoading(true);
    try {
      const response = await fetch(`/api/tpi/history/${assetId}`);
      if (!response.ok) throw new Error('Failed to fetch history');
      const data: TPIHistoryResponse = await response.json();
      setDialogHistoryData({ assetId, ...data });
      setDialogHistoryPage(1);
    } catch (error) {
      console.error('Error fetching TPI history:', error);
      toast({ title: "Error", description: "Failed to load history", variant: "destructive" });
    } finally {
      setDialogHistoryLoading(false);
    }
  }, [dialogHistoryData, toast]);

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
