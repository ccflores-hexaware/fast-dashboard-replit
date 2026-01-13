import React, { useEffect, useState } from 'react';
import { Loader2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { FASTAsset } from '../types/asset.types';

interface FASTSubAssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: FASTAsset | null;
  isCreating: boolean;
  onCreate: () => void;
}

export function FASTSubAssetDialog({
  isOpen,
  onClose,
  selectedItem,
  isCreating,
  onCreate,
}: FASTSubAssetDialogProps) {
  const [nextId, setNextId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && selectedItem?.id) {
      fetch(`/api/fast/next-sub-id/${selectedItem.id}`)
        .then(res => res.json())
        .then(data => setNextId(data.nextId))
        .catch(() => setNextId(`${selectedItem.id}-SUB?`));
    }
  }, [isOpen, selectedItem?.id]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Sub-asset</DialogTitle>
          <DialogDescription>
            This will create a new sub-asset derived from {selectedItem?.id}. The new asset will have an ID like <span className="font-mono font-bold">{nextId || `${selectedItem?.id}-SUB...`}</span>.
            <br /><br />
            After creation, go to the Sub-assets page to fill in the sub-asset specific fields.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={isCreating}>Cancel</Button>
          <Button 
            onClick={onCreate} 
            disabled={isCreating} 
            className="text-white gap-2" 
            style={{ backgroundColor: '#f59e0b' }} 
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d97706'} 
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
          >
            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
            {isCreating ? 'Creating...' : 'Create Sub-asset'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
