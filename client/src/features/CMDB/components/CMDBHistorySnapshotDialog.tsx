import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full sm:max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl flex items-center gap-2">
            {selectedHistoryItem?.configItem || 'Historical Snapshot'}
            {selectedHistoryItem && isCurrentRecord(selectedHistoryItem.endDate) && (
              <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Current</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {selectedHistoryItem && (
              <>
                Historical snapshot: {formatHistoryDate(selectedHistoryItem.startDate)} - {formatHistoryDate(selectedHistoryItem.endDate)}
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 py-4">
            {selectedHistoryItem && (
              <>
                <div className="flex flex-col space-y-1 py-3 border-b border-border/50">
                  <span className="text-sm font-medium text-muted-foreground">CI ID</span>
                  <span className="text-base font-semibold text-foreground">{String(selectedHistoryItem.historyId ?? '—')}</span>
                </div>
                {columns.map((col) => (
                  <div key={col.accessorKey} className="flex flex-col space-y-1 py-3 border-b border-border/50">
                    <span className="text-sm font-medium text-muted-foreground">{col.header}</span>
                    <span className="text-base font-semibold text-foreground">{formatDisplayValue(selectedHistoryItem[col.accessorKey as keyof CMDBHistoryRecord])}</span>
                  </div>
                ))}
                <div className="flex flex-col space-y-1 py-3 border-b border-border/50">
                  <span className="text-sm font-medium text-muted-foreground">Start Date</span>
                  <span className="text-base font-semibold text-foreground">{formatHistoryDate(selectedHistoryItem.startDate)}</span>
                </div>
                <div className="flex flex-col space-y-1 py-3 border-b border-border/50">
                  <span className="text-sm font-medium text-muted-foreground">End Date</span>
                  <span className="text-base font-semibold text-foreground">{formatHistoryDate(selectedHistoryItem.endDate)}</span>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex justify-end p-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
