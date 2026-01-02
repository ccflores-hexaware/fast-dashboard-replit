import { useState, useCallback } from 'react';
import type { ReconAsset } from '../types/asset.types';
import type { UseReconDialogsReturn } from '../types/state.types';

export function useReconDialogs(): UseReconDialogsReturn {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ReconAsset | null>(null);

  const openDetailsDialog = useCallback((item: ReconAsset) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  }, []);

  const closeDetailsDialog = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedItem(null);
  }, []);

  return {
    isDialogOpen,
    selectedItem,
    openDetailsDialog,
    closeDetailsDialog,
  };
}
