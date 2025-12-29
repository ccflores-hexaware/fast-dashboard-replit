import React, { memo } from 'react';
import { Loader2, History, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CMDBHistoryRecord, CMDBHistoryData } from '../../types/asset.types';
import type { ColumnDefinition } from '../../types/column.types';
import { formatHistoryDate, isCurrentRecord, formatDisplayValue } from '../../utils/formatters';
import { HISTORY_PAGE_SIZE } from '../../constants/columns';

interface CMDBHistoryRowsProps {
  assetId: string;
  columns: ColumnDefinition[];
  historyData: CMDBHistoryData | undefined;
  isLoading: boolean;
  currentPage: number;
  onPageChange: (assetId: string, page: number) => void;
  onHistoryItemClick: (item: CMDBHistoryRecord) => void;
}

export const CMDBHistoryRows = memo(function CMDBHistoryRows({
  assetId,
  columns,
  historyData,
  isLoading,
  currentPage,
  onPageChange,
  onHistoryItemClick,
}: CMDBHistoryRowsProps) {
  if (isLoading) {
    return (
      <tr className="bg-muted/5 border-b border-border">
        <td colSpan={columns.length} className="px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading history...</span>
          </div>
        </td>
      </tr>
    );
  }

  if (!historyData || historyData.history.length === 0) {
    return (
      <tr className="bg-muted/5 border-b border-border">
        <td colSpan={columns.length} className="px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">No history available</span>
          </div>
        </td>
      </tr>
    );
  }

  const totalPages = Math.ceil(historyData.total / HISTORY_PAGE_SIZE);
  const paginatedHistory = historyData.history.slice(
    (currentPage - 1) * HISTORY_PAGE_SIZE, 
    currentPage * HISTORY_PAGE_SIZE
  );

  return (
    <>
      <tr className="bg-muted/10 border-b border-border">
        <td colSpan={columns.length} className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  {columns.filter(c => c.accessorKey !== 'version').map((col, idx) => (
                    <th key={col.accessorKey} className={cn(
                      "px-3 py-2 text-left text-xs font-medium text-muted-foreground",
                      idx === 0 && "pl-12"
                    )}>
                      {col.header}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Start Date</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">End Date</th>
                </tr>
              </thead>
              <tbody>
                {paginatedHistory.map((record, idx) => (
                  <tr 
                    key={record.historyId} 
                    className="hover:bg-muted/20 cursor-pointer border-t border-border/50"
                    onClick={() => onHistoryItemClick(record)}
                  >
                    {columns.filter(c => c.accessorKey !== 'version').map((col, colIdx) => (
                      <td key={col.accessorKey} className={cn("px-3 py-2", colIdx === 0 && "pl-12")}>
                        {colIdx === 0 && isCurrentRecord(record.endDate) && (
                          <Badge variant="outline" className="mr-2 text-xs bg-green-50 text-green-700 border-green-200">
                            Current
                          </Badge>
                        )}
                        {formatDisplayValue(record[col.accessorKey as keyof CMDBHistoryRecord])}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-muted-foreground">{formatHistoryDate(record.startDate)}</td>
                    <td className="px-3 py-2 text-muted-foreground">{formatHistoryDate(record.endDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-2 bg-muted/20 border-t border-border/50">
              <span className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages} ({historyData.total} records)
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  disabled={currentPage === 1}
                  onClick={(e) => { e.stopPropagation(); onPageChange(assetId, currentPage - 1); }}
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  disabled={currentPage >= totalPages}
                  onClick={(e) => { e.stopPropagation(); onPageChange(assetId, currentPage + 1); }}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </td>
      </tr>
    </>
  );
});
