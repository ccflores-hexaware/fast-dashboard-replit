import React from 'react';
import { Loader2 } from 'lucide-react';
import type { ReconAsset } from '../../types/asset.types';
import type { ColumnDefinition } from '../../types/column.types';
import type { SortConfig } from '../../types/state.types';
import { ReconTableHeader } from './ReconTableHeader';
import { ReconTableRow } from './ReconTableRow';

interface ReconTableProps {
  data: ReconAsset[];
  visibleColumns: ColumnDefinition[];
  sortConfig: SortConfig;
  onSort: (key: string) => void;
  columnFilters: Record<string, string[]>;
  getUniqueValues: (key: string) => string[];
  onFilterChange: (key: string, value: string, uniqueValues: string[]) => void;
  onSelectAll: (key: string) => void;
  onClearFilter: (key: string) => void;
  onItemClick: (item: ReconAsset) => void;
  isLoading: boolean;
}

export function ReconTable({
  data,
  visibleColumns,
  sortConfig,
  onSort,
  columnFilters,
  getUniqueValues,
  onFilterChange,
  onSelectAll,
  onClearFilter,
  onItemClick,
  isLoading,
}: ReconTableProps) {
  return (
    <div className="rounded-md border border-border bg-card shadow-sm overflow-x-auto overflow-y-hidden">
      <table className="w-full caption-bottom text-sm">
        <ReconTableHeader
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
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={visibleColumns.length} className="py-16">
                <div className="flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <h3 className="text-lg font-semibold">No Records Found</h3>
                    <p className="text-sm">Try adjusting your filters or search criteria</p>
                  </div>
                </div>
              </td>
            </tr>
          ) : (
            data.map((item: ReconAsset, index: number) => (
              <ReconTableRow
                key={`${item.internalId}-${index}`}
                item={item}
                visibleColumns={visibleColumns}
                onItemClick={onItemClick}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
