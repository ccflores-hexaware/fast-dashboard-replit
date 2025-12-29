import React from 'react';
import { Filter, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Button } from '@/components/ui/button';

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
  const isSelectAll = currentFilterValues === undefined;

  return (
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
          <CommandInput placeholder={`Filter ${columnHeader}...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              <CommandItem onSelect={() => onSelectAll(columnKey)} className="flex items-center gap-2 cursor-pointer font-medium border-b">
                <div className={cn("flex h-4 w-4 items-center justify-center rounded-sm border border-primary", isSelectAll ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                  <Check className="h-3 w-3" />
                </div>
                <span>(Select All)</span>
              </CommandItem>
              <CommandItem onSelect={() => onClearFilter(columnKey)} className="justify-center text-center font-medium text-destructive cursor-pointer my-1">
                Clear Filter
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup className="max-h-[200px] overflow-auto">
              {uniqueValues.map((val) => {
                const isSelected = !currentFilterValues || currentFilterValues.includes(val);
                return (
                  <CommandItem key={val} onSelect={() => onFilterChange(columnKey, val, uniqueValues)} className="flex items-center gap-2 cursor-pointer">
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
  );
});
