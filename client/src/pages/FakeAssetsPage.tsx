import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ViewToggle } from '@/components/ViewToggle';
import { DataTable } from '@/components/DataTable';
import { DataCard } from '@/components/DataCard';
import { Pagination } from '@/components/Pagination';
import { mockAssets } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Download, Plus, Save, X, Pencil, Search, Check, ChevronsUpDown, Settings2 } from 'lucide-react';
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

const ALL_COLUMN_KEYS = [
  'id', 'name', 'cmdbStatus', 'type', 'btoAlignment', 'applicationTypeFinancial', 'architect',
  'assessmentCategory', 'blockFundingName', 'blockFundingOwner', 'businessCritical', 'businessOwner',
  'businessOwnerSME', 'cotsOrInHouse', 'customerFacing', 'deploymentLifecyclePhase', 'deploymentLifecycleStartDate',
  'description', 'division', 'foundational', 'hosted', 'isSaas', 'itOwner', 'maintenanceWindow', 'missionCritical',
  'operationalHours', 'ppiClassification', 'sox', 'sppi', 'supportSME', 'supportedBy', 'supporting',
  'lastModifiedBy', 'lastModifiedDate'
];

const ADMIN_DEFAULT_COLUMNS = [
  'id', 'name', 'cmdbStatus', 'type', 'btoAlignment', 'itOwner', 'businessOwner',
  'division', 'hosted', 'sox', 'missionCritical', 'businessCritical', 'lastModifiedBy', 'lastModifiedDate'
];

const VIEWER_DEFAULT_COLUMNS = [
  'id', 'name', 'type', 'cmdbStatus', 'division', 'itOwner', 'businessOwner', 'missionCritical', 'businessCritical'
];

const DEFAULT_CARD_FIELDS = ['id', 'type', 'cmdbStatus', 'itOwner', 'businessOwner', 'division', 'hosted'];

const COLUMN_PRESETS = [
  { name: 'Default', columns: 'default' as const },
  { name: 'All Columns', columns: 'all' as const },
  { name: 'Ownership View', columns: ['id', 'name', 'itOwner', 'businessOwner', 'businessOwnerSME', 'supportedBy', 'supportSME', 'architect'] },
  { name: 'Compliance View', columns: ['id', 'name', 'sox', 'sppi', 'ppiClassification', 'missionCritical', 'businessCritical', 'customerFacing'] },
];

const ENUM_FIELDS: Record<string, string[]> = {
  cmdbStatus: ['Active', 'Retired', 'Provisioning', 'Maintenance', 'Decommissioned'],
  type: ['Application', 'Microservice', 'Database', 'Infrastructure', 'Platform', 'SaaS'],
  hosted: ['On-Premise', 'AWS Cloud', 'Azure Cloud', 'Hybrid', 'Vendor Cloud'],
  sox: ['Yes', 'No'],
  customerFacing: ['Yes', 'No'],
  sppi: ['Yes', 'No'],
  missionCritical: ['Yes', 'No'],
  businessCritical: ['Yes', 'No'],
};

