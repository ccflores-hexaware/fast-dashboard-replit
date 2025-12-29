import { useState, useCallback } from 'react';
import type { TPIAsset, TPIHistoryRecord } from '../types/asset.types';
import type { UseTPIDialogsReturn } from '../types/state.types';

export function useTPIDialogs(): UseTPIDialogsReturn {
  const [selectedItem, setSelectedItem] = useState<TPIAsset | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTab, setDialogTab] = useState<'details' | 'history'>('details');

  const [selectedHistoryItem, setSelectedHistoryItem] = useState<TPIHistoryRecord | null>(null);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

  const openDetailsDialog = useCallback((item: TPIAsset) => {
    setSelectedItem(item);
    setDialogTab('details');
    setIsDialogOpen(true);
  }, []);

  const closeDetailsDialog = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  const openHistorySnapshotDialog = useCallback((record: TPIHistoryRecord) => {
    setSelectedHistoryItem(record);
    setIsHistoryDialogOpen(true);
  }, []);

  const closeHistorySnapshotDialog = useCallback(() => {
    setIsHistoryDialogOpen(false);
  }, []);

  return {
    selectedItem,
    isDialogOpen,
    dialogTab,
    openDetailsDialog,
    closeDetailsDialog,
    setDialogTab,
    selectedHistoryItem,
    isHistoryDialogOpen,
    openHistorySnapshotDialog,
    closeHistorySnapshotDialog,
  };
}
