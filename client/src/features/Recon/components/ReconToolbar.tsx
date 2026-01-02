import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Columns, Check, LayoutGrid, List } from 'lucide-react';
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
} from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { ColumnDefinition } from '../types/column.types';

interface ReconToolbarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  searchColumn: string;
  onSearchColumnChange: (column: string) => void;
  openCombobox: boolean;
  onOpenComboboxChange: (open: boolean) => void;
  columns: ColumnDefinition[];
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  columnSearchQuery: string;
  onColumnSearchQueryChange: (query: string) => void;
  visibleColumnCount: number;
  onApplyPreset: (preset: 'default' | 'all') => void;
  view: 'table' | 'card';
  onViewChange: (view: 'table' | 'card') => void;
}

export function ReconToolbar({
  searchQuery,
  onSearchQueryChange,
  searchColumn,
  onSearchColumnChange,
  openCombobox,
  onOpenComboboxChange,
  columns,
  columnVisibility,
  onColumnVisibilityChange,
  columnSearchQuery,
  onColumnSearchQueryChange,
  visibleColumnCount,
  onApplyPreset,
  view,
  onViewChange,
}: ReconToolbarProps) {
  const searchOptions = [
    { value: 'all', label: 'All Columns' },
    ...columns.map(col => ({ value: String(col.accessorKey), label: col.header })),
  ];

  const selectedLabel = searchOptions.find(opt => opt.value === searchColumn)?.label || 'All Columns';

  const filteredColumns = columns.filter(col =>
    col.header.toLowerCase().includes(columnSearchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex flex-1 gap-2 items-center w-full sm:w-auto">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Popover open={openCombobox} onOpenChange={onOpenComboboxChange}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" className="min-w-[150px] justify-between">
              {selectedLabel}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search column..." />
              <CommandList>
                <CommandEmpty>No column found.</CommandEmpty>
                <CommandGroup>
                  {searchOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => {
                        onSearchColumnChange(option.value);
                        onOpenComboboxChange(false);
                      }}
                    >
                      {option.label}
                      {searchColumn === option.value && (
                        <Check className="ml-auto h-4 w-4" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex gap-2 items-center">
        {view === 'table' && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns className="h-4 w-4 mr-2" />
                Columns ({visibleColumnCount})
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="end">
              <div className="p-2 border-b">
                <Input
                  placeholder="Search columns..."
                  value={columnSearchQuery}
                  onChange={(e) => onColumnSearchQueryChange(e.target.value)}
                  className="h-8"
                />
              </div>
              <div className="p-2 border-b flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => onApplyPreset('default')}
                >
                  Default
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => onApplyPreset('all')}
                >
                  All
                </Button>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="p-2 space-y-1">
                  {filteredColumns.map((col) => (
                    <label
                      key={String(col.accessorKey)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
                    >
                      <Checkbox
                        checked={columnVisibility[String(col.accessorKey)] ?? false}
                        onCheckedChange={(checked) => {
                          onColumnVisibilityChange(prev => ({
                            ...prev,
                            [String(col.accessorKey)]: !!checked,
                          }));
                        }}
                      />
                      <span className="text-sm">{col.header}</span>
                    </label>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        )}

        <div className="flex border rounded-md">
          <Button
            variant={view === 'table' ? 'default' : 'ghost'}
            size="sm"
            className="rounded-r-none"
            onClick={() => onViewChange('table')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'card' ? 'default' : 'ghost'}
            size="sm"
            className="rounded-l-none"
            onClick={() => onViewChange('card')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
