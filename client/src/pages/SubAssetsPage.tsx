import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ViewToggle } from '@/components/ViewToggle';
import { DataTable, StatusBadge } from '@/components/DataTable';
import { DataCard } from '@/components/DataCard';
import { Pagination } from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Download, Save, X, Pencil, Search, Check, ChevronsUpDown, Settings2, RotateCcw, Eye, EyeOff, Loader2, ExternalLink } from 'lucide-react';
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/lib/userContext";
import * as XLSX from 'xlsx';
import { usePagination, useSorting, useColumnFilters, useViewToggle } from '@/hooks';
import { Link } from 'wouter';
import { Badge } from "@/components/ui/badge";

const ALL_COLUMN_KEYS = [
  'parentAssetId', 'name', 'assetId', 'btoAlignment', 'version', 'cmdbStatus', 
  'deploymentLifecyclePhase', 'applicationTypeFinancial', 'itOwner', 'businessOwner', 
  'businessOwnerSme', 'supportedBy', 'supportSme', 'architect', 'division', 
  'blockFundingName', 'blockFundingOwner', 'assessmentCategory', 'deploymentLifecycleStartDate', 
  'assetType', 'hosted', 'sox', 'customerFacing', 'sppi', 'ppiClassification', 
  'foundational', 'missionCritical', 'businessCritical', 'supporting', 
  'cotsOrInHouseBuilt', 'isSaas', 'maintenanceWindow', 'operationalHours', 
  'description', 'externalFacing', 'financialImpact4hrOutage', 'assetTier', 
  'informationClassification', 'lastModifiedBy', 'lastModifiedDate'
];

const DEFAULT_COLUMNS = [
  'parentAssetId', 'name', 'assetId', 'btoAlignment', 'cmdbStatus', 'assetType',
  'itOwner', 'businessOwner', 'architect', 'assetTier'
];

const DEFAULT_CARD_FIELDS = ['parentAssetId', 'assetId', 'btoAlignment', 'cmdbStatus', 'assetType', 'itOwner', 'assetTier'];

const COLUMN_PRESETS = [
  { name: 'Default', columns: 'default' as const },
  { name: 'All Columns', columns: 'all' as const },
  { name: 'Ownership Focus', columns: ['parentAssetId', 'name', 'itOwner', 'businessOwner', 'businessOwnerSme', 'supportedBy', 'supportSme', 'architect'] },
  { name: 'Technical Focus', columns: ['parentAssetId', 'name', 'assetType', 'hosted', 'cotsOrInHouseBuilt', 'isSaas', 'maintenanceWindow', 'operationalHours'] },
  { name: 'Compliance Focus', columns: ['parentAssetId', 'name', 'sox', 'customerFacing', 'sppi', 'ppiClassification', 'foundational', 'missionCritical', 'businessCritical'] },
];

const ENUM_FIELDS: Record<string, string[]> = {
  cmdbStatus: ['Active', 'Retired', 'Provisioning', 'Maintenance', 'Decommissioned'],
  deploymentLifecyclePhase: ['Development', 'Testing', 'Staging', 'Production', 'Deprecated'],
  applicationTypeFinancial: ['Financial', 'Non-Financial'],
  assetType: ['Application', 'Service', 'Platform', 'API', 'Infrastructure'],
  hosted: ['On-Premise', 'Cloud', 'Hybrid'],
  sox: ['Yes', 'No'],
  customerFacing: ['Yes', 'No'],
  sppi: ['Yes', 'No'],
  ppiClassification: ['Public', 'Internal', 'Confidential', 'Restricted'],
  foundational: ['Yes', 'No'],
  missionCritical: ['Yes', 'No'],
  businessCritical: ['Yes', 'No'],
  supporting: ['Yes', 'No'],
  cotsOrInHouseBuilt: ['COTS', 'In-House', 'Hybrid'],
  isSaas: ['Yes', 'No'],
  externalFacing: ['Yes', 'No'],
  assetTier: ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'],
  informationClassification: ['Public', 'Internal', 'Confidential', 'Restricted'],
};

const MAX_CARD_FIELDS = 7;

