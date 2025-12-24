import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ViewToggle } from '@/components/ViewToggle';
import { DataTable } from '@/components/DataTable';
import { DataCard } from '@/components/DataCard';
import { Pagination } from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Download, Search, Check, ChevronsUpDown, Settings2, Loader2, ChevronDown, ChevronRight, History, Filter, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/lib/userContext";
import * as XLSX from 'xlsx';
import { usePagination, useSorting, useColumnFilters, useViewToggle } from '@/hooks';

const ALL_COLUMN_KEYS = [
  'id', 'name', 'cmdbStatus', 'assetType', 'affinityGroup', 'appApprModernDelivery', 'applicationTypeFinancial',
  'architect', 'assetIdInFAST', 'assetIdInSchedule', 'assetIdInWeeklyStatusReport', 'assetTier', 'blockFunding',
  'btoAlignment', 'businessOwnerCommsCheck', 'businessOwnerOwnedBy', 'businessOwnerSME', 'cashPaymentSystems',
  'cmdbBeingRetired', 'cmdbLegalHold', 'concatinatedBTOandDivision', 'connectorStatus', 'cotsOrInHouseBuilt',
  'customerFacing', 'defaultTier', 'description', 'disposition', 'externalFacing', 'financialImpact4hrOutage',
  'foundational', 'highLevelBTO', 'hosted', 'infoSecCritical', 'informationClassification', 'isSaas',
  'itOwnerCommsCheck', 'itOwnerManagedBy', 'keyChainOnboardingStatus', 'maintenanceWindow', 'mdAssetDesignation',
  'multiFactorAuthentication', 'nfr9', 'nfr10', 'nonDefaultTier1', 'nonDefaultTier2', 'nonDefaultTier3',
  'nonDefaultTier4', 'onboardingStatus', 'operationalHours', 'owningInternalOrg', 'ppiClassification',
  'privilegedAccess', 'sox', 'spof', 'sppi', 'status', 'supportSME', 'supportedBy', 'supportedByCommsCheck', 'version'
];

const DEFAULT_COLUMNS = ['id', 'name', 'cmdbStatus', 'assetType', 'btoAlignment', 'applicationTypeFinancial', 'itOwnerManagedBy', 'businessOwnerOwnedBy', 'connectorStatus', 'onboardingStatus', 'disposition', 'assetTier', 'foundational'];
const DEFAULT_CARD_FIELDS = ['id', 'cmdbStatus', 'assetType', 'hosted'];

const COLUMN_PRESETS = [
  { name: 'Default', columns: 'default' as const },
  { name: 'All Columns', columns: 'all' as const },
  { name: 'Status Overview', columns: ['id', 'name', 'cmdbStatus', 'connectorStatus', 'onboardingStatus', 'disposition'] },
];

