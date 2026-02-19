import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import type { FASTAsset } from '../types/asset.types';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/lib/userContext';

export interface UseFASTDialogsReturn {
  selectedItem: FASTAsset | null;
  isDialogOpen: boolean;
  isEditing: boolean;
  editFormData: Partial<FASTAsset>;
  originalItem: FASTAsset | null;
  isSaving: boolean;
  assetIdError: string | null;
  assetIdAvailable: boolean;
  dateFieldErrors: Record<string, string | null>;
  isDuplicateConfirmOpen: boolean;
  isCreatingSubAsset: boolean;
  setEditFormData: React.Dispatch<React.SetStateAction<Partial<FASTAsset>>>;
  setDateFieldErrors: React.Dispatch<React.SetStateAction<Record<string, string | null>>>;
  setIsDuplicateConfirmOpen: (open: boolean) => void;
  openDetailsDialog: (item: FASTAsset) => void;
  openEditDialog: (item?: FASTAsset) => void;
  closeDialog: () => void;
  handleSave: (data: FASTAsset[], setData: React.Dispatch<React.SetStateAction<FASTAsset[]>>) => Promise<void>;
  handleDuplicate: (data: FASTAsset[], setData: React.Dispatch<React.SetStateAction<FASTAsset[]>>, refetchSubAssetCounts: () => Promise<void>) => Promise<void>;
  validateAssetId: (id: string, data: FASTAsset[]) => boolean;
}

export function useFASTDialogs(): UseFASTDialogsReturn {
  const { toast } = useToast();
  const { user } = useUser();
  
  const [selectedItem, setSelectedItem] = useState<FASTAsset | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<FASTAsset>>({});
  const [originalItem, setOriginalItem] = useState<FASTAsset | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [assetIdError, setAssetIdError] = useState<string | null>(null);
  const [assetIdAvailable, setAssetIdAvailable] = useState(false);
  const [dateFieldErrors, setDateFieldErrors] = useState<Record<string, string | null>>({});
  const [isDuplicateConfirmOpen, setIsDuplicateConfirmOpen] = useState(false);
  const [isCreatingSubAsset, setIsCreatingSubAsset] = useState(false);

  const openDetailsDialog = useCallback((item: FASTAsset) => {
    setSelectedItem(item);
    setIsEditing(false);
    setIsDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((item?: FASTAsset) => {
    const itemToEdit = item || selectedItem;
    if (itemToEdit) {
      const editCopy = JSON.parse(JSON.stringify(itemToEdit));
      const originalCopy = JSON.parse(JSON.stringify(itemToEdit));
      setEditFormData(editCopy);
      setOriginalItem(originalCopy);
      setSelectedItem(itemToEdit);
      setIsEditing(true);
      setAssetIdError(null);
      setAssetIdAvailable(false);
      setIsDialogOpen(true);
    }
  }, [selectedItem]);

  const closeDialog = useCallback(() => {
    setIsEditing(false);
    setIsDialogOpen(false);
    setEditFormData({});
    setOriginalItem(null);
    setAssetIdError(null);
    setAssetIdAvailable(false);
    setDateFieldErrors({});
  }, []);

  const validateAssetId = useCallback((id: string, data: FASTAsset[]): boolean => {
    if (!id || id.trim() === '') {
      setAssetIdError('Asset ID is required');
      setAssetIdAvailable(false);
      return false;
    }
    if (selectedItem) {
      if (id !== selectedItem.id) {
        setAssetIdError('Asset ID cannot be changed');
        setAssetIdAvailable(false);
        return false;
      }
      setAssetIdError(null);
      setAssetIdAvailable(true);
      return true;
    }
    const isDuplicate = data.some((item: FASTAsset) => item.id === id);
    if (isDuplicate) {
      setAssetIdError('This Asset ID already exists');
      setAssetIdAvailable(false);
      return false;
    }
    setAssetIdError(null);
    setAssetIdAvailable(true);
    return true;
  }, [selectedItem]);

  const handleSave = useCallback(async (data: FASTAsset[], setData: React.Dispatch<React.SetStateAction<FASTAsset[]>>) => {
    if (!validateAssetId(editFormData.id || '', data)) return;
    const hasDateErrors = Object.values(dateFieldErrors).some(error => error !== null);
    if (hasDateErrors) {
      toast({
        title: "Invalid Date Format",
        description: "Please correct the date format errors before saving.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    const updatedItem = {
      ...editFormData,
      lastModifiedBy: user?.name || 'Unknown User',
      lastModifiedDate: format(new Date(), 'MMM d, yyyy HH:mm'),
    };
    
    delete (updatedItem as any).internalId;
    delete (updatedItem as any).createdAt;
    delete (updatedItem as any).version;
    delete (updatedItem as any).isLatestVersion;
    delete (updatedItem as any).isSubAsset;

    try {
      if (selectedItem) {
        const response = await fetch(`/api/fast/${selectedItem.internalId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedItem)
        });
        
        if (!response.ok) throw new Error('Failed to save');
        const savedItem = await response.json();
        
        const updatedItemWithFlags = { ...savedItem, isSubAsset: selectedItem?.isSubAsset };
        setData(data.map(item => item.internalId === savedItem.internalId ? updatedItemWithFlags : item));
        toast({ title: "Saved", description: `Asset ${savedItem.id} has been updated.`, variant: "success" });
        
        setSelectedItem(updatedItemWithFlags);
        setIsEditing(false);
        setEditFormData({});
        setOriginalItem(null);
        setAssetIdError(null);
        setAssetIdAvailable(false);
        setDateFieldErrors({});
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({ title: "Error", description: "Failed to save changes. Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [editFormData, originalItem, selectedItem, dateFieldErrors, user, toast, validateAssetId]);

  const handleDuplicate = useCallback(async (
    data: FASTAsset[], 
    setData: React.Dispatch<React.SetStateAction<FASTAsset[]>>,
    refetchSubAssetCounts: () => Promise<void>
  ) => {
    if (!selectedItem) return;
    
    setIsCreatingSubAsset(true);
    try {
      const response = await fetch('/api/sub-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentAssetId: selectedItem.id,
          createdBy: user?.name || 'Unknown User',
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create sub-asset');
      }
      
      const newSubAsset = await response.json();
      toast({ 
        title: "Sub-asset Created", 
        description: `Created sub-asset ${newSubAsset.assetId}. Go to Sub-assets page to fill in the details.`,
        variant: "success" 
      });
      setIsDuplicateConfirmOpen(false);
      await refetchSubAssetCounts();
    } catch (error: any) {
      console.error('Duplicate error:', error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create sub-asset. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsCreatingSubAsset(false);
    }
  }, [selectedItem, user, toast]);

  return {
    selectedItem,
    isDialogOpen,
    isEditing,
    editFormData,
    originalItem,
    isSaving,
    assetIdError,
    assetIdAvailable,
    dateFieldErrors,
    isDuplicateConfirmOpen,
    isCreatingSubAsset,
    setEditFormData,
    setDateFieldErrors,
    setIsDuplicateConfirmOpen,
    openDetailsDialog,
    openEditDialog,
    closeDialog,
    handleSave,
    handleDuplicate,
    validateAssetId,
  };
}
