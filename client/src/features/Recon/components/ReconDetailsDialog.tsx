import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ReconAsset } from '../types/asset.types';
import type { ColumnDefinition } from '../types/column.types';
import { formatFieldValue } from '../utils/formatters';

interface ReconDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: ReconAsset | null;
  columns: ColumnDefinition[];
}

export function ReconDetailsDialog({
  isOpen,
  onClose,
  selectedItem,
  columns,
}: ReconDetailsDialogProps) {
  if (!selectedItem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-xl">
              {selectedItem.applicationname || selectedItem.id}
            </DialogTitle>
            {selectedItem.status && (
              <Badge variant="secondary">{selectedItem.status}</Badge>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {columns.map((column) => {
                const value = selectedItem[column.accessorKey];
                return (
                  <div key={String(column.accessorKey)} className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">
                      {column.header}
                    </label>
                    <p className="text-sm font-medium">
                      {formatFieldValue(value)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