const FIELD_LABELS: Record<string, string> = {
  parentAssetId: 'Parent Asset ID',
  name: 'Name',
  assetId: 'Asset ID',
  btoAlignment: 'BTO Alignment',
  version: 'Version',
  cmdbStatus: 'CMDB Status',
  deploymentLifecyclePhase: 'Deployment Lifecycle Phase',
  applicationTypeFinancial: 'Application Type Financial',
  itOwner: 'IT Owner',
  businessOwner: 'Business Owner',
  businessOwnerSme: 'Business Owner SME',
  supportedBy: 'Supported By',
  supportSme: 'Support SME',
  architect: 'Architect',
  division: 'Division',
  blockFundingName: 'Block Funding Name',
  blockFundingOwner: 'Block Funding Owner',
  assessmentCategory: 'Assessment Category',
  deploymentLifecycleStartDate: 'Deployment Lifecycle Start Date',
  assetType: 'Asset Type',
  hosted: 'Hosted',
  sox: 'SOX',
  customerFacing: 'Customer Facing',
  sppi: 'SPPI',
  ppiClassification: 'PPI Classification',
  foundational: 'Foundational',
  missionCritical: 'Mission Critical',
  businessCritical: 'Business Critical',
  supporting: 'Supporting',
  cotsOrInHouseBuilt: 'COTS or In-House Built',
  isSaas: 'Is SAAS',
  maintenanceWindow: 'Maintenance Window',
  operationalHours: 'Operational Hours',
  description: 'Description',
  externalFacing: 'External Facing',
  financialImpact4hrOutage: 'Financial Impact of 4hr Outage',
  assetTier: 'Asset Tier',
  informationClassification: 'Information Classification',
  lastModifiedBy: 'Last Modified By',
  lastModifiedDate: 'Last Modified Date',
};

