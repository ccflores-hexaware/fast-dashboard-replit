import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown, Filter, Check } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import type { ColumnDefinition } from '../../types/column.types';
import type { SortConfig } from '../../types/state.types';

interface ReconTableHeaderProps {
  columns: ColumnDefinition[];
  sortConfig: SortConfig;
  onSort: (key: string) => void;
  columnFilters: Record<string, string[]>;
  getUniqueValues: (key: string) => string[];
  onFilterChange: (key: string, value: string, uniqueValues: string[]) => void;
  onSelectAll: (key: string) => void;
  onClearFilter: (key: string) => void;
}

export function ReconTableHeader({
  columns,
  sortConfig,
  onSort,
  columnFilters,
  getUniqueValues,
  onFilterChange,
  onSelectAll,
  onClearFilter,
}: ReconTableHeaderProps) {
  return (
    <TableHeader className="sticky top-0 bg-background z-10">
      <TableRow>
        {columns.map((column) => {
          const key = String(column.accessorKey);
          const uniqueValues = getUniqueValues(key);
          const currentFilters = columnFilters[key];
          const hasFilter = currentFilters !== undefined && currentFilters.length !== uniqueValues.length;
          const isAllSelected = currentFilters === undefined;

          return (
            <TableHead key={key} className="whitespace-nowrap">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onSort(key)}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <span className="font-semibold">{column.header}</span>
                  {sortConfig.key === key ? (
                    sortConfig.direction === 'asc' ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )
                  ) : (
                    <ArrowUpDown className="h-4 w-4 opacity-50" />
                  )}
                </button>

                {uniqueValues.length > 0 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-6 w-6 p-0",
                          hasFilter && "text-primary"
                        )}
                      >
                        <Filter className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-52 p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search..." />
                        <CommandList>
                          <CommandEmpty>No results found.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              onSelect={() => onSelectAll(key)}
                              className="justify-between"
                            >
                              <span>Select All</span>
                              {isAllSelected && <Check className="h-4 w-4" />}
                            </CommandItem>
                            <CommandSeparator />
                            {uniqueValues.map((value) => {
                              const isSelected = isAllSelected || currentFilters?.includes(value);
                              return (
                                <CommandItem
                                  key={value}
                                  onSelect={() => onFilterChange(key, value, uniqueValues)}
                                  className="justify-between"
                                >
                                  <span className="truncate">{value}</span>
                                  {isSelected && <Check className="h-4 w-4" />}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                      {hasFilter && (
                        <div className="p-2 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={() => onClearFilter(key)}
                          >
                            Clear Filter
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </TableHead>
          );
        })}
      </TableRow>
    </TableHeader>
  );
}
