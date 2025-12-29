import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ColumnDefinition } from '../../types/column.types';
import type { SortConfig } from '../../types/state.types';
import { ColumnFilterPopover } from '../ColumnFilterPopover';

interface TPITableHeaderProps {
  visibleColumns: ColumnDefinition[];
  sortConfig: SortConfig;
  onSort: (key: string) => void;
  columnFilters: Record<string, string[]>;
  getUniqueValues: (key: string) => string[];
  onFilterChange: (key: string, value: string, uniqueValues: string[]) => void;
  onSelectAll: (key: string) => void;
  onClearFilter: (key: string) => void;
}

export function TPITableHeader({
  visibleColumns,
  sortConfig,
  onSort,
  columnFilters,
  getUniqueValues,
  onFilterChange,
  onSelectAll,
  onClearFilter,
}: TPITableHeaderProps) {
  return (
    <thead className="bg-muted/50">
      <tr className="border-b border-border">
        {visibleColumns.map((col, index) => {
          const key = col.accessorKey;
          const isFiltered = !!columnFilters[key];
          const uniqueValues = getUniqueValues(key);
          const currentFilterValues = columnFilters[key];
          const isSorted = sortConfig?.key === key;
          const SortIcon = isSorted ? (sortConfig?.direction === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
          
          return (
            <th 
              key={key} 
              className={cn(
                "font-bold text-primary whitespace-nowrap border-r border-border px-4 py-3 h-auto select-none", 
                index === 0 && "sticky left-0 z-30 bg-slate-200", 
                index === visibleColumns.length - 1 && "border-r-0"
              )}
            >
              <div className="flex items-center justify-between gap-1.5">
                <div 
                  className="flex items-center gap-1.5 rounded cursor-pointer hover:bg-black/5 -ml-1 pl-1 pr-1.5 py-0.5 transition-colors"
                  onClick={() => onSort(key)}
                >
                  {col.header}
                  <SortIcon className={cn("h-3.5 w-3.5", isSorted ? "opacity-100" : "opacity-30")} />
                </div>
                
                <ColumnFilterPopover
                  columnKey={key}
                  columnHeader={col.header}
                  isFiltered={isFiltered}
                  uniqueValues={uniqueValues}
                  currentFilterValues={currentFilterValues}
                  onFilterChange={onFilterChange}
                  onSelectAll={onSelectAll}
                  onClearFilter={onClearFilter}
                />
              </div>
            </th>
          );
        })}
      </tr>
    </thead>
  );
}
