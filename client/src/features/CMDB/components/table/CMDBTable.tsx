import React from 'react';
import { Loader2 } from 'lucide-react';
import type { CMDBAsset, CMDBHistoryRecord, CMDBHistoryCache } from '../../types/asset.types';
import type { ColumnDefinition, SortConfig } from '../../types/column.types';
import { CMDBTableHeader } from './CMDBTableHeader';
import { CMDBTableRow } from './CMDBTableRow';
import { CMDBHistoryRows } from './CMDBHistoryRows';

interface CMDBTableProps {
  data: CMDBAsset[];
  visibleColumns: ColumnDefinition[];
  sortConfig: SortConfig | null;
  onSort: (key: string) => void;
  columnFilters: Record<string, string[]>;
  getUniqueValues: (key: string) => string[];
  onFilterChange: (key: string, value: string, uniqueValues: string[]) => void;
  onSelectAll: (key: string) => void;
  onClearFilter: (key: string) => void;
  expandedRows: Set<string>;
  onToggleRowExpansion: (assetId: string) => void;
  historyCache: CMDBHistoryCache;
  historyLoading: Record<string, boolean>;
  historyPage: Record<string, number>;
  onHistoryPageChange: (assetId: string, page: number) => void;
  onItemClick: (item: CMDBAsset) => void;
  onHistoryItemClick: (item: CMDBHistoryRecord) => void;
  isLoading?: boolean;
}

export function CMDBTable({
  data,
  visibleColumns,
  sortConfig,
  onSort,
  columnFilters,
  getUniqueValues,
  onFilterChange,
  onSelectAll,
  onClearFilter,
  expandedRows,
  onToggleRowExpansion,
  historyCache,
  historyLoading,
  historyPage,
  onHistoryPageChange,
  onItemClick,
  onHistoryItemClick,
  isLoading = false,
}: CMDBTableProps) {
  return (
    <div className="rounded-md border border-border bg-card shadow-sm overflow-x-auto overflow-y-hidden">
      <table className="w-full caption-bottom text-sm">
        <CMDBTableHeader
          columns={visibleColumns}
          sortConfig={sortConfig}
          onSort={onSort}
          columnFilters={columnFilters}
          getUniqueValues={getUniqueValues}
          onFilterChange={onFilterChange}
          onSelectAll={onSelectAll}
          onClearFilter={onClearFilter}
        />
        <tbody className="[&_tr:last-child]:border-0">
          {isLoading ? (
            <tr>
              <td colSpan={visibleColumns.length} className="py-16">
                <div className="flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading assets...</p>
                  </div>
                </div>
              </td>
            </tr>
          ) : (
            data.map((item, index) => {
              const isExpanded = expandedRows.has(item.id);
              return (
                <React.Fragment key={`${item.id}-${index}`}>
                  <CMDBTableRow
                    item={item}
                    columns={visibleColumns}
                    isExpanded={isExpanded}
                    onToggleExpand={onToggleRowExpansion}
                    onItemClick={onItemClick}
                  />
                  {isExpanded && (
                    <CMDBHistoryRows
                      assetId={item.id}
                      columns={visibleColumns}
                      historyData={historyCache[item.id]}
                      isLoading={historyLoading[item.id] || false}
                      currentPage={historyPage[item.id] || 1}
                      onPageChange={onHistoryPageChange}
                      onHistoryItemClick={onHistoryItemClick}
                    />
                  )}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
