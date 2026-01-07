import React, { useRef, useMemo, useState, useCallback, useLayoutEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Check, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface VirtualizedFilterListProps {
  columnKey: string;
  columnHeader: string;
  isFiltered: boolean;
  uniqueValues: string[];
  currentFilterValues: string[] | undefined;
  onFilterChange: (key: string, value: string, uniqueValues: string[]) => void;
  onSelectAll: (key: string) => void;
  onClearFilter: (key: string) => void;
}

const ITEM_HEIGHT = 32;
const LIST_HEIGHT = 200;

function VirtualizedList({
  filteredValues,
  currentFilterValues,
  onItemClick,
}: {
  filteredValues: string[];
  currentFilterValues: string[] | undefined;
  onItemClick: (val: string) => void;
}) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: filteredValues.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5,
  });

  useLayoutEffect(() => {
    virtualizer.measure();
  }, [virtualizer]);

  const containerHeight = Math.min(LIST_HEIGHT, filteredValues.length * ITEM_HEIGHT);

  if (filteredValues.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground text-center">
        No results found.
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="overflow-auto"
      style={{ height: containerHeight, maxHeight: LIST_HEIGHT }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const val = filteredValues[virtualItem.index];
          const isSelected = !currentFilterValues || currentFilterValues.includes(val);
          
          return (
            <button
              key={virtualItem.key}
              onClick={() => onItemClick(val)}
              className="absolute left-0 w-full flex items-center gap-2 px-2 text-sm hover:bg-accent cursor-pointer"
              style={{
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <div className={cn("flex h-4 w-4 items-center justify-center rounded-sm border border-primary flex-shrink-0", isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                <Check className="h-3 w-3" />
              </div>
              <span className="truncate">{val || "(Empty)"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const VirtualizedFilterList = React.memo(function VirtualizedFilterList({
  columnKey,
  columnHeader,
  isFiltered,
  uniqueValues,
  currentFilterValues,
  onFilterChange,
  onSelectAll,
  onClearFilter,
}: VirtualizedFilterListProps) {
  const [searchValue, setSearchValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const isSelectAll = currentFilterValues === undefined;

  const filteredValues = useMemo(() => {
    if (!searchValue.trim()) return uniqueValues;
    const search = searchValue.toLowerCase();
    return uniqueValues.filter(val => 
      (val || '').toLowerCase().includes(search)
    );
  }, [uniqueValues, searchValue]);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchValue('');
    }
  }, []);

  const handleItemClick = useCallback((val: string) => {
    onFilterChange(columnKey, val, uniqueValues);
  }, [columnKey, uniqueValues, onFilterChange]);

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
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
        <div className="flex flex-col">
          <div className="p-2 border-b">
            <Input
              placeholder={`Filter ${columnHeader}...`}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="h-8"
            />
          </div>
          
          <div className="border-b">
            <button
              onClick={() => onSelectAll(columnKey)}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-sm font-medium hover:bg-accent cursor-pointer"
            >
              <div className={cn("flex h-4 w-4 items-center justify-center rounded-sm border border-primary", isSelectAll ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                <Check className="h-3 w-3" />
              </div>
              <span>(Select All)</span>
            </button>
            <button
              onClick={() => onClearFilter(columnKey)}
              className="w-full px-2 py-1.5 text-sm font-medium text-destructive hover:bg-accent cursor-pointer text-center"
            >
              Clear Filter
            </button>
          </div>

          {isOpen && (
            <VirtualizedList
              key={`${columnKey}-${filteredValues.length}`}
              filteredValues={filteredValues}
              currentFilterValues={currentFilterValues}
              onItemClick={handleItemClick}
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
});