export default function TPIPage() {
  const { toast } = useToast();
  const { isAdmin } = useUser();
  const { view, setView } = useViewToggle('table');
  
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/tpi');
        if (!response.ok) throw new Error('Failed to fetch');
        const assets = await response.json();
        setData(assets);
      } catch (error) {
        console.error('Error fetching TPI data:', error);
        toast({ title: "Error", description: "Failed to load TPI data", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState('all');
  const [openCombobox, setOpenCombobox] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
  const [columnSearchQuery, setColumnSearchQuery] = useState('');
  const [cardFieldVisibility, setCardFieldVisibility] = useState<Record<string, boolean>>({});
  
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [historyData, setHistoryData] = useState<Record<string, { history: any[], total: number }>>({});
  const [historyLoading, setHistoryLoading] = useState<Record<string, boolean>>({});
  const [historyPage, setHistoryPage] = useState<Record<string, number>>({});
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const HISTORY_PAGE_SIZE = 5;
  
  const fetchHistory = useCallback(async (assetId: string) => {
    if (historyData[assetId]) return;
    setHistoryLoading(prev => ({ ...prev, [assetId]: true }));
    try {
      const response = await fetch(`/api/tpi/history/${assetId}`);
      if (!response.ok) throw new Error('Failed to fetch history');
      const data = await response.json();
      setHistoryData(prev => ({ ...prev, [assetId]: data }));
      setHistoryPage(prev => ({ ...prev, [assetId]: 1 }));
    } catch (error) {
      console.error('Error fetching TPI history:', error);
      toast({ title: "Error", description: "Failed to load history", variant: "destructive" });
    } finally {
      setHistoryLoading(prev => ({ ...prev, [assetId]: false }));
    }
  }, [historyData, toast]);

  const toggleRow = useCallback((assetId: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(assetId)) {
        next.delete(assetId);
      } else {
        next.add(assetId);
        fetchHistory(assetId);
      }
      return next;
    });
  }, [fetchHistory]);

  const formatHistoryDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (date.getFullYear() === 9999) return 'Present';
    return format(date, 'MMM d, yyyy HH:mm');
  };

  const isCurrentRecord = (endDate: string) => {
    return new Date(endDate).getFullYear() === 9999;
  };

  useEffect(() => {
    const storageKey = `tpi-column-visibility-${isAdmin ? 'admin' : 'viewer'}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) { try { setColumnVisibility(JSON.parse(saved)); } catch { const v: Record<string, boolean> = {}; ALL_COLUMN_KEYS.forEach(k => { v[k] = DEFAULT_COLUMNS.includes(k); }); setColumnVisibility(v); } }
    else { const v: Record<string, boolean> = {}; ALL_COLUMN_KEYS.forEach(k => { v[k] = DEFAULT_COLUMNS.includes(k); }); setColumnVisibility(v); }
    const cardSaved = localStorage.getItem('tpi-card-field-visibility');
    if (cardSaved) { try { setCardFieldVisibility(JSON.parse(cardSaved)); } catch { const v: Record<string, boolean> = {}; DEFAULT_CARD_FIELDS.forEach(k => { v[k] = true; }); setCardFieldVisibility(v); } }
    else { const v: Record<string, boolean> = {}; DEFAULT_CARD_FIELDS.forEach(k => { v[k] = true; }); setCardFieldVisibility(v); }
  }, [isAdmin]);

  useEffect(() => { if (Object.keys(columnVisibility).length > 0) localStorage.setItem(`tpi-column-visibility-${isAdmin ? 'admin' : 'viewer'}`, JSON.stringify(columnVisibility)); }, [columnVisibility, isAdmin]);
  useEffect(() => { if (Object.keys(cardFieldVisibility).length > 0) localStorage.setItem('tpi-card-field-visibility', JSON.stringify(cardFieldVisibility)); }, [cardFieldVisibility]);

  const columns = useMemo(() => [
    { header: 'CI ID', accessorKey: 'id' },
    { header: 'Name', accessorKey: 'name', cell: (item: any) => <span className="font-semibold text-primary">{item.name}</span> },
    { header: 'CMDB Status', accessorKey: 'cmdbStatus' },
    { header: 'Asset Type', accessorKey: 'assetType' },
    { header: 'Affinity Group', accessorKey: 'affinityGroup' },
    { header: 'APP APPR MODERN DELIVERY', accessorKey: 'appApprModernDelivery' },
    { header: 'Application Type Financial', accessorKey: 'applicationTypeFinancial' },
    { header: 'Architect', accessorKey: 'architect' },
    { header: 'Asset ID in FAST?', accessorKey: 'assetIdInFAST' },
    { header: 'Asset ID in Schedule?', accessorKey: 'assetIdInSchedule' },
    { header: 'Asset ID in Weekly Status Report', accessorKey: 'assetIdInWeeklyStatusReport' },
    { header: 'Asset Tier', accessorKey: 'assetTier' },
    { header: 'Block Funding', accessorKey: 'blockFunding' },
    { header: 'BTO Alignment', accessorKey: 'btoAlignment' },
    { header: 'Business Owner Comms Check', accessorKey: 'businessOwnerCommsCheck' },
    { header: 'Business Owner Owned by', accessorKey: 'businessOwnerOwnedBy' },
    { header: 'Business Owner SME', accessorKey: 'businessOwnerSME' },
    { header: 'Cash Payment Systems', accessorKey: 'cashPaymentSystems' },
    { header: 'CMDB Being Retired', accessorKey: 'cmdbBeingRetired' },
    { header: 'CMDB Legal Hold', accessorKey: 'cmdbLegalHold' },
    { header: 'Concatinated BTO and Division', accessorKey: 'concatinatedBTOandDivision' },
    { header: 'Connector Status', accessorKey: 'connectorStatus' },
    { header: 'COTS or In House Built', accessorKey: 'cotsOrInHouseBuilt' },
    { header: 'Customer Facing', accessorKey: 'customerFacing' },
    { header: 'Default Tier', accessorKey: 'defaultTier' },
    { header: 'Description', accessorKey: 'description' },
    { header: 'Disposition', accessorKey: 'disposition' },
    { header: 'External Facing', accessorKey: 'externalFacing' },
    { header: 'Financial Impact 4hr Outage', accessorKey: 'financialImpact4hrOutage' },
    { header: 'Foundational', accessorKey: 'foundational' },
    { header: 'High-Level BTO', accessorKey: 'highLevelBTO' },
    { header: 'Hosted', accessorKey: 'hosted' },
    { header: 'InfoSec Critical', accessorKey: 'infoSecCritical' },
    { header: 'Information Classification', accessorKey: 'informationClassification' },
    { header: 'Is SAAS', accessorKey: 'isSaas' },
    { header: 'IT Owner Comms Check', accessorKey: 'itOwnerCommsCheck' },
    { header: 'IT Owner Managed by', accessorKey: 'itOwnerManagedBy' },
    { header: 'KeyChain Onboarding Status', accessorKey: 'keyChainOnboardingStatus' },
    { header: 'Maintenance Window', accessorKey: 'maintenanceWindow' },
    { header: 'MD Asset Designation', accessorKey: 'mdAssetDesignation' },
    { header: 'Multi Factor Authentication', accessorKey: 'multiFactorAuthentication' },
    { header: 'NFR 9', accessorKey: 'nfr9' },
    { header: 'NFR 10', accessorKey: 'nfr10' },
    { header: 'Non Default Tier 1', accessorKey: 'nonDefaultTier1' },
    { header: 'Non Default Tier 2', accessorKey: 'nonDefaultTier2' },
    { header: 'Non Default Tier 3', accessorKey: 'nonDefaultTier3' },
    { header: 'Non Default Tier 4', accessorKey: 'nonDefaultTier4' },
    { header: 'Onboarding Status', accessorKey: 'onboardingStatus' },
    { header: 'Operational Hours', accessorKey: 'operationalHours' },
    { header: 'Owning Internal Org', accessorKey: 'owningInternalOrg' },
    { header: 'PPI Classification', accessorKey: 'ppiClassification' },
    { header: 'Privileged Access', accessorKey: 'privilegedAccess' },
    { header: 'SOX', accessorKey: 'sox' },
    { header: 'SPOF', accessorKey: 'spof' },
    { header: 'SPPI', accessorKey: 'sppi' },
    { header: 'Status', accessorKey: 'status' },
    { header: 'Support SME', accessorKey: 'supportSME' },
    { header: 'Supported by', accessorKey: 'supportedBy' },
    { header: 'Supported By Comms Check', accessorKey: 'supportedByCommsCheck' },
    { header: 'Version', accessorKey: 'version' },
  ], []);

  const cardFields = [{ label: 'CI ID', key: 'id' }, { label: 'CMDB Status', key: 'cmdbStatus' }, { label: 'Asset Type', key: 'assetType' }, { label: 'Hosted', key: 'hosted' }];

  const searchFilteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((item: any) => {
      if (searchColumn === 'all') return columns.some(col => { const v = item[col.accessorKey]; return v && String(v).toLowerCase().includes(query); });
      const v = item[searchColumn]; return v && String(v).toLowerCase().includes(query);
    });
  }, [data, searchQuery, searchColumn, columns]);

  const { columnFilters, setColumnFilters, filteredData } = useColumnFilters(searchFilteredData);
  const { sortConfig, handleSort, sortedData } = useSorting(filteredData);
  const { currentPage, pageSize, setCurrentPage, setPageSize, paginatedData, totalPages, totalItems } = usePagination(sortedData);

  const visibleColumns = useMemo(() => columns.filter(col => columnVisibility[col.accessorKey] !== false), [columns, columnVisibility]);
  const visibleCardFields = useMemo(() => cardFields.filter(field => cardFieldVisibility[field.key]), [cardFieldVisibility]);
  const visibleColumnCount = Object.values(columnVisibility).filter(Boolean).length;

  const handleItemClick = (item: any) => { setSelectedItem(item); setIsDialogOpen(true); };

  const allUniqueValues = useMemo(() => {
    const result: Record<string, string[]> = {};
    columns.forEach(col => {
      const key = col.accessorKey;
      const values = Array.from(new Set(data.map((item: any) => String(item[key] || ''))));
      result[key] = values.sort();
    });
    return result;
  }, [data, columns]);

  const getUniqueValues = (key: string) => {
    return allUniqueValues[key] || [];
  };

  const handleFilterChange = (key: string, value: string, uniqueValues: string[]) => {
    const currentFilters = columnFilters[key];
    let newFilters: string[];
    if (currentFilters === undefined) {
      newFilters = uniqueValues.filter(v => v !== value);
    } else {
      if (currentFilters.includes(value)) {
        newFilters = currentFilters.filter(v => v !== value);
      } else {
        newFilters = [...currentFilters, value];
      }
    }
    const updatedFilters = { ...columnFilters };
    if (newFilters.length === uniqueValues.length) {
      delete updatedFilters[key];
    } else {
      updatedFilters[key] = newFilters;
    }
    setColumnFilters(updatedFilters);
  };

  const handleSelectAll = (key: string) => {
    const currentFilters = columnFilters[key];
    const updatedFilters = { ...columnFilters };
    if (currentFilters === undefined) {
      updatedFilters[key] = [];
    } else {
      delete updatedFilters[key];
    }
    setColumnFilters(updatedFilters);
  };

  const handleClearColumnFilter = (key: string) => {
    const updatedFilters = { ...columnFilters };
    delete updatedFilters[key];
    setColumnFilters(updatedFilters);
  };

  const applyColumnPreset = (preset: { name: string; columns: string[] | 'all' | 'default' }) => {
    let cols: string[];
    if (preset.columns === 'all') cols = ALL_COLUMN_KEYS;
    else if (preset.columns === 'default') cols = DEFAULT_COLUMNS;
    else cols = preset.columns;
    const v: Record<string, boolean> = {}; ALL_COLUMN_KEYS.forEach(k => { v[k] = cols.includes(k); }); setColumnVisibility(v);
  };

  const exportToExcel = () => {
    const exportData = sortedData.map((item: any) => { const row: Record<string, any> = {}; visibleColumns.forEach(col => { row[col.header] = item[col.accessorKey] ?? ''; }); return row; });
    const ws = XLSX.utils.json_to_sheet(exportData); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'TPI'); XLSX.writeFile(wb, `TPI_Export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast({ title: "Export Complete", description: `Exported ${exportData.length} records.`, variant: "success" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Technology Portfolio Insight (TPI)</h1>
            <p className="text-muted-foreground mt-1">Monitor integration status and detailed configuration attributes.</p>
          </div>
          <Button onClick={exportToExcel} className="gap-2 text-white" style={{ backgroundColor: '#89c24b' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7ab043'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#89c24b'}><Download className="h-4 w-4" />Export to Excel</Button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild><Button variant="outline" role="combobox" className="w-[140px] justify-between">{searchColumn === 'all' ? 'All Columns' : columns.find(c => c.accessorKey === searchColumn)?.header || searchColumn}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></PopoverTrigger>
              <PopoverContent className="w-[200px] p-0"><Command><CommandInput placeholder="Search column..." /><CommandList><CommandEmpty>No column found.</CommandEmpty><CommandGroup><CommandItem value="all" onSelect={() => { setSearchColumn('all'); setOpenCombobox(false); }}><Check className={cn("mr-2 h-4 w-4", searchColumn === 'all' ? "opacity-100" : "opacity-0")} />All Columns</CommandItem>{columns.map(col => (<CommandItem key={col.accessorKey} value={col.accessorKey} onSelect={() => { setSearchColumn(col.accessorKey); setOpenCombobox(false); }}><Check className={cn("mr-2 h-4 w-4", searchColumn === col.accessorKey ? "opacity-100" : "opacity-0")} />{col.header}</CommandItem>))}</CommandGroup></CommandList></Command></PopoverContent>
            </Popover>
            <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search across all fields..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" /></div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="outline" className="gap-2"><Settings2 className="h-4 w-4" />Columns<span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">{visibleColumnCount}/{ALL_COLUMN_KEYS.length}</span></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>Column Visibility</DropdownMenuLabel><DropdownMenuSeparator />
                <div className="p-2"><Input placeholder="Search columns..." value={columnSearchQuery} onChange={(e) => setColumnSearchQuery(e.target.value)} className="h-8" /></div><DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">Presets</DropdownMenuLabel>
                <div className="flex flex-wrap gap-1 p-2">{COLUMN_PRESETS.map(preset => (<Button key={preset.name} variant="outline" size="sm" className="h-6 text-xs" onClick={() => applyColumnPreset(preset)}>{preset.name}</Button>))}</div><DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">{columns.filter(col => col.header.toLowerCase().includes(columnSearchQuery.toLowerCase())).map(col => (<DropdownMenuCheckboxItem key={col.accessorKey} checked={columnVisibility[col.accessorKey] !== false} onCheckedChange={(checked) => setColumnVisibility(prev => ({ ...prev, [col.accessorKey]: checked }))}>{col.header}</DropdownMenuCheckboxItem>))}</ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
            <ViewToggle view={view} setView={setView} />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading assets...</p>
            </div>
          </div>
        ) : view === 'table' ? (
          <div className="rounded-md border border-border bg-card shadow-sm overflow-x-auto overflow-y-hidden">
            <table className="w-full caption-bottom text-sm">
              <thead className="bg-muted/50">
                <tr className="border-b border-border">
                  {visibleColumns.map((col, index) => {
                    const key = col.accessorKey;
                    const isFiltered = !!columnFilters[key];
                    const uniqueValues = getUniqueValues(key);
                    const currentFilterValues = columnFilters[key];
                    const isSelectAll = currentFilterValues === undefined;
                    const isSorted = sortConfig?.key === key;
                    const SortIcon = isSorted ? (sortConfig?.direction === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
                    
                    return (
                      <th key={key} className={cn("font-bold text-primary whitespace-nowrap border-r border-border px-4 py-3 h-auto select-none", index === 0 && "sticky left-0 z-30 bg-slate-200", index === visibleColumns.length - 1 && "border-r-0")}>
                        <div className="flex items-center justify-between gap-1.5">
                          <div 
                            className="flex items-center gap-1.5 rounded cursor-pointer hover:bg-black/5 -ml-1 pl-1 pr-1.5 py-0.5 transition-colors"
                            onClick={() => handleSort(key)}
                          >
                            {col.header}
                            <SortIcon className={cn("h-3.5 w-3.5", isSorted ? "opacity-100" : "opacity-30")} />
                          </div>
                          
                          <Popover>
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
                              <Command>
                                <CommandInput placeholder={`Filter ${col.header}...`} />
                                <CommandList>
                                  <CommandEmpty>No results found.</CommandEmpty>
                                  <CommandGroup>
                                    <CommandItem onSelect={() => handleSelectAll(key)} className="flex items-center gap-2 cursor-pointer font-medium border-b">
                                      <div className={cn("flex h-4 w-4 items-center justify-center rounded-sm border border-primary", isSelectAll ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                                        <Check className="h-3 w-3" />
                                      </div>
                                      <span>(Select All)</span>
                                    </CommandItem>
                                    <CommandItem onSelect={() => handleClearColumnFilter(key)} className="justify-center text-center font-medium text-destructive cursor-pointer my-1">
                                      Clear Filter
                                    </CommandItem>
                                  </CommandGroup>
                                  <CommandSeparator />
                                  <CommandGroup className="max-h-[200px] overflow-auto">
                                    {uniqueValues.map((val) => {
                                      const isSelected = !currentFilterValues || currentFilterValues.includes(val);
                                      return (
                                        <CommandItem key={val} onSelect={() => handleFilterChange(key, val, uniqueValues)} className="flex items-center gap-2 cursor-pointer">
                                          <div className={cn("flex h-4 w-4 items-center justify-center rounded-sm border border-primary", isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                                            <Check className="h-3 w-3" />
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
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {paginatedData.map((item: any, index: number) => {
                  const isExpanded = expandedRows.has(item.id);
                  const assetHistory = historyData[item.id];
                  const isLoadingHistory = historyLoading[item.id];
                  const currentHistoryPage = historyPage[item.id] || 1;
                  const totalHistoryPages = assetHistory ? Math.ceil(assetHistory.total / HISTORY_PAGE_SIZE) : 0;
                  const paginatedHistory = assetHistory?.history.slice((currentHistoryPage - 1) * HISTORY_PAGE_SIZE, currentHistoryPage * HISTORY_PAGE_SIZE) || [];
                  
                  return (
                    <React.Fragment key={`${item.id}-${index}`}>
                      <tr className="hover:bg-muted/30 transition-colors border-b border-border cursor-pointer">
                        {visibleColumns.map((col, colIndex) => (
                          <td key={col.accessorKey} className={cn("text-sm border-r border-border px-4 py-3 whitespace-nowrap", colIndex === 0 && "sticky left-0 z-20 bg-slate-100", colIndex === visibleColumns.length - 1 && "border-r-0")} onClick={() => handleItemClick(item)}>
                            {colIndex === 0 ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleRow(item.id); }}
                                  className="p-0.5 hover:bg-muted rounded transition-colors"
                                  aria-label={isExpanded ? "Collapse history" : "Expand history"}
                                >
                                  {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                                </button>
                                <span>{col.cell ? col.cell(item) : (item[col.accessorKey] ?? '—')}</span>
                              </div>
                            ) : (
                              col.cell ? col.cell(item) : (item[col.accessorKey] ?? '—')
                            )}
                          </td>
                        ))}
                      </tr>
                      {isExpanded && (
                        <>
                          {isLoadingHistory ? (
                            <tr className="bg-muted/5 border-b border-border">
                              <td colSpan={visibleColumns.length} className="px-4 py-3">
                                <div className="flex items-center justify-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">Loading history...</span>
                                </div>
                              </td>
                            </tr>
                          ) : paginatedHistory.length === 0 ? (
                            <tr className="bg-muted/5 border-b border-border">
                              <td colSpan={visibleColumns.length} className="px-4 py-3">
                                <div className="flex items-center justify-center gap-2">
                                  <History className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">No history available</span>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            <>
                              {paginatedHistory.map((historyItem: any) => (
                                <tr 
                                  key={`history-${historyItem.id}`}
                                  className="border-b border-border cursor-pointer hover:bg-muted/20 transition-colors bg-muted/5"
                                  onClick={() => { setSelectedHistoryItem(historyItem); setIsHistoryDialogOpen(true); }}
                                >
                                  {visibleColumns.map((col, colIndex) => (
                                    <td 
                                      key={col.accessorKey} 
                                      className={cn(
                                        "text-sm border-r border-border px-4 py-3 whitespace-nowrap text-muted-foreground",
                                        colIndex === 0 && "sticky left-0 z-20 bg-slate-50",
                                        colIndex === visibleColumns.length - 1 && "border-r-0"
                                      )}
                                    >
                                      {colIndex === 0 ? (
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-muted-foreground/60">└</span>
                                          <History className="h-3 w-3 text-muted-foreground/50" />
                                          {isCurrentRecord(historyItem.endDate) && (
                                            <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Current</Badge>
                                          )}
                                          <span className="text-xs text-muted-foreground/70">
                                            ({formatHistoryDate(historyItem.startDate)} → {formatHistoryDate(historyItem.endDate)})
                                          </span>
                                        </div>
                                      ) : (
                                        <span>{historyItem[col.accessorKey] ?? '—'}</span>
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                              {(totalHistoryPages > 1 || assetHistory) && (
                                <tr className="bg-muted/5 border-b border-border">
                                  <td colSpan={visibleColumns.length} className="px-4 py-2">
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs text-muted-foreground">
                                        {assetHistory?.total} history record{assetHistory?.total !== 1 ? 's' : ''}
                                        {totalHistoryPages > 1 && ` • Page ${currentHistoryPage} of ${totalHistoryPages}`}
                                      </span>
                                      {totalHistoryPages > 1 && (
                                        <div className="flex items-center gap-1">
                                          <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-6 px-2 text-xs" 
                                            disabled={currentHistoryPage === 1} 
                                            onClick={(e) => { e.stopPropagation(); setHistoryPage(prev => ({ ...prev, [item.id]: currentHistoryPage - 1 })); }}
                                          >
                                            Prev
                                          </Button>
                                          <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-6 px-2 text-xs" 
                                            disabled={currentHistoryPage === totalHistoryPages} 
                                            onClick={(e) => { e.stopPropagation(); setHistoryPage(prev => ({ ...prev, [item.id]: currentHistoryPage + 1 })); }}
                                          >
                                            Next
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{paginatedData.map((item: any, index: number) => (<DataCard key={`${item.id}-${index}`} item={item} titleKey="name" statusKey="cmdbStatus" fields={visibleCardFields as any} onClick={handleItemClick} />))}</div>
        )}

        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-full sm:max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
            <DialogHeader className="p-6 pb-4 border-b">
              <DialogTitle className="text-xl">{selectedItem?.name || 'Details'}</DialogTitle>
              <DialogDescription>{selectedItem?.id}</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 min-h-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 py-4">
                {selectedItem && columns.map(col => (
                  <div key={col.accessorKey} className="flex flex-col space-y-1 py-3 border-b border-border/50">
                    <span className="text-sm font-medium text-muted-foreground">{col.header}</span>
                    <span className="text-base font-semibold text-foreground">{String(selectedItem[col.accessorKey] ?? '—')}</span>
                  </div>
                ))}
                {selectedItem?.createdAt && (
                  <div className="flex flex-col space-y-1 py-3 border-b border-border/50">
                    <span className="text-sm font-medium text-muted-foreground">Created At</span>
                    <span className="text-base font-semibold text-foreground">{format(new Date(selectedItem.createdAt), 'MMM d, yyyy HH:mm')}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end p-6 pt-4 border-t"><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button></div>
          </DialogContent>
        </Dialog>

        <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
          <DialogContent className="w-full sm:max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
            <DialogHeader className="p-6 pb-4 border-b">
              <DialogTitle className="text-xl flex items-center gap-2">
                Historical Snapshot
                {selectedHistoryItem && isCurrentRecord(selectedHistoryItem.endDate) && (
                  <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Current</Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                {selectedHistoryItem && (
                  <>
                    {formatHistoryDate(selectedHistoryItem.startDate)} → {formatHistoryDate(selectedHistoryItem.endDate)}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 min-h-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 py-4">
                {selectedHistoryItem && (
                  <>
                    <div className="flex flex-col space-y-1 py-3 border-b border-border/50">
                      <span className="text-sm font-medium text-muted-foreground">Start Date</span>
                      <span className="text-base font-semibold text-foreground">{formatHistoryDate(selectedHistoryItem.startDate)}</span>
                    </div>
                    <div className="flex flex-col space-y-1 py-3 border-b border-border/50">
                      <span className="text-sm font-medium text-muted-foreground">End Date</span>
                      <span className="text-base font-semibold text-foreground">{formatHistoryDate(selectedHistoryItem.endDate)}</span>
                    </div>
                    <div className="flex flex-col space-y-1 py-3 border-b border-border/50">
                      <span className="text-sm font-medium text-muted-foreground">CI ID</span>
                      <span className="text-base font-semibold text-foreground">{String(selectedHistoryItem.tpiAssetId ?? '—')}</span>
                    </div>
                    {columns.filter(col => col.accessorKey !== 'id').map(col => (
                      <div key={col.accessorKey} className="flex flex-col space-y-1 py-3 border-b border-border/50">
                        <span className="text-sm font-medium text-muted-foreground">{col.header}</span>
                        <span className="text-base font-semibold text-foreground">{String(selectedHistoryItem[col.accessorKey] ?? '—')}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
            <div className="flex justify-end p-6 pt-4 border-t"><Button variant="outline" onClick={() => setIsHistoryDialogOpen(false)}>Close</Button></div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
