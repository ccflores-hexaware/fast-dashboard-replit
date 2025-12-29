import React from 'react';
import type { TPIAsset, TPIHistoryRecord, TPIHistoryResponse } from '../../types/asset.types';
import type { ColumnDefinition } from '../../types/column.types';
import type { SortConfig } from '../../types/state.types';
import { TPITableHeader } from './TPITableHeader';
import { TPITableRow } from './TPITableRow';
import { TPIHistoryRows } from './TPIHistoryRows';

interface TPITableProps {
  data: TPIAsset[];
  visibleColumns: ColumnDefinition[];
  sortConfig: SortConfig;
  onSort: (key: string) => void;
  columnFilters: Record<string, string[]>;
  getUniqueValues: (key: string) => string[];
  onFilterChange: (key: string, value: string, uniqueValues: string[]) => void;
  onSelectAll: (key: string) => void;
  onClearFilter: (key: string) => void;
  expandedRows: Set<string>;
  onToggleRowExpansion: (assetId: string) => void;
  historyCache: Record<string, TPIHistoryResponse>;
  historyLoading: Record<string, boolean>;
  historyPage: Record<string, number>;
  onHistoryPageChange: (assetId: string, page: number) => void;
  onItemClick: (item: TPIAsset) => void;
  onHistoryItemClick: (record: TPIHistoryRecord) => void;
}

export function TPITable({
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
}: TPITableProps) {
  return (
    <div className="rounded-md border border-border bg-card shadow-sm overflow-x-auto overflow-y-hidden">
      <table className="w-full caption-bottom text-sm">
        <TPITableHeader
          visibleColumns={visibleColumns}
          sortConfig={sortConfig}
          onSort={onSort}
          columnFilters={columnFilters}
          getUniqueValues={getUniqueValues}
          onFilterChange={onFilterChange}
          onSelectAll={onSelectAll}
          onClearFilter={onClearFilter}
        />
        <tbody className="[&_tr:last-child]:border-0">
          {data.map((item: TPIAsset, index: number) => {
            const isExpanded = expandedRows.has(item.id);
            
            return (
              <React.Fragment key={`${item.id}-${index}`}>
                <TPITableRow
                  item={item}
                  visibleColumns={visibleColumns}
                  isExpanded={isExpanded}
                  onToggleExpand={onToggleRowExpansion}
                  onItemClick={onItemClick}
                />
                {isExpanded && (
                  <TPIHistoryRows
                    assetId={item.id}
                    visibleColumns={visibleColumns}
                    historyData={historyCache[item.id]}
                    isLoading={historyLoading[item.id] || false}
                    currentPage={historyPage[item.id] || 1}
                    onPageChange={onHistoryPageChange}
                    onHistoryItemClick={onHistoryItemClick}
                  />
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
