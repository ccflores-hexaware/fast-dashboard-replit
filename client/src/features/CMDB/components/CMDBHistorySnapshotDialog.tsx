import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { CMDBHistoryRecord } from '../types/asset.types';
import type { ColumnDefinition } from '../types/column.types';
import { formatHistoryDate, isCurrentRecord, formatDisplayValue } from '../utils/formatters';

interface CMDBHistorySnapshotDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHistoryItem: CMDBHistoryRecord | null;
  columns: ColumnDefinition[];
}

export function CMDBHistorySnapshotDialog({
  isOpen,
  onClose,
  selectedHistoryItem,
  columns,
}: CMDBHistorySnapshotDialogProps) {
  if (!selectedHistoryItem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="text-xl">{selectedHistoryItem.configItem}</DialogTitle>
            {isCurrentRecord(selectedHistoryItem.endDate) && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                Current
              </Badge>
            )}
          </div>
          <DialogDescription>
            Historical snapshot: {formatHistoryDate(selectedHistoryItem.startDate)} - {formatHistoryDate(selectedHistoryItem.endDate)}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 h-[60vh]">
          <div className="grid grid-cols-2 gap-4 p-4">
            {columns.map((col) => (
              <div key={col.accessorKey} className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{col.header}</p>
                <p className="text-sm">{formatDisplayValue(selectedHistoryItem[col.accessorKey as keyof CMDBHistoryRecord])}</p>
              </div>
            ))}
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Start Date</p>
              <p className="text-sm">{formatHistoryDate(selectedHistoryItem.startDate)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">End Date</p>
              <p className="text-sm">{formatHistoryDate(selectedHistoryItem.endDate)}</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
