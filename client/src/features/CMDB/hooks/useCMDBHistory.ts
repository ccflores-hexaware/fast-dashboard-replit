import { useState, useCallback } from 'react';
import type { CMDBHistoryCache, DialogHistoryData } from '../types/asset.types';
import { useToast } from '@/hooks/use-toast';

export interface UseCMDBHistoryReturn {
  expandedRows: Set<string>;
  historyCache: CMDBHistoryCache;
  historyLoading: Record<string, boolean>;
  historyPage: Record<string, number>;
  toggleRowExpansion: (assetId: string) => void;
  setHistoryPageForAsset: (assetId: string, page: number) => void;
  dialogHistoryData: DialogHistoryData | null;
  dialogHistoryLoading: boolean;
  dialogHistoryPage: number;
  setDialogHistoryPage: (page: number) => void;
  fetchDialogHistory: (assetId: string) => void;
  clearHistoryCache: () => void;
}

export function useCMDBHistory(): UseCMDBHistoryReturn {
  const { toast } = useToast();
  
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [historyCache, setHistoryCache] = useState<CMDBHistoryCache>({});
  const [historyLoading, setHistoryLoading] = useState<Record<string, boolean>>({});
  const [historyPage, setHistoryPage] = useState<Record<string, number>>({});

  const [dialogHistoryData, setDialogHistoryData] = useState<DialogHistoryData | null>(null);
  const [dialogHistoryLoading, setDialogHistoryLoading] = useState(false);
  const [dialogHistoryPage, setDialogHistoryPage] = useState(1);

  const fetchHistory = useCallback(async (assetId: string) => {
    if (historyCache[assetId]) return;
    setHistoryLoading(prev => ({ ...prev, [assetId]: true }));
    try {
      const response = await fetch(`/api/cmdb/history/${assetId}`);
      if (!response.ok) throw new Error('Failed to fetch history');
      const data = await response.json();
      setHistoryCache(prev => ({ ...prev, [assetId]: data }));
      setHistoryPage(prev => ({ ...prev, [assetId]: 1 }));
    } catch (error) {
      console.error('Error fetching CMDB history:', error);
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
        fetchHistory(assetId);
      }
      return next;
    });
  }, [fetchHistory]);

  const setHistoryPageForAsset = useCallback((assetId: string, page: number) => {
    setHistoryPage(prev => ({ ...prev, [assetId]: page }));
  }, []);

  const fetchDialogHistory = useCallback(async (assetId: string) => {
    if (historyCache[assetId]) {
      setDialogHistoryData({ assetId, ...historyCache[assetId] });
      return;
    }
    
    if (dialogHistoryData && dialogHistoryData.assetId === assetId) return;
    
    setDialogHistoryLoading(true);
    try {
      const response = await fetch(`/api/cmdb/history/${assetId}`);
      if (!response.ok) throw new Error('Failed to fetch history');
      const data = await response.json();
      setDialogHistoryData({ assetId, ...data });
      setHistoryCache(prev => ({ ...prev, [assetId]: data }));
    } catch (error) {
      console.error('Error fetching CMDB history:', error);
      toast({ title: "Error", description: "Failed to load history", variant: "destructive" });
    } finally {
      setDialogHistoryLoading(false);
    }
  }, [dialogHistoryData, historyCache, toast]);

  const clearHistoryCache = useCallback(() => {
    setHistoryCache({});
    setDialogHistoryData(null);
    setExpandedRows(new Set());
    setHistoryPage({});
  }, []);

  return {
    expandedRows,
    historyCache,
    historyLoading,
    historyPage,
    toggleRowExpansion,
    setHistoryPageForAsset,
    dialogHistoryData,
    dialogHistoryLoading,
    dialogHistoryPage,
    setDialogHistoryPage,
    fetchDialogHistory,
    clearHistoryCache,
  };
}
