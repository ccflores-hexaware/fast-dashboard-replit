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
import { Filter, Check, ArrowUpDown, ArrowUp, ArrowDown, Search, ChevronRight, ChevronDown } from "lucide-react";
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
  emptyStateTitle?: string;
  emptyStateMessage?: string;
  expandableVersions?: boolean;
}

export function DataTable<T extends { id: string }>({ 
  data, 
  allData, 
  columns, 
  onRowClick,
  columnFilters,
  onColumnFiltersChange,
  sortConfig,
  onSort,
  emptyStateTitle = "No Records Found",
  emptyStateMessage = "Try adjusting your filters or search criteria",
  expandableVersions = false
}: DataTableProps<T>) {

  const tableRef = useRef<HTMLTableElement>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [versionPages, setVersionPages] = useState<Record<string, number>>({});
  const [versionPageInputs, setVersionPageInputs] = useState<Record<string, string>>({});
  const [versionPageSizes, setVersionPageSizes] = useState<Record<string, number>>({});
  
  const DEFAULT_VERSIONS_PER_PAGE = 5;
  const VERSION_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  
  const getVersionPage = (assetId: string) => {
    return versionPages[assetId] || 1;
  };
  
  const getVersionPageInput = (assetId: string) => {
    return versionPageInputs[assetId] ?? String(getVersionPage(assetId));
  };
  
  const setVersionPageInput = (assetId: string, value: string) => {
    setVersionPageInputs(prev => ({
      ...prev,
      [assetId]: value
    }));
  };
  
  const setVersionPage = (assetId: string, page: number) => {
    setVersionPages(prev => ({
      ...prev,
      [assetId]: page
    }));
    setVersionPageInputs(prev => ({
      ...prev,
      [assetId]: String(page)
    }));
  };
  
  const handleVersionPageSubmit = (assetId: string, totalPages: number) => {
    const inputValue = getVersionPageInput(assetId);
    const pageNum = parseInt(inputValue);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setVersionPage(assetId, pageNum);
    } else {
      setVersionPageInput(assetId, String(getVersionPage(assetId)));
    }
  };
  
  const getVersionPageSize = (assetId: string) => {
    return versionPageSizes[assetId] || DEFAULT_VERSIONS_PER_PAGE;
  };
  
  const setVersionPageSize = (assetId: string, size: number) => {
    setVersionPageSizes(prev => ({
      ...prev,
      [assetId]: size
    }));
    setVersionPage(assetId, 1);
  };

  const groupedData = useMemo(() => {
    if (!expandableVersions) return null;
    
    const groups = new Map<string, T[]>();
    data.forEach(item => {
      const existing = groups.get(item.id) || [];
      existing.push(item);
      groups.set(item.id, existing);
    });
    
    groups.forEach((versions, id) => {
      versions.sort((a, b) => {
        const versionA = (a as any).version || 0;
        const versionB = (b as any).version || 0;
        return versionB - versionA;
      });
    });
    
    return groups;
  }, [data, expandableVersions]);


  const allUniqueValues = useMemo(() => {
    const result: Record<string, string[]> = {};
    columns.forEach(col => {
      if (col.accessorKey) {
        const key = String(col.accessorKey);
        const values = Array.from(new Set(allData.map(item => String(item[col.accessorKey!] || ''))));
        result[key] = values.sort();
      }
    });
    return result;
  }, [allData, columns]);

  const getUniqueValues = (key: keyof T) => {
    return allUniqueValues[String(key)] || [];
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
    <div className="rounded-md border border-border bg-card shadow-sm overflow-x-auto overflow-y-hidden" style={{ overflowAnchor: 'none' }}>
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
                  index === 0 && "sticky left-0 z-30 bg-slate-200"
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
              <TableCell colSpan={columns.length} className="h-48">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <Search className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">{emptyStateTitle}</p>
                  <p className="text-sm">{emptyStateMessage}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : expandableVersions && groupedData ? (
            Array.from(groupedData.entries()).map(([assetId, versions]) => {
              const latestVersion = versions[0];
              const hasMultipleVersions = versions.length > 1;
              const isExpanded = expandedRows.has(assetId);
              
              return (
                <React.Fragment key={assetId}>
                  <TableRow 
                    className={cn(
                      "hover:bg-muted/30 transition-colors border-b border-border",
                      onRowClick && "cursor-pointer",
                      hasMultipleVersions && "font-medium"
                    )}
                    onClick={() => onRowClick && onRowClick(latestVersion)}
                  >
                    {columns.map((col, index) => (
                      <TableCell 
                        key={`${assetId}-${String(col.accessorKey || index)}`} 
                        className={cn(
                          "text-sm border-r border-border last:border-r-0 px-4 py-3 whitespace-nowrap",
                          index === 0 && "sticky left-0 z-20 bg-slate-100"
                        )}
                      >
                        {index === 0 ? (
                          <div className="flex items-center gap-2">
                            {hasMultipleVersions && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRowExpansion(assetId);
                                }}
                                className="p-0.5 hover:bg-muted rounded transition-colors"
                                aria-label={isExpanded ? "Collapse versions" : "Expand versions"}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                              </button>
                            )}
                            {!hasMultipleVersions && <span className="w-5" />}
                            <span>
                              {col.cell ? col.cell(latestVersion) : (col.accessorKey ? (
                                (latestVersion[col.accessorKey] === undefined || latestVersion[col.accessorKey] === null || latestVersion[col.accessorKey] === 'undefined') 
                                  ? '-' 
                                  : String(latestVersion[col.accessorKey])
                              ) : null)}
                            </span>
                            {hasMultipleVersions && (
                              <Badge variant="outline" className="ml-1 text-xs px-1.5 py-0 h-5 font-normal">
                                {versions.length} versions
                              </Badge>
                            )}
                          </div>
                        ) : (
                          col.cell ? col.cell(latestVersion) : (col.accessorKey ? (
                            (latestVersion[col.accessorKey] === undefined || latestVersion[col.accessorKey] === null || latestVersion[col.accessorKey] === 'undefined') 
                              ? '-' 
                              : String(latestVersion[col.accessorKey])
                          ) : null)
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {isExpanded && (() => {
                    const childVersions = versions.slice(1);
                    const pageSize = getVersionPageSize(assetId);
                    const currentPage = getVersionPage(assetId);
                    const totalPages = Math.ceil(childVersions.length / pageSize);
                    const startIndex = (currentPage - 1) * pageSize;
                    const endIndex = startIndex + pageSize;
                    const paginatedVersions = childVersions.slice(startIndex, endIndex);
                    
                    return (
                      <>
                        {paginatedVersions.map((item, versionIndex) => {
                          const rowKey = `${assetId}-v${(item as any).version}-child-${versionIndex}`;
                          return (
                            <TableRow 
                              key={rowKey}
                              className={cn(
                                "hover:bg-muted/30 transition-colors border-b border-border bg-muted/10",
                                onRowClick && "cursor-pointer"
                              )}
                              onClick={() => onRowClick && onRowClick(item)}
                            >
                              {columns.map((col, index) => (
                                <TableCell 
                                  key={`${rowKey}-${String(col.accessorKey || index)}`} 
                                  className={cn(
                                    "text-sm border-r border-border last:border-r-0 px-4 py-3 whitespace-nowrap text-muted-foreground",
                                    index === 0 && "sticky left-0 z-20 bg-slate-50"
                                  )}
                                >
                                  {index === 0 ? (
                                    <div className="flex items-center gap-2 pl-7">
                                      <span className="text-xs text-muted-foreground">└</span>
                                      <span>
                                        {col.cell ? col.cell(item) : (col.accessorKey ? (
                                          (item[col.accessorKey] === undefined || item[col.accessorKey] === null || item[col.accessorKey] === 'undefined') 
                                            ? '-' 
                                            : String(item[col.accessorKey])
                                        ) : null)}
                                      </span>
                                      <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0 h-5 font-normal bg-muted">
                                        v{(item as any).version}
                                      </Badge>
                                    </div>
                                  ) : (
                                    col.cell ? col.cell(item) : (col.accessorKey ? (
                                      (item[col.accessorKey] === undefined || item[col.accessorKey] === null || item[col.accessorKey] === 'undefined') 
                                        ? '-' 
                                        : String(item[col.accessorKey])
                                    ) : null)
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          );
                        })}
                        {childVersions.length > 0 && (
                          <TableRow key={`${assetId}-pagination`} className="bg-muted/5 border-b border-border">
                            <TableCell 
                              colSpan={columns.length}
                              className="text-sm px-4 py-2"
                            >
                              <div className="flex items-center gap-3 pl-7">
                                <span className="text-xs text-muted-foreground">└</span>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <span>Show</span>
                                  <select
                                    value={pageSize}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      setVersionPageSize(assetId, Number(e.target.value));
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-6 px-1 text-xs border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                                  >
                                    {VERSION_PAGE_SIZE_OPTIONS.map(size => (
                                      <option key={size} value={size}>{size}</option>
                                    ))}
                                  </select>
                                  <span>per page</span>
                                </div>
                                {totalPages > 1 && (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setVersionPage(assetId, 1);
                                      }}
                                      disabled={currentPage === 1}
                                      className="px-2 py-1 text-xs rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                                      title="First page"
                                    >
                                      ««
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setVersionPage(assetId, currentPage - 1);
                                      }}
                                      disabled={currentPage === 1}
                                      className="px-2 py-1 text-xs rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                                      title="Previous page"
                                    >
                                      «
                                    </button>
                                    <div className="flex items-center gap-1 text-sm">
                                      <span className="text-muted-foreground">Page</span>
                                      <input
                                        type="text"
                                        value={getVersionPageInput(assetId)}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          setVersionPageInput(assetId, e.target.value);
                                        }}
                                        onBlur={(e) => {
                                          e.stopPropagation();
                                          handleVersionPageSubmit(assetId, totalPages);
                                        }}
                                        onKeyDown={(e) => {
                                          e.stopPropagation();
                                          if (e.key === 'Enter') {
                                            handleVersionPageSubmit(assetId, totalPages);
                                          }
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-10 h-6 px-1 text-center text-sm border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                                        aria-label="Go to page"
                                      />
                                      <span className="text-muted-foreground">of {totalPages}</span>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setVersionPage(assetId, currentPage + 1);
                                      }}
                                      disabled={currentPage === totalPages}
                                      className="px-2 py-1 text-xs rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                                      title="Next page"
                                    >
                                      »
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setVersionPage(assetId, totalPages);
                                      }}
                                      disabled={currentPage === totalPages}
                                      className="px-2 py-1 text-xs rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                                      title="Last page"
                                    >
                                      »»
                                    </button>
                                  </div>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  ({childVersions.length} historical versions)
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })()}
                </React.Fragment>
              );
            })
          ) : (
            data.map((item, rowIndex) => {
              const rowKey = (item as any).version !== undefined 
                ? `${item.id}-v${(item as any).version}-${rowIndex}` 
                : `${item.id}-${rowIndex}`;
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
                    index === 0 && "sticky left-0 z-20 bg-slate-100"
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
