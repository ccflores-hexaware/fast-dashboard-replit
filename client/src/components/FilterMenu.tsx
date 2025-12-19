import React, { useMemo, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Filter, RotateCcw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface FilterMenuProps<T> {
  columns: { header: string; accessorKey?: string }[];
  allData: T[];
  filters: Record<string, string[]>;
  onFiltersChange: (filters: Record<string, string[]>) => void;
}

interface FilterColumnSubMenuProps {
  col: { header: string; accessorKey?: string };
  options: string[];
  currentValues: string[] | undefined;
  onFilterChange: (value: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
}

function FilterColumnSubMenu({ 
  col, 
  options, 
  currentValues, 
  onFilterChange, 
  onSelectAll, 
  onClear 
}: FilterColumnSubMenuProps) {
    const [searchQuery, setSearchQuery] = useState("");
    
    // Filter options based on search
    const filteredOptions = options.filter(option => 
        (option || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isAllSelected = currentValues === undefined;
    const selectedCount = isAllSelected ? options.length : currentValues.length;

    return (
        <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex justify-between">
                <span>{col.header}</span>
                {!isAllSelected && selectedCount > 0 && (
                    <span className="ml-2 text-xs text-muted-foreground">({selectedCount})</span>
                )}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-64 max-h-[300px] flex flex-col p-0">
                 <div className="px-2 py-2 border-b">
                    <Input 
                        placeholder="Search..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 text-xs focus-visible:ring-1"
                        onKeyDown={(e) => e.stopPropagation()} 
                    />
                 </div>
                 
                 <div className="flex items-center justify-between px-2 py-1.5 border-b bg-muted/20">
                    <span className="text-xs font-medium text-muted-foreground">{filteredOptions.length} items</span>
                    <div className="flex gap-2">
                        <span 
                            className="text-xs cursor-pointer text-primary hover:underline"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelectAll();
                            }}
                        >
                            All
                        </span>
                        <span 
                            className="text-xs cursor-pointer text-destructive hover:underline"
                            onClick={(e) => {
                                e.stopPropagation();
                                onClear();
                            }}
                        >
                            None
                        </span>
                    </div>
                </div>
                
                <ScrollArea className="h-[200px]">
                    {filteredOptions.length === 0 ? (
                        <div className="p-4 text-center text-xs text-muted-foreground">No matches found</div>
                    ) : (
                        filteredOptions.map((option) => {
                            const isChecked = isAllSelected || currentValues.includes(option);
                            return (
                                <DropdownMenuCheckboxItem
                                    key={option}
                                    checked={isChecked}
                                    onCheckedChange={() => onFilterChange(option)}
                                >
                                    {option || "(Empty)"}
                                </DropdownMenuCheckboxItem>
                            );
                        })
                    )}
                </ScrollArea>
            </DropdownMenuSubContent>
        </DropdownMenuSub>
    );
}

export function FilterMenu<T>({
  columns,
  allData,
  filters,
  onFiltersChange,
}: FilterMenuProps<T>) {

  // Calculate unique values for each column only when data changes
  const columnOptions = useMemo(() => {
    const options: Record<string, string[]> = {};
    columns.forEach(col => {
      if (col.accessorKey) {
        const values = Array.from(new Set(allData.map((item: any) => String(item[col.accessorKey] || ''))));
        options[col.accessorKey] = values.sort();
      }
    });
    return options;
  }, [allData, columns]);

  const handleFilterChange = (key: string, value: string) => {
    const currentFilters = filters[key];
    const uniqueValues = columnOptions[key] || [];
    
    let newFilters: string[];
    
    if (currentFilters === undefined) {
      // Currently all selected (undefined). Unchecking one means "All except this one"
      newFilters = uniqueValues.filter(v => v !== value);
    } else {
      // Some are selected.
      if (currentFilters.includes(value)) {
        // Uncheck it
        newFilters = currentFilters.filter(v => v !== value);
      } else {
        // Check it
        newFilters = [...currentFilters, value];
      }
    }
    
    const updatedFilters = { ...filters };
    if (newFilters.length === uniqueValues.length) {
       // All selected again -> remove key to indicate "all"
       delete updatedFilters[key];
    } else {
       updatedFilters[key] = newFilters;
    }
    
    onFiltersChange(updatedFilters);
  };

  const handleSelectAll = (key: string) => {
    const updatedFilters = { ...filters };
    delete updatedFilters[key]; // Remove key means "all selected"
    onFiltersChange(updatedFilters);
  };

  const handleClearColumn = (key: string) => {
    const updatedFilters = { ...filters };
    updatedFilters[key] = []; // Empty array means "none selected"
    onFiltersChange(updatedFilters);
  };

  const handleResetAll = () => {
    onFiltersChange({});
  };

  const activeFilterCount = Object.keys(filters).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
           variant="outline" 
           className={activeFilterCount > 0 ? "text-primary border-primary bg-primary/5 h-9" : "text-muted-foreground h-9"}
        >
          <Filter className="mr-2 h-4 w-4" /> 
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 rounded-full bg-primary text-primary-foreground px-1.5 py-0.5 text-xs font-bold">
                {activeFilterCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center justify-between">
            <span>Filter by...</span>
            {activeFilterCount > 0 && (
                <span 
                    onClick={(e) => {
                        e.stopPropagation();
                        handleResetAll();
                    }}
                    className="text-xs font-normal text-destructive cursor-pointer hover:underline"
                >
                    Reset All
                </span>
            )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-[300px]">
            {columns.map((col) => {
                if (!col.accessorKey) return null;
                const key = col.accessorKey;
                const options = columnOptions[key] || [];
                const currentValues = filters[key]; // undefined = all

                return (
                    <FilterColumnSubMenu 
                        key={key}
                        col={col}
                        options={options}
                        currentValues={currentValues}
                        onFilterChange={(value) => handleFilterChange(key, value)}
                        onSelectAll={() => handleSelectAll(key)}
                        onClear={() => handleClearColumn(key)}
                    />
                );
            })}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
