import React from 'react';
import { VirtualizedFilterList } from '@/components/ui/virtualized-filter-list';

interface ColumnFilterPopoverProps {
  columnKey: string;
  columnHeader: string;
  isFiltered: boolean;
  uniqueValues: string[];
  currentFilterValues: string[] | undefined;
  onFilterChange: (key: string, value: string, uniqueValues: string[]) => void;
  onSelectAll: (key: string) => void;
  onClearFilter: (key: string) => void;
}

export const ColumnFilterPopover = React.memo(function ColumnFilterPopover({
  columnKey,
  columnHeader,
  isFiltered,
  uniqueValues,
  currentFilterValues,
  onFilterChange,
  onSelectAll,
  onClearFilter,
}: ColumnFilterPopoverProps) {
  return (
    <VirtualizedFilterList
      columnKey={columnKey}
      columnHeader={columnHeader}
      isFiltered={isFiltered}
      uniqueValues={uniqueValues}
      currentFilterValues={currentFilterValues}
      onFilterChange={onFilterChange}
      onSelectAll={onSelectAll}
      onClearFilter={onClearFilter}
    />
  );
});
