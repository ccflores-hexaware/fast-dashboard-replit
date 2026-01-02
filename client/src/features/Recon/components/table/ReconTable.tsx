import React from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { LoadingState } from '@/components/LoadingState';
import { ReconTableHeader } from './ReconTableHeader';
import { ReconTableRow } from './ReconTableRow';
import type { ReconAsset } from '../../types/asset.types';
import type { ColumnDefinition } from '../../types/column.types';
import type { SortConfig } from '../../types/state.types';

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
  if (isLoading) {
    return <LoadingState />;
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-muted-foreground">
          <h3 className="text-lg font-semibold">No Records Found</h3>
          <p className="text-sm mt-1">Try adjusting your filters or search criteria</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-auto">
      <Table>
        <ReconTableHeader
          columns={visibleColumns}
          sortConfig={sortConfig}
          onSort={onSort}
          columnFilters={columnFilters}
          getUniqueValues={getUniqueValues}
          onFilterChange={onFilterChange}
          onSelectAll={onSelectAll}
          onClearFilter={onClearFilter}
        />
        <TableBody>
          {data.map((item) => (
            <ReconTableRow
              key={item.id}
              item={item}
              columns={visibleColumns}
              onClick={onItemClick}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
