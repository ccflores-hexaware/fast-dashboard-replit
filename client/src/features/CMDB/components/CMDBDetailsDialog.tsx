import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, History } from 'lucide-react';
import type { CMDBAsset, CMDBHistoryRecord, DialogHistoryData } from '../types/asset.types';
import type { ColumnDefinition } from '../types/column.types';
import { formatHistoryDate, isCurrentRecord, formatDisplayValue } from '../utils/formatters';
import { HISTORY_PAGE_SIZE } from '../constants/columns';

interface CMDBDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: CMDBAsset | null;
  columns: ColumnDefinition[];
  dialogTab: 'details' | 'history';
  onTabChange: (tab: string) => void;
  dialogHistoryData: DialogHistoryData | null;
  dialogHistoryLoading: boolean;
  dialogHistoryPage: number;
  onDialogHistoryPageChange: (page: number) => void;
  onHistoryRecordClick: (item: CMDBHistoryRecord) => void;
}

export function CMDBDetailsDialog({
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
}: CMDBDetailsDialogProps) {
  if (!selectedItem) return null;

  const totalHistoryPages = dialogHistoryData ? Math.ceil(dialogHistoryData.total / HISTORY_PAGE_SIZE) : 0;
  const paginatedDialogHistory = dialogHistoryData?.history.slice(
    (dialogHistoryPage - 1) * HISTORY_PAGE_SIZE,
    dialogHistoryPage * HISTORY_PAGE_SIZE
  ) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full sm:max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl">{selectedItem.configItem}</DialogTitle>
          <DialogDescription>{selectedItem.id}</DialogDescription>
        </DialogHeader>
        <Tabs value={dialogTab} onValueChange={onTabChange} className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-6 mt-4 w-fit">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="flex-1 overflow-y-auto px-6 min-h-0 m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 py-4">
              {columns.map((col) => (
                <div key={col.accessorKey} className="flex flex-col space-y-1 py-3 border-b border-border/50">
                  <span className="text-sm font-medium text-muted-foreground">{col.header}</span>
                  <span className="text-base font-semibold text-foreground">{formatDisplayValue(selectedItem[col.accessorKey as keyof CMDBAsset])}</span>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="history" className="flex-1 overflow-y-auto px-6 min-h-0 m-0">
            {dialogHistoryLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : dialogHistoryData && dialogHistoryData.history.length > 0 ? (
              <div className="py-4 space-y-2">
                <div className="text-sm text-muted-foreground mb-4">
                  {dialogHistoryData.total} historical record{dialogHistoryData.total !== 1 ? 's' : ''}
                </div>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-2 text-left font-medium">Start Date</th>
                        <th className="px-4 py-2 text-left font-medium">End Date</th>
                        <th className="px-4 py-2 text-left font-medium">Status</th>
                        <th className="px-4 py-2 text-left font-medium">Environment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedDialogHistory.map((record) => (
                        <tr 
                          key={record.historyId}
                          className="border-b hover:bg-muted/30 cursor-pointer"
                          onClick={() => onHistoryRecordClick(record)}
                        >
                          <td className="px-4 py-2">
                            {isCurrentRecord(record.endDate) && (
                              <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 mr-2">Current</Badge>
                            )}
                            {formatHistoryDate(record.startDate)}
                          </td>
                          <td className="px-4 py-2">{formatHistoryDate(record.endDate)}</td>
                          <td className="px-4 py-2">{record.status || '—'}</td>
                          <td className="px-4 py-2">{record.environment || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {dialogHistoryData.total > HISTORY_PAGE_SIZE && (
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">
                      Page {dialogHistoryPage} of {totalHistoryPages}
                    </span>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2 text-xs"
                        disabled={dialogHistoryPage === 1}
                        onClick={() => onDialogHistoryPageChange(dialogHistoryPage - 1)}
                      >
                        Previous
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2 text-xs"
                        disabled={dialogHistoryPage >= totalHistoryPages}
                        onClick={() => onDialogHistoryPageChange(dialogHistoryPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                No history records available
              </div>
            )}
          </TabsContent>
        </Tabs>
        <div className="flex justify-end p-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
