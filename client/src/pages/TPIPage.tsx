import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ViewToggle } from '@/components/ViewToggle';
import { DataTable } from '@/components/DataTable';
import { DataCard } from '@/components/DataCard';
import { Pagination } from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Download, Search, Check, ChevronsUpDown, Settings2, Loader2, ChevronDown, ChevronRight, History } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
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
  'customerFacing', 'default', 'description', 'disposition', 'externalFacing', 'financialImpact4hrOutage',
  'foundational', 'highLevelBTO', 'hosted', 'infoSecCritical', 'informationClassification', 'isSaas',
  'itOwnerCommsCheck', 'itOwnerManagedBy', 'keyChainOnboardingStatus', 'maintenanceWindow', 'mdAssetDesignation',
  'multiFactorAuthentication', 'nfr9', 'nfr10', 'nonDefaultTier1', 'nonDefaultTier2', 'nonDefaultTier3',
  'nonDefaultTier4', 'onboardingStatus', 'operationalHours', 'owningInternalOrg', 'ppiClassification',
  'privilegedAccess', 'sox', 'spof', 'sppi', 'supportSME', 'supportedBy', 'supportedByCommsCheck', 'version'
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
    { header: 'Default', accessorKey: 'default' },
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
  const historyVisibleColumns = useMemo(() => visibleColumns.filter(col => col.accessorKey !== 'version' && col.accessorKey !== 'id'), [visibleColumns]);
  const visibleCardFields = useMemo(() => cardFields.filter(field => cardFieldVisibility[field.key]), [cardFieldVisibility]);
  const visibleColumnCount = Object.values(columnVisibility).filter(Boolean).length;

  const handleItemClick = (item: any) => { setSelectedItem(item); setIsDialogOpen(true); };

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
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="w-10 px-2 py-3"></th>
                  {visibleColumns.map(col => (
                    <th key={col.accessorKey} className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:bg-muted/80" onClick={() => handleSort(col.accessorKey)}>
                      <div className="flex items-center gap-1">
                        {col.header}
                        {sortConfig?.key === col.accessorKey && (
                          <span className="text-xs">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item: any, index: number) => {
                  const isExpanded = expandedRows.has(item.id);
                  const assetHistory = historyData[item.id];
                  const isLoadingHistory = historyLoading[item.id];
                  const currentHistoryPage = historyPage[item.id] || 1;
                  const totalHistoryPages = assetHistory ? Math.ceil(assetHistory.total / HISTORY_PAGE_SIZE) : 0;
                  const paginatedHistory = assetHistory?.history.slice((currentHistoryPage - 1) * HISTORY_PAGE_SIZE, currentHistoryPage * HISTORY_PAGE_SIZE) || [];
                  
                  return (
                    <React.Fragment key={`${item.id}-${index}`}>
                      <tr className={cn("border-t hover:bg-muted/30 cursor-pointer", index % 2 === 0 ? "bg-background" : "bg-muted/10")}>
                        <td className="px-2 py-3">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); toggleRow(item.id); }}>
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </Button>
                        </td>
                        {visibleColumns.map(col => (
                          <td key={col.accessorKey} className="px-4 py-3 text-sm" onClick={() => handleItemClick(item)}>
                            {col.cell ? col.cell(item) : (item[col.accessorKey] ?? '—')}
                          </td>
                        ))}
                      </tr>
                      {isExpanded && (
                        <tr className="bg-muted/20">
                          <td colSpan={visibleColumns.length + 1} className="px-4 py-4">
                            <div className="border rounded-lg bg-background p-4">
                              <div className="flex items-center gap-2 mb-4">
                                <History className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold text-sm">History</span>
                                {assetHistory && <Badge variant="secondary" className="text-xs">{assetHistory.total} records</Badge>}
                              </div>
                              
                              {isLoadingHistory ? (
                                <div className="flex items-center justify-center py-4">
                                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                </div>
                              ) : paginatedHistory.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No history available</p>
                              ) : (
                                <>
                                  <div className="border rounded-md overflow-auto">
                                    <table className="w-full text-sm">
                                      <thead className="bg-muted/50">
                                        <tr>
                                          {historyVisibleColumns.map((col, colIndex) => (
                                            <th key={col.accessorKey} className="px-3 py-2 text-left font-medium whitespace-nowrap">
                                              {colIndex === 0 ? (
                                                <div className="flex items-center gap-2">
                                                  {col.header}
                                                </div>
                                              ) : col.header}
                                            </th>
                                          ))}
                                          <th className="px-3 py-2 text-left font-medium whitespace-nowrap">Start Date</th>
                                          <th className="px-3 py-2 text-left font-medium whitespace-nowrap">End Date</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {paginatedHistory.map((historyItem: any, hIndex: number) => (
                                          <tr 
                                            key={historyItem.id} 
                                            className={cn("border-t cursor-pointer hover:bg-muted/40", hIndex % 2 === 0 ? "bg-background" : "bg-muted/10")}
                                            onClick={() => { setSelectedHistoryItem(historyItem); setIsHistoryDialogOpen(true); }}
                                          >
                                            {historyVisibleColumns.map((col, colIndex) => (
                                              <td key={col.accessorKey} className="px-3 py-2 whitespace-nowrap">
                                                {colIndex === 0 ? (
                                                  <div className="flex items-center gap-2">
                                                    <span>{historyItem[col.accessorKey] ?? '—'}</span>
                                                    {isCurrentRecord(historyItem.endDate) && (
                                                      <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Current</Badge>
                                                    )}
                                                  </div>
                                                ) : (
                                                  <span>{historyItem[col.accessorKey] ?? '—'}</span>
                                                )}
                                              </td>
                                            ))}
                                            <td className="px-3 py-2 whitespace-nowrap">{formatHistoryDate(historyItem.startDate)}</td>
                                            <td className="px-3 py-2 whitespace-nowrap">{formatHistoryDate(historyItem.endDate)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                  
                                  {totalHistoryPages > 1 && (
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                                      <span className="text-xs text-muted-foreground">
                                        Page {currentHistoryPage} of {totalHistoryPages} ({assetHistory?.total} total)
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" className="h-7" disabled={currentHistoryPage === 1} onClick={() => setHistoryPage(prev => ({ ...prev, [item.id]: currentHistoryPage - 1 }))}>
                                          Prev
                                        </Button>
                                        <Button variant="outline" size="sm" className="h-7" disabled={currentHistoryPage === totalHistoryPages} onClick={() => setHistoryPage(prev => ({ ...prev, [item.id]: currentHistoryPage + 1 }))}>
                                          Next
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="pb-4 border-b"><DialogTitle className="text-xl">{selectedItem?.name || 'Details'}</DialogTitle><DialogDescription>{selectedItem?.id}</DialogDescription></DialogHeader>
            <ScrollArea className="flex-1 pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                {selectedItem && Object.entries(selectedItem).map(([key, value]) => { const column = columns.find(c => c.accessorKey === key); return (<div key={key} className="space-y-1"><Label className="text-sm text-muted-foreground">{column?.header || key}</Label><p className="text-sm font-medium">{String(value || '-')}</p></div>); })}
              </div>
            </ScrollArea>
            <div className="flex justify-end pt-4 border-t"><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button></div>
          </DialogContent>
        </Dialog>

        <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="pb-4 border-b">
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
            <ScrollArea className="flex-1 pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                {selectedHistoryItem && Object.entries(selectedHistoryItem)
                  .filter(([key]) => !['id', 'tpiAssetId', 'startDate', 'endDate', 'version'].includes(key))
                  .map(([key, value]) => {
                    const column = columns.find(c => c.accessorKey === key);
                    const label = column?.header || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    return (
                      <div key={key} className="space-y-1">
                        <Label className="text-sm text-muted-foreground">{label}</Label>
                        <p className="text-sm font-medium">{String(value || '—')}</p>
                      </div>
                    );
                  })}
              </div>
            </ScrollArea>
            <div className="flex justify-end pt-4 border-t"><Button variant="outline" onClick={() => setIsHistoryDialogOpen(false)}>Close</Button></div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
