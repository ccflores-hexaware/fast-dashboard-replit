import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Filter, ArrowUpDown, ArrowUp, ArrowDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ColumnDefinition, SortConfig } from '../../types/column.types';

interface CMDBTableHeaderProps {
  columns: ColumnDefinition[];
  sortConfig: SortConfig | null;
  onSort: (key: string) => void;
  columnFilters: Record<string, string[]>;
  getUniqueValues: (key: string) => string[];
  onFilterChange: (key: string, value: string, uniqueValues: string[]) => void;
  onSelectAll: (key: string) => void;
  onClearFilter: (key: string) => void;
}

export const CMDBTableHeader = memo(function CMDBTableHeader({
  columns,
  sortConfig,
  onSort,
  columnFilters,
  getUniqueValues,
  onFilterChange,
  onSelectAll,
  onClearFilter,
}: CMDBTableHeaderProps) {
  return (
    <thead className="bg-muted/50">
      <tr className="border-b border-border">
        {columns.map((col, index) => {
          const key = col.accessorKey;
          const isFiltered = !!columnFilters[key];
          const uniqueValues = getUniqueValues(key);
          const currentFilterValues = columnFilters[key];
          const isSelectAll = currentFilterValues === undefined;
          const isSorted = sortConfig?.key === key;
          const SortIcon = isSorted ? (sortConfig?.direction === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;

          return (
            <th 
              key={key} 
              className={cn(
                "font-bold text-primary whitespace-nowrap border-r border-border px-4 py-3 h-auto select-none",
                index === 0 && "sticky left-0 z-30 bg-slate-200",
                index === columns.length - 1 && "border-r-0"
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
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={cn("h-6 w-6 p-0 hover:bg-muted/80 data-[state=open]:bg-muted/80", isFiltered && "text-primary bg-primary/10")}
                    >
                      <Filter className={cn("h-3.5 w-3.5", isFiltered && "fill-current")} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[220px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder={`Filter ${col.header}...`} />
                      <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem onSelect={() => onSelectAll(key)} className="flex items-center gap-2 cursor-pointer font-medium border-b">
                            <div className={cn("flex h-4 w-4 items-center justify-center rounded-sm border border-primary", isSelectAll ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                              <Check className="h-3 w-3" />
                            </div>
                            <span>(Select All)</span>
                          </CommandItem>
                          <CommandItem onSelect={() => onClearFilter(key)} className="justify-center text-center font-medium text-destructive cursor-pointer my-1">
                            Clear Filter
                          </CommandItem>
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup className="max-h-[200px] overflow-auto">
                          {uniqueValues.map((val) => {
                            const isSelected = !currentFilterValues || currentFilterValues.includes(val);
                            return (
                              <CommandItem key={val} onSelect={() => onFilterChange(key, val, uniqueValues)} className="flex items-center gap-2 cursor-pointer">
                                <div className={cn("flex h-4 w-4 items-center justify-center rounded-sm border border-primary", isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                                  <Check className="h-3 w-3" />
                                </div>
                                <span>{val || "(Empty)"}</span>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </th>
          );
        })}
      </tr>
    </thead>
  );
});
