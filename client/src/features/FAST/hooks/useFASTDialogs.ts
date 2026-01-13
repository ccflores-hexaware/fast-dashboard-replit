import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import type { FASTAsset, FASTActivity } from '../types/asset.types';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/lib/userContext';

export interface UseFASTDialogsReturn {
  selectedItem: FASTAsset | null;
  isDialogOpen: boolean;
  isEditing: boolean;
  editFormData: Partial<FASTAsset>;
  originalItem: FASTAsset | null;
  isSaving: boolean;
  comment: string;
  assetIdError: string | null;
  assetIdAvailable: boolean;
  dateFieldErrors: Record<string, string | null>;
  activeTab: 'details' | 'activity';
  activities: FASTActivity[];
  isLoadingActivities: boolean;
  activityDisplayLimit: number;
  isDuplicateConfirmOpen: boolean;
  isCreatingSubAsset: boolean;
  setComment: (comment: string) => void;
  setActiveTab: (tab: 'details' | 'activity') => void;
  setActivityDisplayLimit: (limit: number | ((prev: number) => number)) => void;
  setEditFormData: React.Dispatch<React.SetStateAction<Partial<FASTAsset>>>;
  setDateFieldErrors: React.Dispatch<React.SetStateAction<Record<string, string | null>>>;
  setIsDuplicateConfirmOpen: (open: boolean) => void;
  openDetailsDialog: (item: FASTAsset) => void;
  openEditDialog: (item?: FASTAsset) => void;
  closeDialog: () => void;
  handleSave: (data: FASTAsset[], setData: React.Dispatch<React.SetStateAction<FASTAsset[]>>) => Promise<void>;
  handleDuplicate: (data: FASTAsset[], setData: React.Dispatch<React.SetStateAction<FASTAsset[]>>, refetchSubAssetCounts: () => Promise<void>) => Promise<void>;
  validateAssetId: (id: string, data: FASTAsset[]) => boolean;
  fetchActivities: (assetId: string) => Promise<void>;
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
  const [comment, setComment] = useState('');
  const [assetIdError, setAssetIdError] = useState<string | null>(null);
  const [assetIdAvailable, setAssetIdAvailable] = useState(false);
  const [dateFieldErrors, setDateFieldErrors] = useState<Record<string, string | null>>({});
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details');
  const [activities, setActivities] = useState<FASTActivity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [activityDisplayLimit, setActivityDisplayLimit] = useState(5);
  const [isDuplicateConfirmOpen, setIsDuplicateConfirmOpen] = useState(false);
  const [isCreatingSubAsset, setIsCreatingSubAsset] = useState(false);

  const fetchActivities = useCallback(async (assetId: string) => {
    setIsLoadingActivities(true);
    setActivityDisplayLimit(5);
    try {
      const response = await fetch(`/api/activity/${assetId}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoadingActivities(false);
    }
  }, []);

  const openDetailsDialog = useCallback((item: FASTAsset) => {
    setSelectedItem(item);
    setIsEditing(false);
    setActiveTab('details');
    setIsDialogOpen(true);
    fetchActivities(item.id);
  }, [fetchActivities]);

  const openEditDialog = useCallback((item?: FASTAsset) => {
    const itemToEdit = item || selectedItem;
    if (itemToEdit) {
      const editCopy = JSON.parse(JSON.stringify(itemToEdit));
      const originalCopy = JSON.parse(JSON.stringify(itemToEdit));
      setEditFormData(editCopy);
      setOriginalItem(originalCopy);
      setSelectedItem(itemToEdit);
      setIsEditing(true);
      setComment('');
      setAssetIdError(null);
      setAssetIdAvailable(false);
      setIsDialogOpen(true);
      fetchActivities(itemToEdit.id);
    }
  }, [selectedItem, fetchActivities]);

  const closeDialog = useCallback(() => {
    setIsEditing(false);
    setIsDialogOpen(false);
    setEditFormData({});
    setOriginalItem(null);
    setComment('');
    setActiveTab('details');
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

    const fieldChanges: Record<string, { old: any; new: any }> = {};
    if (originalItem) {
      const excludeFields = ['internalId', 'createdAt', 'version', 'isLatestVersion', 'lastModifiedBy', 'lastModifiedDate', 'isSubAsset'];
      Object.keys(editFormData).forEach(key => {
        if (!excludeFields.includes(key)) {
          const oldVal = (originalItem as any)[key];
          const newVal = (editFormData as any)[key];
          const oldStr = String(oldVal ?? '');
          const newStr = String(newVal ?? '');
          if (oldStr !== newStr) {
            fieldChanges[key] = { old: oldVal ?? '', new: newVal ?? '' };
          }
        }
      });
    }

    try {
      if (selectedItem) {
        const response = await fetch(`/api/fast/${selectedItem.internalId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedItem)
        });
        
        if (!response.ok) throw new Error('Failed to save');
        const savedItem = await response.json();
        
        const hasChanges = Object.keys(fieldChanges).length > 0;
        const hasComment = comment.trim().length > 0;
        if (hasChanges || hasComment) {
          const fieldChangesArray = hasChanges 
            ? Object.entries(fieldChanges).map(([key, value]) => ({
                field: key,
                old: value.old,
                new: value.new
              }))
            : null;
          
          await fetch('/api/activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              assetId: savedItem.id,
              text: hasComment ? comment.trim() : null,
              field: fieldChangesArray,
              modifiedBy: user?.name || 'Unknown User',
            })
          });
        }
        
        setData(data.map(item => item.internalId === savedItem.internalId ? savedItem : item));
        toast({ title: "Saved", description: `Asset ${savedItem.id} has been updated.`, variant: "success" });
        
        setSelectedItem(savedItem);
        setIsEditing(false);
        setEditFormData({});
        setOriginalItem(null);
        setComment('');
        setAssetIdError(null);
        setAssetIdAvailable(false);
        setDateFieldErrors({});
        fetchActivities(savedItem.id);
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({ title: "Error", description: "Failed to save changes. Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [editFormData, originalItem, selectedItem, comment, dateFieldErrors, user, toast, fetchActivities, validateAssetId]);

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
    comment,
    assetIdError,
    assetIdAvailable,
    dateFieldErrors,
    activeTab,
    activities,
    isLoadingActivities,
    activityDisplayLimit,
    isDuplicateConfirmOpen,
    isCreatingSubAsset,
    setComment,
    setActiveTab,
    setActivityDisplayLimit,
    setEditFormData,
    setDateFieldErrors,
    setIsDuplicateConfirmOpen,
    openDetailsDialog,
    openEditDialog,
    closeDialog,
    handleSave,
    handleDuplicate,
    validateAssetId,
    fetchActivities,
  };
}