export default function FakeAssetsPage() {
  const { toast } = useToast();
  const { isAdmin, user } = useUser();
  const { view, setView } = useViewToggle('table');
  
  const [data, setData] = useState<any[]>(mockAssets);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState('all');
  const [openCombobox, setOpenCombobox] = useState(false);
  const [assetIdError, setAssetIdError] = useState<string | null>(null);
  const [assetIdAvailable, setAssetIdAvailable] = useState<boolean>(false);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
  const [columnSearchQuery, setColumnSearchQuery] = useState('');
  const [cardFieldVisibility, setCardFieldVisibility] = useState<Record<string, boolean>>({});
  
  const defaultVisibleColumns = isAdmin ? ADMIN_DEFAULT_COLUMNS : VIEWER_DEFAULT_COLUMNS;

  useEffect(() => {
    const storageKey = `assets-column-visibility-${isAdmin ? 'admin' : 'viewer'}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setColumnVisibility(JSON.parse(saved));
      } catch {
        const visibility: Record<string, boolean> = {};
        ALL_COLUMN_KEYS.forEach(key => { visibility[key] = defaultVisibleColumns.includes(key); });
        setColumnVisibility(visibility);
      }
    } else {
      const visibility: Record<string, boolean> = {};
      ALL_COLUMN_KEYS.forEach(key => { visibility[key] = defaultVisibleColumns.includes(key); });
      setColumnVisibility(visibility);
    }

    const cardStorageKey = 'assets-card-field-visibility';
    const savedCard = localStorage.getItem(cardStorageKey);
    if (savedCard) {
      try { setCardFieldVisibility(JSON.parse(savedCard)); } 
      catch { 
        const visibility: Record<string, boolean> = {};
        DEFAULT_CARD_FIELDS.forEach(key => { visibility[key] = true; });
        setCardFieldVisibility(visibility);
      }
    } else {
      const visibility: Record<string, boolean> = {};
      DEFAULT_CARD_FIELDS.forEach(key => { visibility[key] = true; });
      setCardFieldVisibility(visibility);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (Object.keys(columnVisibility).length > 0) {
      localStorage.setItem(`assets-column-visibility-${isAdmin ? 'admin' : 'viewer'}`, JSON.stringify(columnVisibility));
    }
  }, [columnVisibility, isAdmin]);

  useEffect(() => {
    if (Object.keys(cardFieldVisibility).length > 0) {
      localStorage.setItem('assets-card-field-visibility', JSON.stringify(cardFieldVisibility));
    }
  }, [cardFieldVisibility]);

  const columns = useMemo(() => [
    { 
      header: 'Asset ID', 
      accessorKey: 'id',
      cell: (item: any) => (
        <button 
          onClick={(e) => { e.stopPropagation(); isAdmin ? handleEditClick(item) : handleItemClick(item); }}
          className="text-primary hover:underline font-bold underline decoration-2 underline-offset-2 hover:text-primary/80 transition-colors"
        >
          {item.id}
        </button>
      )
    },
    { header: 'Name', accessorKey: 'name', cell: (item: any) => <span className="font-semibold text-primary">{item.name}</span> },
    { header: 'CMDB Status', accessorKey: 'cmdbStatus' },
    { header: 'Asset Type', accessorKey: 'type' },
    { header: 'BTO Alignment', accessorKey: 'btoAlignment' },
    { header: 'Application Type Financial', accessorKey: 'applicationTypeFinancial' },
    { header: 'Architect', accessorKey: 'architect' },
    { header: 'Assessment Category', accessorKey: 'assessmentCategory' },
    { header: 'Block Funding Name', accessorKey: 'blockFundingName' },
    { header: 'Block Funding Owner', accessorKey: 'blockFundingOwner' },
    { header: 'Business Critical', accessorKey: 'businessCritical' },
    { header: 'Business Owner', accessorKey: 'businessOwner' },
    { header: 'Business Owner SME', accessorKey: 'businessOwnerSME' },
    { header: 'COTS or In House Built', accessorKey: 'cotsOrInHouse' },
    { header: 'Customer Facing', accessorKey: 'customerFacing' },
    { header: 'Deployment Lifecycle Phase', accessorKey: 'deploymentLifecyclePhase' },
    { header: 'Deployment Lifecycle Start Date', accessorKey: 'deploymentLifecycleStartDate' },
    { header: 'Description', accessorKey: 'description' },
    { header: 'Division', accessorKey: 'division' },
    { header: 'Foundational', accessorKey: 'foundational' },
    { header: 'Hosted', accessorKey: 'hosted' },
    { header: 'Is SAAS', accessorKey: 'isSaas' },
    { header: 'IT Owner', accessorKey: 'itOwner' },
    { header: 'Maintenance Window', accessorKey: 'maintenanceWindow' },
    { header: 'Mission Critical', accessorKey: 'missionCritical' },
    { header: 'Operational Hours', accessorKey: 'operationalHours' },
    { header: 'PPI Classification', accessorKey: 'ppiClassification' },
    { header: 'SOX', accessorKey: 'sox' },
    { header: 'SPPI', accessorKey: 'sppi' },
    { header: 'Support SME', accessorKey: 'supportSME' },
    { header: 'Supported By', accessorKey: 'supportedBy' },
    { header: 'Supporting', accessorKey: 'supporting' },
    { header: 'Last Modified By', accessorKey: 'lastModifiedBy' },
    { header: 'Last Modified Date', accessorKey: 'lastModifiedDate' },
  ], [isAdmin]);

  const cardFields = [
    { label: 'Asset ID', key: 'id' },
    { label: 'Asset Type', key: 'type' },
    { label: 'CMDB Status', key: 'cmdbStatus' },
    { label: 'IT Owner', key: 'itOwner' },
    { label: 'Business Owner', key: 'businessOwner' },
    { label: 'Division', key: 'division' },
    { label: 'Hosted', key: 'hosted' },
  ];

  const searchFilteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((item: any) => {
      if (searchColumn === 'all') {
        return columns.some(col => {
          const value = item[col.accessorKey];
          return value && String(value).toLowerCase().includes(query);
        });
      }
      const value = item[searchColumn];
      return value && String(value).toLowerCase().includes(query);
    });
  }, [data, searchQuery, searchColumn, columns]);

  const { columnFilters, setColumnFilters, filteredData } = useColumnFilters(searchFilteredData);
  const { sortConfig, handleSort, sortedData } = useSorting(filteredData);
  const { currentPage, pageSize, setCurrentPage, setPageSize, paginatedData, totalPages, totalItems } = usePagination(sortedData);

  const visibleColumns = useMemo(() => columns.filter(col => columnVisibility[col.accessorKey] !== false), [columns, columnVisibility]);
  const visibleCardFields = useMemo(() => cardFields.filter(field => cardFieldVisibility[field.key]), [cardFieldVisibility]);
  const visibleColumnCount = Object.values(columnVisibility).filter(Boolean).length;

  const handleItemClick = (item: any) => { setSelectedItem(item); setIsEditing(false); setIsDialogOpen(true); };
  const handleEditClick = (item?: any) => {
    const itemToEdit = item || selectedItem;
    if (itemToEdit) {
      setEditFormData({ ...itemToEdit });
      setSelectedItem(itemToEdit);
      setIsEditing(true);
      setAssetIdError(null);
      setAssetIdAvailable(false);
      setIsDialogOpen(true);
    }
  };

  const handleAddNew = () => {
    const newId = `AST-${String(data.length + 1).padStart(4, '0')}`;
    const newItem: any = {
      id: newId, name: '', status: 'Active', cmdbStatus: 'Active', type: '',
      lastModifiedBy: user?.name || 'Unknown User',
      lastModifiedDate: format(new Date(), 'MMM d, yyyy HH:mm'),
    };
    setEditFormData(newItem);
    setSelectedItem(null);
    setIsEditing(true);
    setAssetIdError(null);
    setAssetIdAvailable(false);
    setIsDialogOpen(true);
  };

  const handleCancelEdit = () => { setIsEditing(false); setIsDialogOpen(false); setEditFormData({}); setAssetIdError(null); setAssetIdAvailable(false); };

  const validateAssetId = (id: string): boolean => {
    if (!id || id.trim() === '') { setAssetIdError('Asset ID is required'); setAssetIdAvailable(false); return false; }
    if (!/^AST-\d{4}$/.test(id)) { setAssetIdError('Asset ID must match format: AST-XXXX'); setAssetIdAvailable(false); return false; }
    if (data.some((item: any) => item.id === id && (!selectedItem || item.id !== selectedItem.id))) {
      setAssetIdError('This Asset ID already exists'); setAssetIdAvailable(false); return false;
    }
    setAssetIdError(null); setAssetIdAvailable(true); return true;
  };

  const handleSave = () => {
    if (!validateAssetId(editFormData.id)) return;
    const updatedItem = { ...editFormData, lastModifiedBy: user?.name || 'Unknown User', lastModifiedDate: format(new Date(), 'MMM d, yyyy HH:mm') };
    let updatedList: any[];
    if (selectedItem) {
      updatedList = data.map((item: any) => item.id === selectedItem.id ? updatedItem : item);
    } else {
      updatedList = [...data, updatedItem];
    }
    setData(updatedList);
    setSelectedItem(updatedItem);
    setEditFormData(updatedItem);
    setIsEditing(false);
    toast({ title: selectedItem ? "Changes Saved" : "Asset Created", description: selectedItem ? "Changes have been saved." : `New asset ${updatedItem.id} has been created.` });
  };

  const applyColumnPreset = (preset: { name: string; columns: string[] | 'all' | 'default' }) => {
    let cols: string[];
    if (preset.columns === 'all') cols = ALL_COLUMN_KEYS;
    else if (preset.columns === 'default') cols = defaultVisibleColumns;
    else cols = preset.columns;
    const visibility: Record<string, boolean> = {};
    ALL_COLUMN_KEYS.forEach(key => { visibility[key] = cols.includes(key); });
    setColumnVisibility(visibility);
  };

  const exportToExcel = () => {
    const exportData = sortedData.map((item: any) => {
      const row: Record<string, any> = {};
      visibleColumns.forEach(col => { row[col.header] = item[col.accessorKey] ?? ''; });
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'FakeAssets');
    XLSX.writeFile(wb, `FakeAssets_Export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast({ title: "Export Complete", description: `Exported ${exportData.length} records.` });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fake Asset List</h1>
            <p className="text-muted-foreground mt-1">Track IT asset lifecycle, ownership, and operational compliance.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportToExcel} className="gap-2"><Download className="h-4 w-4" />Export to Excel</Button>
            {isAdmin && <Button onClick={handleAddNew} className="gap-2"><Plus className="h-4 w-4" />Add New</Button>}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-2">
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
                        <Check className={cn("mr-2 h-4 w-4", searchColumn === 'all' ? "opacity-100" : "opacity-0")} />All Columns
                      </CommandItem>
                      {columns.map(col => (
                        <CommandItem key={col.accessorKey} value={col.accessorKey} onSelect={() => { setSearchColumn(col.accessorKey); setOpenCombobox(false); }}>
                          <Check className={cn("mr-2 h-4 w-4", searchColumn === col.accessorKey ? "opacity-100" : "opacity-0")} />{col.header}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search across all fields..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Settings2 className="h-4 w-4" />Columns
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">{visibleColumnCount}/{ALL_COLUMN_KEYS.length}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>Column Visibility</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-2"><Input placeholder="Search columns..." value={columnSearchQuery} onChange={(e) => setColumnSearchQuery(e.target.value)} className="h-8" /></div>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">Presets</DropdownMenuLabel>
                <div className="flex flex-wrap gap-1 p-2">
                  {COLUMN_PRESETS.map(preset => (<Button key={preset.name} variant="outline" size="sm" className="h-6 text-xs" onClick={() => applyColumnPreset(preset)}>{preset.name}</Button>))}
                </div>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                  {columns.filter(col => col.header.toLowerCase().includes(columnSearchQuery.toLowerCase())).map(col => (
                    <DropdownMenuCheckboxItem key={col.accessorKey} checked={columnVisibility[col.accessorKey] !== false} onCheckedChange={(checked) => setColumnVisibility(prev => ({ ...prev, [col.accessorKey]: checked }))}>{col.header}</DropdownMenuCheckboxItem>
                  ))}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
            <ViewToggle view={view} setView={setView} />
          </div>
        </div>

        {view === 'table' ? (
          <DataTable data={paginatedData} columns={visibleColumns} onSort={handleSort} sortConfig={sortConfig} columnFilters={columnFilters} onColumnFiltersChange={(filters: Record<string, string[]>) => setColumnFilters(filters)} allData={sortedData} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedData.map((item: any, index: number) => (<DataCard key={`${item.id}-${index}`} item={item} titleKey="name" statusKey="cmdbStatus" fields={visibleCardFields as any} onClick={handleItemClick} />))}
          </div>
        )}

        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />

        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) handleCancelEdit(); setIsDialogOpen(open); }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="text-xl">{isEditing ? (selectedItem ? 'Edit Item' : 'Add New Item') : (selectedItem?.name || 'Details')}</DialogTitle>
              {selectedItem && !isEditing && <DialogDescription>{selectedItem.id}</DialogDescription>}
            </DialogHeader>
            <ScrollArea className="flex-1 pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                {isEditing ? (
                  Object.entries(editFormData).map(([key, value]) => {
                    const column = columns.find(c => c.accessorKey === key);
                    const enumOptions = ENUM_FIELDS[key];
                    return (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={key} className="text-sm font-medium">{column?.header || key}{key === 'id' && <span className="text-red-500 ml-1">*</span>}</Label>
                        {enumOptions ? (
                          <Select value={String(value || '')} onValueChange={(val) => setEditFormData((prev: any) => ({ ...prev, [key]: val }))}>
                            <SelectTrigger><SelectValue placeholder={`Select ${column?.header || key}`} /></SelectTrigger>
                            <SelectContent>{enumOptions.map(opt => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}</SelectContent>
                          </Select>
                        ) : (
                          <Input id={key} value={String(value || '')} onChange={(e) => { setEditFormData((prev: any) => ({ ...prev, [key]: e.target.value })); if (key === 'id') validateAssetId(e.target.value); }} className={key === 'id' && assetIdError ? 'border-red-500' : ''} />
                        )}
                        {key === 'id' && assetIdError && <p className="text-red-500 text-xs">{assetIdError}</p>}
                        {key === 'id' && assetIdAvailable && <p className="text-green-500 text-xs flex items-center gap-1"><Check className="h-3 w-3" /> Available</p>}
                      </div>
                    );
                  })
                ) : (
                  selectedItem && Object.entries(selectedItem).map(([key, value]) => {
                    const column = columns.find(c => c.accessorKey === key);
                    return (<div key={key} className="space-y-1"><Label className="text-sm text-muted-foreground">{column?.header || key}</Label><p className="text-sm font-medium">{String(value || '-')}</p></div>);
                  })
                )}
              </div>
            </ScrollArea>
            <div className="flex justify-between items-center pt-4 border-t">
              {isEditing ? (
                <><Button variant="outline" onClick={handleCancelEdit}>Cancel</Button><Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4" /> Save</Button></>
              ) : (
                <><div /><div className="flex gap-2"><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button>{isAdmin && <Button onClick={() => handleEditClick()} className="gap-2"><Pencil className="h-4 w-4" /> Edit</Button>}</div></>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
