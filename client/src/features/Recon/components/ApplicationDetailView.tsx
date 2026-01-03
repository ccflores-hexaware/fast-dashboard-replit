import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/Pagination';
import { LoadingState } from '@/components/LoadingState';
import { ReconDetailsDialog } from './ReconDetailsDialog';
import { ArrowLeft, Search, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { COLUMN_HEADERS } from '../constants/columns';
import type { ReconAsset, AccountGroupedAsset, ApplicationDetailResult } from '../types/asset.types';
import type { ColumnDefinition, SortConfig } from '../types/column.types';
import { ColumnFilterPopover } from './table/ColumnFilterPopover';

interface ApplicationDetailViewProps {
  applicationName: string;
  onBack: () => void;
}

const DETAIL_COLUMNS: (keyof ReconAsset)[] = [
  'accountname',
  'entitlementcolumn',
  'entitlementvalue',
  'filepath',
  'applicationstatus',
  'status',
];

const DEFAULT_PAGE_SIZE = 10;

export function ApplicationDetailView({ applicationName, onBack }: ApplicationDetailViewProps) {
  const { toast } = useToast();
  const [data, setData] = useState<AccountGroupedAsset[]>([]);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});
  const [filterOptions, setFilterOptions] = useState<Record<string, string[]>>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalGroups, setTotalGroups] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedItem, setSelectedItem] = useState<ReconAsset | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef(true);

  const columns: ColumnDefinition[] = useMemo(() => 
    DETAIL_COLUMNS.map(key => ({
      header: COLUMN_HEADERS[key],
      accessorKey: key,
    })), 
  []);

  const allColumns: ColumnDefinition[] = useMemo(() => [
    { header: 'Application Name', accessorKey: 'applicationname' },
    ...columns
  ], [columns]);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await fetch(`/api/recon/applications/${encodeURIComponent(applicationName)}/filter-options`);
      if (response.ok) {
        const options = await response.json();
        setFilterOptions(options);
      }
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  }, [applicationName]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = new URL(`/api/recon/applications/${encodeURIComponent(applicationName)}`, window.location.origin);
      url.searchParams.append('page', String(currentPage));
      url.searchParams.append('limit', String(pageSize));
      if (searchQuery.trim()) {
        url.searchParams.append('search', searchQuery.trim());
      }
      if (sortConfig.key) {
        url.searchParams.append('sortBy', sortConfig.key);
        url.searchParams.append('sortOrder', sortConfig.direction);
      }
      if (Object.keys(columnFilters).length > 0) {
        url.searchParams.append('filters', JSON.stringify(columnFilters));
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch application data');
      }

      const result: ApplicationDetailResult = await response.json();
      setData(result.data);
      setApplicationStatus(result.applicationStatus);
      setTotalGroups(result.totalGroups);
      setTotalRecords(result.totalRecords);
      setTotalPages(result.totalPages);

      if (result.data.length > 0 && initialLoadRef.current) {
        setExpandedGroups(new Set([result.data[0].accountName]));
        initialLoadRef.current = false;
      }

      if (Object.keys(filterOptions).length === 0) {
        fetchFilterOptions();
      }
    } catch (error) {
      console.error('Error fetching application data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load application data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [applicationName, currentPage, pageSize, searchQuery, sortConfig, columnFilters, toast, fetchFilterOptions, filterOptions]);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      fetchData();
    }, 300);
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [fetchData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortConfig, columnFilters]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const toggleGroup = (accountName: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(accountName)) {
        next.delete(accountName);
      } else {
        next.add(accountName);
      }
      return next;
    });
  };

  const handleFilterChange = (key: string, value: string, uniqueValues: string[]) => {
    setColumnFilters((prev: Record<string, string[]>) => {
      const currentValues = prev[key] || [...uniqueValues];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      if (newValues.length === 0 || newValues.length === uniqueValues.length) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: newValues };
    });
  };

  const handleSelectAll = (key: string) => {
    setColumnFilters(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleClearFilter = (key: string) => {
    setColumnFilters(prev => ({ ...prev, [key]: [] }));
  };

  const getUniqueValues = (key: string): string[] => {
    return filterOptions[key] || [];
  };

  const handleItemClick = (item: ReconAsset) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">{applicationName}</h2>
          <div className="flex items-center gap-2">
            {applicationStatus && (
              <Badge variant="secondary">{applicationStatus}</Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {totalRecords} record{totalRecords !== 1 ? 's' : ''} in {totalGroups} account group{totalGroups !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search across all fields..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-md border border-border bg-card shadow-sm overflow-x-auto overflow-y-hidden">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b bg-muted/50">
            <tr className="border-b transition-colors hover:bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-10"></th>
              {columns.map((column) => {
                const key = column.accessorKey as string;
                const uniqueValues = getUniqueValues(key);
                const isFiltered = columnFilters[key] && columnFilters[key].length > 0 && columnFilters[key].length < uniqueValues.length;
                
                return (
                  <th 
                    key={key}
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:bg-muted/80"
                    onClick={() => handleSort(key)}
                  >
                    <div className="flex items-center gap-1">
                      <span>{column.header}</span>
                      {sortConfig.key === key && (
                        <span className="text-xs">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                      )}
                      {isFiltered && <span className="text-primary">*</span>}
                      <ColumnFilterPopover
                        columnKey={key}
                        columnHeader={column.header}
                        isFiltered={isFiltered}
                        uniqueValues={uniqueValues}
                        currentFilterValues={columnFilters[key]}
                        onFilterChange={handleFilterChange}
                        onSelectAll={handleSelectAll}
                        onClearFilter={handleClearFilter}
                      />
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-16">
                  <div className="flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-muted-foreground">Loading data...</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-16">
                  <div className="flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <h3 className="text-lg font-semibold">No Records Found</h3>
                      <p className="text-sm">Try adjusting your search or filter criteria</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((group) => {
                const isExpanded = expandedGroups.has(group.accountName);
                return (
                  <React.Fragment key={group.accountName}>
                    <tr
                      className="border-b transition-colors bg-muted/30 hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleGroup(group.accountName)}
                    >
                      <td className="px-4 py-3">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </td>
                      <td colSpan={columns.length} className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <span>{group.accountName}</span>
                          <Badge variant="outline" className="text-xs">
                            {group.recordCount} record{group.recordCount !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && group.records.map((record) => (
                      <tr
                        key={record.internalId}
                        className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleItemClick(record)}
                      >
                        <td className="px-4 py-3"></td>
                        {columns.map((column) => {
                          const value = record[column.accessorKey as keyof ReconAsset];
                          return (
                            <td key={column.accessorKey as string} className="px-4 py-3">
                              {value !== null && value !== undefined ? String(value) : '-'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && data.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {totalGroups} account group{totalGroups !== 1 ? 's' : ''} ({totalRecords} total records)
          </span>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalGroups}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      <ReconDetailsDialog
        isOpen={isDialogOpen}
        onClose={closeDialog}
        selectedItem={selectedItem}
        columns={allColumns}
      />
    </div>
  );
}
