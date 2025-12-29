import { useState, useCallback } from 'react';
import type { CMDBAsset, CMDBHistoryRecord } from '../types/asset.types';

export interface UseCMDBDialogsReturn {
  selectedItem: CMDBAsset | null;
  isDialogOpen: boolean;
  dialogTab: 'details' | 'history';
  setDialogTab: (tab: 'details' | 'history') => void;
  openDetailsDialog: (item: CMDBAsset) => void;
  closeDetailsDialog: () => void;
  selectedHistoryItem: CMDBHistoryRecord | null;
  isHistoryDialogOpen: boolean;
  openHistorySnapshotDialog: (item: CMDBHistoryRecord) => void;
  closeHistorySnapshotDialog: () => void;
}

export function useCMDBDialogs(): UseCMDBDialogsReturn {
  const [selectedItem, setSelectedItem] = useState<CMDBAsset | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTab, setDialogTab] = useState<'details' | 'history'>('details');
  
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<CMDBHistoryRecord | null>(null);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

  const openDetailsDialog = useCallback((item: CMDBAsset) => {
    setSelectedItem(item);
    setDialogTab('details');
    setIsDialogOpen(true);
  }, []);

  const closeDetailsDialog = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedItem(null);
  }, []);

  const openHistorySnapshotDialog = useCallback((item: CMDBHistoryRecord) => {
    setSelectedHistoryItem(item);
    setIsHistoryDialogOpen(true);
  }, []);

  const closeHistorySnapshotDialog = useCallback(() => {
    setIsHistoryDialogOpen(false);
    setSelectedHistoryItem(null);
  }, []);

  return {
    selectedItem,
    isDialogOpen,
    dialogTab,
    setDialogTab,
    openDetailsDialog,
    closeDetailsDialog,
    selectedHistoryItem,
    isHistoryDialogOpen,
    openHistorySnapshotDialog,
    closeHistorySnapshotDialog,
  };
}
