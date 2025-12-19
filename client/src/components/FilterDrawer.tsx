import React, { useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { RotateCcw } from "lucide-react";

interface FilterDrawerProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: { header: string; accessorKey?: string }[];
  allData: T[];
  filters: Record<string, string[]>;
  onFiltersChange: (filters: Record<string, string[]>) => void;
}

export function FilterDrawer<T>({
  open,
  onOpenChange,
  columns,
  allData,
  filters,
  onFiltersChange,
}: FilterDrawerProps<T>) {

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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col h-full p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="flex items-center justify-between">
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleResetAll}
                className="h-8 text-muted-foreground hover:text-destructive"
              >
                <RotateCcw className="mr-2 h-3.5 w-3.5" />
                Reset All
              </Button>
            )}
          </SheetTitle>
          <SheetDescription>
            Narrow down your view by filtering across multiple categories.
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="flex-1 px-6">
          <Accordion type="multiple" className="w-full py-4">
            {columns.map((col, index) => {
              if (!col.accessorKey) return null;
              
              const key = col.accessorKey;
              const options = columnOptions[key] || [];
              const currentValues = filters[key]; // undefined = all
              const isAllSelected = currentValues === undefined;
              const selectedCount = isAllSelected ? options.length : currentValues.length;
              
              return (
                <AccordionItem key={key} value={key}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{col.header}</span>
                      {!isAllSelected && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-normal">
                          {selectedCount} selected
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between text-xs">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-muted-foreground hover:text-primary"
                          onClick={() => handleSelectAll(key)}
                          disabled={isAllSelected}
                        >
                          Select All
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-muted-foreground hover:text-destructive"
                          onClick={() => handleClearColumn(key)}
                          disabled={currentValues?.length === 0}
                        >
                          Clear
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {options.map((option) => {
                          const isChecked = isAllSelected || currentValues.includes(option);
                          const id = `filter-${key}-${option}`;
                          
                          return (
                            <div key={option} className="flex items-center space-x-2">
                              <Checkbox 
                                id={id} 
                                checked={isChecked}
                                onCheckedChange={() => handleFilterChange(key, option)}
                              />
                              <label
                                htmlFor={id}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer w-full py-1"
                              >
                                {option || "(Empty)"}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </ScrollArea>
        
        <SheetFooter className="p-6 border-t mt-auto">
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Show Results
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