export default function SubAssetsPage() {
  const { user, isAdmin } = useUser();
  const { toast } = useToast();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { view, setView } = useViewToggle('table');
  const { currentPage, setCurrentPage, pageSize, setPageSize, totalPages, totalItems, paginatedData, setTotalItems } = usePagination({ initialPageSize: 25 });
  const { sortColumn, sortDirection, handleSort } = useSorting();
  const { columnFilters, setColumnFilter, clearColumnFilters, filterData } = useColumnFilters();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState('all');
  const [openCombobox, setOpenCombobox] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
  const [cardFieldVisibility, setCardFieldVisibility] = useState<Record<string, boolean>>({});
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [columnSearchQuery, setColumnSearchQuery] = useState('');
  const [cardFieldSearchQuery, setCardFieldSearchQuery] = useState('');

  useEffect(() => {
    const storageKey = `sub-assets-column-visibility`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setColumnVisibility(JSON.parse(saved));
    } else {
      const initial: Record<string, boolean> = {};
      ALL_COLUMN_KEYS.forEach(key => {
        initial[key] = DEFAULT_COLUMNS.includes(key);
      });
      setColumnVisibility(initial);
    }
  }, []);

  useEffect(() => {
    const storageKey = `sub-assets-card-field-visibility`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setCardFieldVisibility(JSON.parse(saved));
    } else {
      const initial: Record<string, boolean> = {};
      ALL_COLUMN_KEYS.forEach(key => {
        initial[key] = DEFAULT_CARD_FIELDS.includes(key);
      });
      setCardFieldVisibility(initial);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(`sub-assets-column-visibility`, JSON.stringify(columnVisibility));
  }, [columnVisibility]);

  useEffect(() => {
    localStorage.setItem(`sub-assets-card-field-visibility`, JSON.stringify(cardFieldVisibility));
  }, [cardFieldVisibility]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/sub-assets');
      if (!response.ok) throw new Error('Failed to fetch');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching sub-assets:', error);
      toast({ title: "Error", description: "Failed to load sub-assets.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const columns = useMemo(() => {
    return ALL_COLUMN_KEYS.map(key => ({
      accessorKey: key,
      header: FIELD_LABELS[key] || key,
      enableSorting: true,
      enableFiltering: true,
    }));
  }, []);

  const visibleColumns = useMemo(() => {
    return columns.filter(col => columnVisibility[col.accessorKey] !== false);
  }, [columns, columnVisibility]);

  const visibleCardFields = useMemo(() => {
    return columns.filter(col => cardFieldVisibility[col.accessorKey] === true);
  }, [columns, cardFieldVisibility]);

  const visibleColumnCount = Object.values(columnVisibility).filter(Boolean).length;
  const totalColumnCount = ALL_COLUMN_KEYS.length;
  const visibleCardFieldCount = Object.values(cardFieldVisibility).filter(Boolean).length;

  const filteredData = useMemo(() => {
    let result = [...data];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => {
        if (searchColumn === 'all') {
          return Object.values(item).some(val => String(val).toLowerCase().includes(query));
        }
        return String(item[searchColumn]).toLowerCase().includes(query);
      });
    }
    result = filterData(result);
    return result;
  }, [data, searchQuery, searchColumn, filterData]);

  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortColumn] ?? '';
      const bVal = b[sortColumn] ?? '';
      if (sortDirection === 'asc') return String(aVal).localeCompare(String(bVal));
      return String(bVal).localeCompare(String(aVal));
    });
  }, [filteredData, sortColumn, sortDirection]);

  useEffect(() => {
    setTotalItems(sortedData.length);
    setCurrentPage(1);
  }, [sortedData.length, setTotalItems, setCurrentPage]);

  const currentPageData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setEditFormData(item);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormData(selectedItem);
  };

  const handleSave = async () => {
    if (!editFormData) return;
    setIsSaving(true);
    
    try {
      const updatedItem = {
        ...editFormData,
        lastModifiedBy: user?.name || 'Unknown User',
        lastModifiedDate: format(new Date(), 'MMM d, yyyy HH:mm'),
      };
      
      const response = await fetch(`/api/sub-assets/${selectedItem.internalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
      });
      
      if (!response.ok) throw new Error('Failed to update');
      const savedItem = await response.json();
      
      setData(data.map(item => item.internalId === savedItem.internalId ? savedItem : item));
      setSelectedItem(savedItem);
      setEditFormData(savedItem);
      setIsEditing(false);
      toast({
        title: "Sub-asset Updated",
        description: `Changes to ${savedItem.parentAssetId} have been saved.`,
        variant: "success"
      });
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const applyColumnPreset = (preset: { name: string; columns: string[] | 'all' | 'default' }) => {
    let cols: string[];
    if (preset.columns === 'all') {
      cols = ALL_COLUMN_KEYS;
    } else if (preset.columns === 'default') {
      cols = DEFAULT_COLUMNS;
    } else {
      cols = preset.columns;
    }
    const visibility: Record<string, boolean> = {};
    ALL_COLUMN_KEYS.forEach(key => {
      visibility[key] = cols.includes(key);
    });
    setColumnVisibility(visibility);
  };

  const exportToExcel = () => {
    const exportData = sortedData.map((item: any) => {
      const row: Record<string, any> = {};
      visibleColumns.forEach(col => {
        row[col.header] = item[col.accessorKey] ?? '';
      });
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sub-assets');
    
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
      if (cell) {
        cell.s = { fill: { fgColor: { rgb: '89c24b' } }, font: { bold: true, color: { rgb: 'FFFFFF' } } };
      }
    }
    
    XLSX.writeFile(wb, `Sub-assets_Export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast({ title: "Export Complete", description: `Exported ${exportData.length} records.`, variant: "success" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sub-assets</h1>
            <p className="text-muted-foreground mt-1">Manage sub-assets derived from FAST assets with detailed attributes.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={exportToExcel} className="gap-2 text-white" style={{ backgroundColor: '#89c24b' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7ab043'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#89c24b'}>
              <Download className="h-4 w-4" />
              Export to Excel
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
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
                      <CommandItem value="all" onSelect={() => { setSearchColumn('all'); setOpenCombobox(false); }}>
                        <Check className={cn("mr-2 h-4 w-4", searchColumn === 'all' ? "opacity-100" : "opacity-0")} />
                        All Columns
                      </CommandItem>
                      {columns.map(col => (
                        <CommandItem key={col.accessorKey} value={col.accessorKey} onSelect={() => { setSearchColumn(col.accessorKey); setOpenCombobox(false); }}>
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
                placeholder="Search across all fields..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Column Visibility</span>
                  <Button variant="ghost" size="sm" onClick={() => applyColumnPreset({ name: 'Default', columns: 'default' })} className="h-6 text-xs"><RotateCcw className="h-3 w-3 mr-1" /> Reset</Button>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">Presets</DropdownMenuLabel>
                {COLUMN_PRESETS.map(preset => (
                  <DropdownMenuItem key={preset.name} onClick={() => applyColumnPreset(preset)}>{preset.name}</DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5">
                  <Input placeholder="Search columns..." value={columnSearchQuery} onChange={(e) => setColumnSearchQuery(e.target.value)} className="h-8 text-sm" />
                </div>
                <ScrollArea className="h-[300px]">
                  {columns
                    .filter(col => col.header.toLowerCase().includes(columnSearchQuery.toLowerCase()))
                    .map(col => (
                      <DropdownMenuCheckboxItem
                        key={col.accessorKey}
                        checked={columnVisibility[col.accessorKey] !== false}
                        onCheckedChange={(checked) => setColumnVisibility(prev => ({ ...prev, [col.accessorKey]: checked }))}
                      >
                        {col.header}
                      </DropdownMenuCheckboxItem>
                    ))}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>

            <ViewToggle view={view} setView={setView} />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : view === 'table' ? (
          <DataTable
            data={currentPageData}
            columns={visibleColumns}
            onRowClick={handleItemClick}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            columnFilters={columnFilters}
            onColumnFilter={setColumnFilter}
            onClearFilters={clearColumnFilters}
            allData={data}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentPageData.map((item: any, index: number) => (
              <DataCard
                key={`${item.internalId}-${index}`}
                item={item}
                titleKey="name"
                statusKey="cmdbStatus"
                fields={visibleCardFields as any}
                onClick={handleItemClick}
              />
            ))}
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />

        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) handleCancelEdit(); setIsDialogOpen(open); }}>
          <DialogContent className="w-full sm:max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
            <DialogHeader className="p-6 pb-2">
              <div className="flex justify-between items-center pr-8">
                <DialogTitle className="text-2xl font-bold text-primary">
                  {isEditing ? 'Edit Sub-asset' : (selectedItem?.name || 'Sub-asset Details')}
                </DialogTitle>
              </div>
              <DialogDescription className="flex items-center gap-2">
                {selectedItem?.parentAssetId && (
                  <>
                    <span>Parent Asset:</span>
                    <Link href="/fast" className="text-primary hover:underline flex items-center gap-1">
                      {selectedItem.parentAssetId}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto px-6 min-h-0">
              <div className="py-4">
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                    {columns.filter(col => col.accessorKey !== 'parentAssetId').map((col) => {
                      const key = col.accessorKey;
                      const value = editFormData[key];
                      const enumOptions = ENUM_FIELDS[key];
                      const isAuditField = key === 'lastModifiedBy' || key === 'lastModifiedDate';
                      const shouldDisable = isAuditField;
                      
                      return (
                        <div key={key} className="flex flex-col space-y-2 py-3 border-b border-border/50">
                          <Label htmlFor={key} className="text-sm font-medium text-muted-foreground">
                            {col.header}
                          </Label>
                          {enumOptions && !shouldDisable ? (
                            <Select value={String(value || '')} onValueChange={(val) => setEditFormData((prev: any) => ({ ...prev, [key]: val }))}>
                              <SelectTrigger className="font-semibold">
                                <SelectValue placeholder={`Select ${col.header}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {enumOptions.map(opt => (
                                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              id={key}
                              value={shouldDisable && !value ? '-' : String(value || '')}
                              onChange={(e) => {
                                if (shouldDisable) return;
                                setEditFormData((prev: any) => ({ ...prev, [key]: e.target.value }));
                              }}
                              disabled={shouldDisable}
                              className={cn(
                                "font-semibold",
                                shouldDisable ? 'bg-muted cursor-not-allowed' : ''
                              )}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                    {columns.map((col) => {
                      const key = col.accessorKey;
                      const value = selectedItem?.[key];
                      return (
                        <div key={key} className="flex flex-col space-y-1 py-3 border-b border-border/50">
                          <span className="text-sm font-medium text-muted-foreground">{col.header}</span>
                          <span className="text-base font-semibold text-foreground">
                            {key === 'parentAssetId' ? (
                              <Link href="/fast" className="text-primary hover:underline flex items-center gap-1">
                                {value || '-'}
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            ) : (
                              (value === undefined || value === null || value === '') ? '-' : String(value)
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-6 pt-4 border-t">
              <div className="flex gap-2">
                {isAdmin && !isEditing && selectedItem && (
                  <Button onClick={handleEdit} className="gap-1" variant="outline">
                    <Pencil className="h-4 w-4" /> Edit
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="gap-1 text-white" style={{ backgroundColor: '#89c24b' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7ab043'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#89c24b'}>
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
