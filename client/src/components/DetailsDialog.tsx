import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, History, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ColumnDefinition } from '@/types/table.types';
import type { HistoryRecord, DialogHistoryData } from '@/types/history.types';
import { formatHistoryDate, isCurrentRecord, formatDisplayValue } from '@/lib/formatters';

interface DetailsDialogProps<T extends Record<string, unknown>, H extends HistoryRecord> {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: T | null;
  columns: ColumnDefinition[];
  dialogTab: 'details' | 'history';
  onTabChange: (tab: string) => void;
  dialogHistoryData: DialogHistoryData<H> | null;
  dialogHistoryLoading: boolean;
  dialogHistoryPage: number;
  onDialogHistoryPageChange: (page: number) => void;
  onHistoryRecordClick: (record: H) => void;
  historyPageSize?: number;
  titleKey: keyof T;
  subtitleKey?: keyof T;
  renderHistoryRecord?: (record: H) => React.ReactNode;
}

export function DetailsDialog<T extends Record<string, unknown>, H extends HistoryRecord>({
  isOpen,
  onClose,
  selectedItem,
  columns,
  dialogTab,
  onTabChange,
  dialogHistoryData,
  dialogHistoryLoading,
  dialogHistoryPage,
  onDialogHistoryPageChange,
  onHistoryRecordClick,
  historyPageSize = 5,
  titleKey,
  subtitleKey,
  renderHistoryRecord,
}: DetailsDialogProps<T, H>) {
  if (!selectedItem) return null;

  const totalHistoryPages = dialogHistoryData ? Math.ceil(dialogHistoryData.total / historyPageSize) : 0;
  const paginatedDialogHistory = dialogHistoryData?.history.slice(
    (dialogHistoryPage - 1) * historyPageSize,
    dialogHistoryPage * historyPageSize
  ) || [];

  const defaultHistoryRecord = (record: H) => (
    <div 
      key={String(record.id)}
      className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={() => onHistoryRecordClick(record)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isCurrentRecord(record.endDate) && (
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              Current
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {formatHistoryDate(record.startDate)} - {formatHistoryDate(record.endDate)}
        </span>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">{String(selectedItem[titleKey] ?? '')}</DialogTitle>
          {subtitleKey && (
            <DialogDescription>{String(selectedItem[subtitleKey] ?? '')}</DialogDescription>
          )}
        </DialogHeader>

        <Tabs value={dialogTab} onValueChange={onTabChange} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="flex-1 mt-4 min-h-0">
            <ScrollArea className="h-[60vh]">
              <div className="grid grid-cols-2 gap-4 p-4">
                {columns.map((col) => (
                  <div key={col.accessorKey} className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{col.header}</p>
                    <p className="text-sm">{formatDisplayValue(selectedItem[col.accessorKey as keyof T])}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="history" className="flex-1 mt-4 min-h-0 flex flex-col">
            {dialogHistoryLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading history...</span>
              </div>
            ) : !dialogHistoryData || dialogHistoryData.history.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <History className="h-6 w-6 text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">No history available</span>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1">
                  <div className="space-y-2 p-2">
                    {paginatedDialogHistory.map((record) => 
                      renderHistoryRecord ? renderHistoryRecord(record) : defaultHistoryRecord(record)
                    )}
                  </div>
                </ScrollArea>

                {totalHistoryPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      Page {dialogHistoryPage} of {totalHistoryPages} ({dialogHistoryData.total} records)
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        disabled={dialogHistoryPage === 1}
                        onClick={() => onDialogHistoryPageChange(dialogHistoryPage - 1)}
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        disabled={dialogHistoryPage >= totalHistoryPages}
                        onClick={() => onDialogHistoryPageChange(dialogHistoryPage + 1)}
                      >
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
