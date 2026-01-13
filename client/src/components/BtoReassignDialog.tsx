import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface BtoMappingInfo {
  id: number;
  higherLevelBto: string;
  bto: string | null;
  division: string | null;
}

interface BtoReassignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mapping: BtoMappingInfo | null;
  onSuccess: () => void;
}

export function BtoReassignDialog({
  isOpen,
  onClose,
  mapping,
  onSuccess,
}: BtoReassignDialogProps) {
  const [higherLevelBtos, setHigherLevelBtos] = useState<string[]>([]);
  const [selectedHigherLevelBto, setSelectedHigherLevelBto] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchHigherLevelBtos();
      if (mapping) {
        setSelectedHigherLevelBto(mapping.higherLevelBto);
      }
      setError(null);
    }
  }, [isOpen, mapping]);

  const fetchHigherLevelBtos = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/bto/higher-level-btos');
      if (!response.ok) throw new Error('Failed to fetch higher level BTOs');
      const data = await response.json();
      setHigherLevelBtos(data);
    } catch (err) {
      console.error('Error fetching higher level BTOs:', err);
      setError('Failed to load Higher Level BTO options');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!mapping || !selectedHigherLevelBto) return;
    
    if (selectedHigherLevelBto === mapping.higherLevelBto) {
      setError('Please select a different Higher Level BTO');
      return;
    }

    setIsSaving(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/bto/mappings/${mapping.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ higherLevelBto: selectedHigherLevelBto }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update mapping');
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating BTO mapping:', err);
      setError(err instanceof Error ? err.message : 'Failed to update mapping');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setSelectedHigherLevelBto('');
      setError(null);
      onClose();
    }
  };

  if (!mapping) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reassign BTO Mapping</DialogTitle>
          <DialogDescription>
            Change the Higher Level BTO for this BTO and Division mapping.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-medium">BTO</Label>
            <div className="col-span-3 p-2 bg-muted rounded-md text-sm">
              {mapping.bto || '(Not specified)'}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-medium">Division</Label>
            <div className="col-span-3 p-2 bg-muted rounded-md text-sm">
              {mapping.division || '(Not specified)'}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-medium">Current</Label>
            <div className="col-span-3 p-2 bg-muted rounded-md text-sm text-muted-foreground">
              {mapping.higherLevelBto}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="newHigherLevelBto" className="text-right font-medium">
              New
            </Label>
            <div className="col-span-3">
              {isLoading ? (
                <div className="flex items-center gap-2 p-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading options...</span>
                </div>
              ) : (
                <Select
                  value={selectedHigherLevelBto}
                  onValueChange={setSelectedHigherLevelBto}
                  disabled={isSaving}
                >
                  <SelectTrigger id="newHigherLevelBto">
                    <SelectValue placeholder="Select Higher Level BTO" />
                  </SelectTrigger>
                  <SelectContent>
                    {higherLevelBtos.map((hlBto) => (
                      <SelectItem key={hlBto} value={hlBto}>
                        {hlBto}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {error && (
            <div className="col-span-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || isLoading || !selectedHigherLevelBto || selectedHigherLevelBto === mapping.higherLevelBto}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
