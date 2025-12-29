import React from 'react';
import { Search, Check, ChevronsUpDown, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ViewToggle } from '@/components/ViewToggle';
import type { ColumnDefinition, ColumnVisibility, ColumnPreset } from '@/types/table.types';

interface DataToolbarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  searchColumn: string;
  onSearchColumnChange: (column: string) => void;
  openCombobox: boolean;
  onOpenComboboxChange: (open: boolean) => void;
  columns: ColumnDefinition[];
  columnVisibility: ColumnVisibility;
  onColumnVisibilityChange: React.Dispatch<React.SetStateAction<ColumnVisibility>>;
  columnSearchQuery: string;
  onColumnSearchQueryChange: (query: string) => void;
  visibleColumnCount: number;
  totalColumnCount: number;
  presets: ColumnPreset[];
  onApplyPreset: (preset: ColumnPreset) => void;
  view: 'table' | 'card';
  onViewChange: (view: 'table' | 'card') => void;
  searchPlaceholder?: string;
}

export function DataToolbar({
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
  totalColumnCount,
  presets,
  onApplyPreset,
  view,
  onViewChange,
  searchPlaceholder = 'Search across all fields...',
}: DataToolbarProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
      <div className="flex items-center gap-2 flex-1">
        <Popover open={openCombobox} onOpenChange={onOpenComboboxChange}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" className="w-[140px] justify-between">
              {searchColumn === 'all' ? 'All Columns' : columns.find(c => c.accessorKey === searchColumn)?.header || searchColumn}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search column..." />
              <CommandList>
                <CommandEmpty>No column found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem value="all" onSelect={() => { onSearchColumnChange('all'); onOpenComboboxChange(false); }}>
                    <Check className={cn("mr-2 h-4 w-4", searchColumn === 'all' ? "opacity-100" : "opacity-0")} />
                    All Columns
                  </CommandItem>
                  {columns.map(col => (
                    <CommandItem key={col.accessorKey} value={col.accessorKey} onSelect={() => { onSearchColumnChange(col.accessorKey); onOpenComboboxChange(false); }}>
                      <Check className={cn("mr-2 h-4 w-4", searchColumn === col.accessorKey ? "opacity-100" : "opacity-0")} />
                      {col.header}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={searchPlaceholder}
            value={searchQuery} 
            onChange={(e) => onSearchQueryChange(e.target.value)} 
            className="pl-9" 
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Settings2 className="h-4 w-4" />
              Columns
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                {visibleColumnCount}/{totalColumnCount}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Column Visibility</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Input 
                placeholder="Search columns..." 
                value={columnSearchQuery} 
                onChange={(e) => onColumnSearchQueryChange(e.target.value)} 
                className="h-8" 
              />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">Presets</DropdownMenuLabel>
            <div className="flex flex-wrap gap-1 p-2">
              {presets.map(preset => (
                <Button key={preset.name} variant="outline" size="sm" className="h-6 text-xs" onClick={() => onApplyPreset(preset)}>
                  {preset.name}
                </Button>
              ))}
            </div>
            <DropdownMenuSeparator />
            <ScrollArea className="h-[300px]">
              {columns.filter(col => col.header.toLowerCase().includes(columnSearchQuery.toLowerCase())).map(col => (
                <DropdownMenuCheckboxItem 
                  key={col.accessorKey} 
                  checked={columnVisibility[col.accessorKey] !== false} 
                  onCheckedChange={(checked) => onColumnVisibilityChange(prev => ({ ...prev, [col.accessorKey]: checked }))}
                >
                  {col.header}
                </DropdownMenuCheckboxItem>
              ))}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        <ViewToggle view={view} setView={onViewChange} />
      </div>
    </div>
  );
}
