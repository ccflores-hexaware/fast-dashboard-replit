import React from 'react';
import { History, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { TPIHistoryRecord, TPIHistoryResponse } from '../../types/asset.types';
import type { ColumnDefinition } from '../../types/column.types';
import { formatHistoryDate, isCurrentRecord } from '../../utils/formatters';
import { HISTORY_PAGE_SIZE } from '../../constants/columns';

interface TPIHistoryRowsProps {
  assetId: string;
  visibleColumns: ColumnDefinition[];
  historyData: TPIHistoryResponse | undefined;
  isLoading: boolean;
  currentPage: number;
  onPageChange: (assetId: string, page: number) => void;
  onHistoryItemClick: (record: TPIHistoryRecord) => void;
}

export const TPIHistoryRows = React.memo(function TPIHistoryRows({
  assetId,
  visibleColumns,
  historyData,
  isLoading,
  currentPage,
  onPageChange,
  onHistoryItemClick,
}: TPIHistoryRowsProps) {
  const totalPages = historyData ? Math.ceil(historyData.total / HISTORY_PAGE_SIZE) : 0;
  const paginatedHistory = historyData?.history.slice(
    (currentPage - 1) * HISTORY_PAGE_SIZE, 
    currentPage * HISTORY_PAGE_SIZE
  ) || [];

  if (isLoading) {
    return (
      <tr className="bg-muted/5 border-b border-border">
        <td colSpan={visibleColumns.length} className="px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading history...</span>
          </div>
        </td>
      </tr>
    );
  }

  if (paginatedHistory.length === 0) {
    return (
      <tr className="bg-muted/5 border-b border-border">
        <td colSpan={visibleColumns.length} className="px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">No history available</span>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <>
      {paginatedHistory.map((historyItem: TPIHistoryRecord) => (
        <tr 
          key={`history-${historyItem.id}`}
          className="border-b border-border cursor-pointer hover:bg-muted/20 transition-colors bg-muted/5"
          onClick={() => onHistoryItemClick(historyItem)}
        >
          {visibleColumns.map((col, colIndex) => (
            <td 
              key={col.accessorKey} 
              className={cn(
                "text-sm border-r border-border px-4 py-3 whitespace-nowrap text-muted-foreground",
                colIndex === 0 && "sticky left-0 z-20 bg-slate-50",
                colIndex === visibleColumns.length - 1 && "border-r-0"
              )}
            >
              {colIndex === 0 ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground/60">└</span>
                  <History className="h-3 w-3 text-muted-foreground/50" />
                  {isCurrentRecord(historyItem.endDate) && (
                    <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Current</Badge>
                  )}
                  <span className="text-xs text-muted-foreground/70">
                    ({formatHistoryDate(historyItem.startDate)} → {formatHistoryDate(historyItem.endDate)})
                  </span>
                </div>
              ) : (
                <span>{(historyItem as any)[col.accessorKey] ?? '—'}</span>
              )}
            </td>
          ))}
        </tr>
      ))}
      {(totalPages > 1 || historyData) && (
        <tr className="bg-muted/5 border-b border-border">
          <td colSpan={visibleColumns.length} className="px-4 py-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {historyData?.total} history record{historyData?.total !== 1 ? 's' : ''}
                {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-xs" 
                    disabled={currentPage === 1} 
                    onClick={(e) => { e.stopPropagation(); onPageChange(assetId, currentPage - 1); }}
                  >
                    Prev
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-xs" 
                    disabled={currentPage === totalPages} 
                    onClick={(e) => { e.stopPropagation(); onPageChange(assetId, currentPage + 1); }}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
});
