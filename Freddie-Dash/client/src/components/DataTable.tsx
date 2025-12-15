import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Filter, Check, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  allData: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  columnFilters: Record<string, string[]>;
  onColumnFiltersChange: (filters: Record<string, string[]>) => void;
  sortConfig?: { key: string | null; direction: 'asc' | 'desc' };
  onSort?: (key: string) => void;
}

export function DataTable<T extends { id: string }>({ 
  data, 
  allData, 
  columns, 
  onRowClick,
  columnFilters,
  onColumnFiltersChange,
  sortConfig,
  onSort
}: DataTableProps<T>) {

  const tableRef = useRef<HTMLTableElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const table = tableRef.current;
    const wrapper = table?.parentElement;
    
    if (!wrapper) return;

    const handleScroll = () => {
      setIsScrolled(wrapper.scrollLeft > 0);
    };

    wrapper.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    
    return () => wrapper.removeEventListener('scroll', handleScroll);
  }, []);

  const getUniqueValues = (key: keyof T) => {
    const values = Array.from(new Set(allData.map(item => String(item[key] || ''))));
    return values.sort();
  };

  const handleFilterChange = (key: string, value: string, uniqueValues: string[]) => {
    const currentFilters = columnFilters[key]; // undefined = all selected
    
    let newFilters: string[];
    
    if (currentFilters === undefined) {
      // Currently all selected. Unchecking one means "All except this one"
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
    
    const updatedFilters = { ...columnFilters };
    if (newFilters.length === uniqueValues.length) {
       // All selected again
       delete updatedFilters[key];
    } else {
       updatedFilters[key] = newFilters;
    }
    
    onColumnFiltersChange(updatedFilters);
  };

  const handleSelectAll = (key: string) => {
     const currentFilters = columnFilters[key];
     const updatedFilters = { ...columnFilters };
     
     if (currentFilters === undefined) {
         // Currently all selected -> Deselect all
         updatedFilters[key] = []; 
     } else {
         // Currently partial or empty -> Select All
         delete updatedFilters[key];
     }
     onColumnFiltersChange(updatedFilters);
  };

  const handleClearColumnFilter = (key: string) => {
    const updatedFilters = { ...columnFilters };
    delete updatedFilters[key];
    onColumnFiltersChange(updatedFilters);
  }

  return (
    <div className="rounded-md border border-border bg-card shadow-sm overflow-hidden">
      <Table ref={tableRef}>
        <TableHeader className="bg-muted/50">
          <TableRow className="border-b border-border">
            {columns.map((col, index) => {
               const key = String(col.accessorKey);
               const isFiltered = !!columnFilters[key];
               // Only calculate unique values if accessorKey is present
               const uniqueValues = col.accessorKey ? getUniqueValues(col.accessorKey) : [];
               const currentFilterValues = columnFilters[key]; // undefined means all selected
               
               // Determine Select All state
               const isSelectAll = currentFilterValues === undefined;
               
               const isSorted = sortConfig?.key === key;
               const SortIcon = isSorted 
                 ? (sortConfig?.direction === 'asc' ? ArrowUp : ArrowDown)
                 : ArrowUpDown;

               return (
              <TableHead 
                key={String(col.accessorKey || index)} 
                className={cn(
                  "font-bold text-primary whitespace-nowrap border-r border-border last:border-r-0 px-4 py-3 h-auto select-none",
                  index === 0 && "sticky left-0 z-20 bg-muted",
                  index === 0 && isScrolled && "border-r-[3px] border-slate-300 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.1)]"
                )}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <div 
                    className={cn(
                      "flex items-center gap-1.5 rounded cursor-pointer hover:bg-black/5 -ml-1 pl-1 pr-1.5 py-0.5 transition-colors",
                      !col.accessorKey && "cursor-default hover:bg-transparent"
                    )}
                    onClick={() => {
                      if (col.accessorKey && onSort) {
                         onSort(String(col.accessorKey));
                      }
                    }}
                  >
                    {col.header}
                    {col.accessorKey && (
                       <SortIcon className={cn("h-3.5 w-3.5", isSorted ? "opacity-100" : "opacity-30")} />
                    )}
                  </div>
                  
                  {col.accessorKey && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={cn(
                            "h-6 w-6 p-0 hover:bg-muted/80 data-[state=open]:bg-muted/80",
                            isFiltered && "text-primary bg-primary/10"
                          )}
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
                                <CommandItem
                                  onSelect={() => handleSelectAll(key)}
                                  className="flex items-center gap-2 cursor-pointer font-medium border-b"
                                >
                                   <div className={cn(
                                      "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                      isSelectAll ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                    )}>
                                      <Check className={cn("h-3 w-3")} />
                                    </div>
                                    <span>(Select All)</span>
                                </CommandItem>
                                <CommandItem
                                  onSelect={() => handleClearColumnFilter(key)}
                                  className="justify-center text-center font-medium text-destructive cursor-pointer my-1"
                                >
                                  Clear Filter
                                </CommandItem>
                            </CommandGroup>
                            <CommandSeparator />
                            <CommandGroup className="max-h-[200px] overflow-auto">
                              {uniqueValues.map((val) => {
                                const isSelected = !currentFilterValues || currentFilterValues.includes(val);
                                return (
                                  <CommandItem
                                    key={val}
                                    onSelect={() => handleFilterChange(key, val, uniqueValues)}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <div className={cn(
                                      "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                      isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                    )}>
                                      <Check className={cn("h-3 w-3")} />
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
                  )}
                </div>
              </TableHead>
            )})}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                No Records Found
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, rowIndex) => {
              const rowKey = (item as any).version ? `${item.id}-v${(item as any).version}` : item.id;
              return (
            <TableRow 
              key={rowKey} 
              className={cn(
                "hover:bg-muted/30 transition-colors border-b border-border",
                onRowClick && "cursor-pointer"
              )}
              onClick={() => onRowClick && onRowClick(item)}
            >
              {columns.map((col, index) => (
                <TableCell 
                  key={`${item.id}-${String(col.accessorKey || index)}`} 
                  className={cn(
                    "text-sm border-r border-border last:border-r-0 px-4 py-3 whitespace-nowrap",
                    index === 0 && "sticky left-0 z-10 bg-card",
                    index === 0 && isScrolled && "border-r-[3px] border-slate-300 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.1)]"
                  )}
                >
                  {col.cell ? col.cell(item) : (col.accessorKey ? (
                    (item[col.accessorKey] === undefined || item[col.accessorKey] === null || item[col.accessorKey] === 'undefined') 
                      ? '-' 
                      : String(item[col.accessorKey])
                  ) : null)}
                </TableCell>
              ))}
            </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary';
  let className = '';

  switch (status.toLowerCase()) {
    case 'active':
    case 'connected':
    case 'on track':
    case 'operational':
      variant = 'default';
      className = 'bg-green-700 hover:bg-green-800 text-white border-transparent';
      break;
    case 'pending':
    case 'syncing':
    case 'staging':
      variant = 'secondary';
      className = 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200';
      break;
    case 'archived':
    case 'inactive':
    case 'offline':
    case 'completed':
      variant = 'outline';
      className = 'text-muted-foreground';
      break;
    case 'maintenance':
    case 'error':
    case 'at risk':
    case 'degraded':
    case 'delayed':
      variant = 'destructive';
      className = 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
      break;
  }

  return (
    <Badge variant={variant} className={`font-semibold rounded-sm px-2 py-0.5 ${className}`}>
      {status}
    </Badge>
  );
}
