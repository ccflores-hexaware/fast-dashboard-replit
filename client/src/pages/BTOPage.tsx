import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ViewToggle } from '@/components/ViewToggle';
import { DataTable } from '@/components/DataTable';
import { DataCard } from '@/components/DataCard';
import { Pagination } from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Download, Search, Check, ChevronsUpDown, Settings2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/lib/userContext";
import * as XLSX from 'xlsx';
import { usePagination, useSorting, useColumnFilters, useViewToggle } from '@/hooks';

const ALL_COLUMN_KEYS = ['id', 'higherLevelBTO', 'bto', 'division', 'concatValue', 'owner', 'deadline', 'status', 'progress'];
const DEFAULT_COLUMNS = ['id', 'higherLevelBTO', 'bto', 'division', 'owner', 'deadline', 'status', 'progress'];
const DEFAULT_CARD_FIELDS = ['id', 'higherLevelBTO', 'division', 'owner', 'status', 'progress'];

const COLUMN_PRESETS = [
  { name: 'Default', columns: 'default' as const },
  { name: 'All Columns', columns: 'all' as const },
];

export default function BTOPage() {
  const { toast } = useToast();
  const { isAdmin } = useUser();
  const { view, setView } = useViewToggle('table');
  
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/bto');
        if (!response.ok) throw new Error('Failed to fetch');
        const assets = await response.json();
        setData(assets);
      } catch (error) {
        console.error('Error fetching BTO data:', error);
        toast({ title: "Error", description: "Failed to load BTO data", variant: "destructive" });
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

  useEffect(() => {
    const storageKey = `bto-column-visibility-${isAdmin ? 'admin' : 'viewer'}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) { try { setColumnVisibility(JSON.parse(saved)); } catch { const v: Record<string, boolean> = {}; ALL_COLUMN_KEYS.forEach(k => { v[k] = DEFAULT_COLUMNS.includes(k); }); setColumnVisibility(v); } }
    else { const v: Record<string, boolean> = {}; ALL_COLUMN_KEYS.forEach(k => { v[k] = DEFAULT_COLUMNS.includes(k); }); setColumnVisibility(v); }
    const cardSaved = localStorage.getItem('bto-card-field-visibility');
    if (cardSaved) { try { setCardFieldVisibility(JSON.parse(cardSaved)); } catch { const v: Record<string, boolean> = {}; DEFAULT_CARD_FIELDS.forEach(k => { v[k] = true; }); setCardFieldVisibility(v); } }
    else { const v: Record<string, boolean> = {}; DEFAULT_CARD_FIELDS.forEach(k => { v[k] = true; }); setCardFieldVisibility(v); }
  }, [isAdmin]);

  useEffect(() => { if (Object.keys(columnVisibility).length > 0) localStorage.setItem(`bto-column-visibility-${isAdmin ? 'admin' : 'viewer'}`, JSON.stringify(columnVisibility)); }, [columnVisibility, isAdmin]);
  useEffect(() => { if (Object.keys(cardFieldVisibility).length > 0) localStorage.setItem('bto-card-field-visibility', JSON.stringify(cardFieldVisibility)); }, [cardFieldVisibility]);

  const columns = useMemo(() => [
    { header: 'ID', accessorKey: 'id' },
    { header: 'Higher Level BTO', accessorKey: 'higherLevelBTO', cell: (item: any) => <span className="font-semibold text-primary">{item.higherLevelBTO}</span> },
    { header: 'BTO', accessorKey: 'bto' },
    { header: 'Division', accessorKey: 'division' },
    { header: 'Concat Value', accessorKey: 'concatValue' },
    { header: 'Owner', accessorKey: 'owner' },
    { header: 'Deadline', accessorKey: 'deadline' },
    { header: 'Status', accessorKey: 'status' },
    { header: 'Progress', accessorKey: 'progress', cell: (item: any) => <span>{item.progress}%</span> },
  ], []);

  const cardFields = [{ label: 'ID', key: 'id' }, { label: 'Higher Level BTO', key: 'higherLevelBTO' }, { label: 'Division', key: 'division' }, { label: 'Owner', key: 'owner' }, { label: 'Status', key: 'status' }, { label: 'Progress', key: 'progress' }];

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

  const applyColumnPreset = (preset: { name: string; columns: string[] | 'all' | 'default' }) => {
    let cols: string[];
    if (preset.columns === 'all') cols = ALL_COLUMN_KEYS;
    else if (preset.columns === 'default') cols = DEFAULT_COLUMNS;
    else cols = preset.columns;
    const v: Record<string, boolean> = {}; ALL_COLUMN_KEYS.forEach(k => { v[k] = cols.includes(k); }); setColumnVisibility(v);
  };

  const exportToExcel = () => {
    const exportData = sortedData.map((item: any) => { const row: Record<string, any> = {}; visibleColumns.forEach(col => { row[col.header] = item[col.accessorKey] ?? ''; }); return row; });
    const ws = XLSX.utils.json_to_sheet(exportData); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'BTO'); XLSX.writeFile(wb, `BTO_Export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast({ title: "Export Complete", description: `Exported ${exportData.length} records.` });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Business Technology Office (BTO)</h1>
            <p className="text-muted-foreground mt-1">Align technology initiatives with business goals and organizational divisions.</p>
          </div>
          <Button variant="outline" onClick={exportToExcel} className="gap-2"><Download className="h-4 w-4" />Export to Excel</Button>
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

        {view === 'table' ? (<DataTable data={paginatedData} columns={visibleColumns} onSort={handleSort} sortConfig={sortConfig} columnFilters={columnFilters} onColumnFiltersChange={(filters: Record<string, string[]>) => setColumnFilters(filters)} allData={sortedData} />) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{paginatedData.map((item: any, index: number) => (<DataCard key={`${item.id}-${index}`} item={item} titleKey="bto" fields={visibleCardFields as any} onClick={handleItemClick} />))}</div>
        )}

        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="pb-4 border-b"><DialogTitle className="text-xl">{selectedItem?.bto || 'Details'}</DialogTitle><DialogDescription>{selectedItem?.higherLevelBTO}</DialogDescription></DialogHeader>
            <ScrollArea className="flex-1 pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                {selectedItem && Object.entries(selectedItem).map(([key, value]) => { const column = columns.find(c => c.accessorKey === key); return (<div key={key} className="space-y-1"><Label className="text-sm text-muted-foreground">{column?.header || key}</Label><p className="text-sm font-medium">{String(value || '-')}</p></div>); })}
              </div>
            </ScrollArea>
            <div className="flex justify-end pt-4 border-t"><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button></div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
