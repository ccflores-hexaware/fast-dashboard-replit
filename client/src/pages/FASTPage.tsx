import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ViewToggle } from '@/components/ViewToggle';
import { DataTable, StatusBadge } from '@/components/DataTable';
import { DataCard } from '@/components/DataCard';
import { Pagination } from '@/components/Pagination';
import { mockFAST } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Plus, Save, X, Pencil, Search, Check, ChevronsUpDown, Calendar as CalendarIcon, Copy, AlertTriangle, ArrowRight, Settings2, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
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
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parse, isValid, subDays, startOfMonth, endOfMonth, subMonths, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/lib/userContext";
import * as XLSX from 'xlsx';
import { usePagination, useSorting, useColumnFilters, useViewToggle } from '@/hooks';

const ALL_COLUMN_KEYS = [
  'id', 'name', 'version', 'kalmAssignee', 'onboardingStatus', 'onboardingDisposition', 'airDisposition', 
  'maintenanceDisposition', 'lastConnectorDeliveryDate', 'maintenanceSLAExpiration', 'technology', 'cmdbStatus', 
  'cmdbBeingRetired', 'cmdbLegalHold', 'ticketsOpened', 'assetType', 'yearOnboarded', 'monthOnboarded', 
  'assetPOCs', 'onboardingSchedule', 'entitlementsMissing', 'membersMissing', 'cisMissing', 'reliesOnCAFederation',
  'connectorPattern', 'automationTeam', 'nameOfConnector', 'connectorStatus', 'enrollmentStatus', 'evidenceStatus',
  'miSchedule', 'miLastAIRUpload', 'miDaysSince', 'miDueDate', 'miOnboardingChangeDate', 'miL2Assignee', 'miStatus',
  'attestationKickedOff', 'attestationComplete', 'aiLastCandAAttestation', 'keychainAttestationKickoffDate',
  'aiDaysSince', 'aiAttestationDueDate', 'aiOnboardingChangeDate', 'aiL2Assignee', 'aiStatus', 'theGap', 
  'comments', 'lastModifiedBy', 'lastModifiedDate'
];

const ADMIN_DEFAULT_COLUMNS = [
  'id', 'name', 'version', 'kalmAssignee', 'onboardingStatus', 'onboardingDisposition',
  'airDisposition', 'maintenanceDisposition', 'cmdbStatus', 'assetType', 'technology',
  'connectorStatus', 'enrollmentStatus', 'evidenceStatus', 'lastModifiedBy', 'lastModifiedDate'
];

const VIEWER_DEFAULT_COLUMNS = [
  'id', 'name', 'version', 'assetType', 'technology', 'onboardingStatus', 'cmdbStatus',
  'maintenanceDisposition', 'airDisposition'
];

const DEFAULT_CARD_FIELDS = ['id', 'assetType', 'technology', 'onboardingStatus', 'maintenanceDisposition', 'connectorStatus', 'cmdbStatus'];

const COLUMN_PRESETS = [
  { name: 'Default', columns: 'default' as const },
  { name: 'All Columns', columns: 'all' as const },
  { name: 'Onboarding Focus', columns: ['id', 'name', 'onboardingStatus', 'onboardingDisposition', 'kalmAssignee', 'yearOnboarded', 'monthOnboarded', 'onboardingSchedule'] },
  { name: 'Maintenance Focus', columns: ['id', 'name', 'maintenanceDisposition', 'maintenanceSLAExpiration', 'miStatus', 'miSchedule', 'miL2Assignee', 'miDueDate'] },
  { name: 'Attestation Focus', columns: ['id', 'name', 'attestationKickedOff', 'attestationComplete', 'aiStatus', 'aiL2Assignee', 'aiAttestationDueDate', 'aiLastCandAAttestation'] },
  { name: 'Connector Focus', columns: ['id', 'name', 'connectorStatus', 'connectorPattern', 'nameOfConnector', 'automationTeam', 'reliesOnCAFederation'] },
];

const ENUM_FIELDS: Record<string, string[]> = {
  onboardingStatus: ['Not Started', 'Pending', 'In Progress', 'Blocked', 'Onboarded'],
  onboardingDisposition: ['N/A', 'Pending Review', 'Approved', 'Rejected', 'Waived'],
  airDisposition: ['N/A', 'Pending Review', 'Approved', 'Rejected', 'Waived'],
  maintenanceDisposition: ['N/A', 'Pending Review', 'Approved', 'Rejected', 'Waived'],
  cmdbStatus: ['Active', 'Retired', 'Provisioning', 'Maintenance', 'Decommissioned'],
  connectorStatus: ['Not Started', 'In Development', 'Testing', 'Deployed', 'Failed'],
  enrollmentStatus: ['Not Enrolled', 'Pending', 'Enrolled', 'Suspended'],
  evidenceStatus: ['Not Submitted', 'Pending Review', 'Approved', 'Rejected'],
  miStatus: ['Not Started', 'In Progress', 'Complete', 'Overdue'],
  aiStatus: ['Not Started', 'In Progress', 'Complete', 'Overdue'],
  assetType: ['Application', 'Service', 'Platform', 'API', 'Infrastructure'],
  technology: ['Java', '.NET', 'Python', 'Node.js', 'React', 'Angular', 'Legacy'],
};

const MAX_CARD_FIELDS = 7;

export default function FASTPage() {
  const { toast } = useToast();
  const { isAdmin, user } = useUser();
  const { view, setView } = useViewToggle('table');
  
  const [data, setData] = useState<any[]>(mockFAST);
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
  const [cardFieldSearchQuery, setCardFieldSearchQuery] = useState('');
  const [dateFieldErrors, setDateFieldErrors] = useState<Record<string, string | null>>({});
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versionDateRange, setVersionDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [versionDatePreset, setVersionDatePreset] = useState<string>('all');
  const [isVersionDateOpen, setIsVersionDateOpen] = useState(false);
  const [isDuplicateConfirmOpen, setIsDuplicateConfirmOpen] = useState(false);
  const [isFakeAssetConfirmOpen, setIsFakeAssetConfirmOpen] = useState(false);
  
  const defaultVisibleColumns = isAdmin ? ADMIN_DEFAULT_COLUMNS : VIEWER_DEFAULT_COLUMNS;

  useEffect(() => {
    const storageKey = `fast-column-visibility-${isAdmin ? 'admin' : 'viewer'}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setColumnVisibility(JSON.parse(saved));
      } catch {
        const visibility: Record<string, boolean> = {};
        ALL_COLUMN_KEYS.forEach(key => {
          visibility[key] = defaultVisibleColumns.includes(key);
        });
        setColumnVisibility(visibility);
      }
    } else {
      const visibility: Record<string, boolean> = {};
      ALL_COLUMN_KEYS.forEach(key => {
        visibility[key] = defaultVisibleColumns.includes(key);
      });
      setColumnVisibility(visibility);
    }

    const cardStorageKey = 'fast-card-field-visibility';
    const savedCard = localStorage.getItem(cardStorageKey);
    if (savedCard) {
      try {
        setCardFieldVisibility(JSON.parse(savedCard));
      } catch {
        const visibility: Record<string, boolean> = {};
        DEFAULT_CARD_FIELDS.forEach(key => {
          visibility[key] = true;
        });
        setCardFieldVisibility(visibility);
      }
    } else {
      const visibility: Record<string, boolean> = {};
      DEFAULT_CARD_FIELDS.forEach(key => {
        visibility[key] = true;
      });
      setCardFieldVisibility(visibility);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (Object.keys(columnVisibility).length > 0) {
      const storageKey = `fast-column-visibility-${isAdmin ? 'admin' : 'viewer'}`;
      localStorage.setItem(storageKey, JSON.stringify(columnVisibility));
    }
  }, [columnVisibility, isAdmin]);

  useEffect(() => {
    if (Object.keys(cardFieldVisibility).length > 0) {
      localStorage.setItem('fast-card-field-visibility', JSON.stringify(cardFieldVisibility));
    }
  }, [cardFieldVisibility]);

  const baseData = useMemo(() => {
    if (showVersionHistory) {
      return data;
    }
    return data.filter((item: any) => item.isLatestVersion !== false);
  }, [data, showVersionHistory]);

  const dateFilteredData = useMemo(() => {
    if (!showVersionHistory || !versionDateRange.from || !versionDateRange.to) {
      return baseData;
    }
    return baseData.filter((item: any) => {
      if (!item.lastModifiedDate) return true;
      try {
        const itemDate = parse(item.lastModifiedDate, 'MMM d, yyyy HH:mm', new Date());
        if (!isValid(itemDate)) return true;
        return isWithinInterval(itemDate, {
          start: startOfDay(versionDateRange.from!),
          end: endOfDay(versionDateRange.to!)
        });
      } catch {
        return true;
      }
    });
  }, [baseData, showVersionHistory, versionDateRange]);

  const columns = useMemo(() => [
    { 
      header: 'Asset ID', 
      accessorKey: 'id',
      cell: (item: any) => (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (isAdmin && item.isLatestVersion) {
              handleEditClick(item);
            } else {
              handleItemClick(item);
            }
          }}
          className="text-primary hover:underline font-bold underline decoration-2 underline-offset-2 hover:text-primary/80 transition-colors"
        >
          {item.id}
        </button>
      )
    },
    { header: 'Name', accessorKey: 'name', cell: (item: any) => <span className="font-semibold text-primary">{item.name}</span> },
    { header: 'Version', accessorKey: 'version', cell: (item: any) => (
      <div className="flex items-center gap-2">
        <span>v{item.version || 1}</span>
        {item.isLatestVersion && (
          <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">Latest</span>
        )}
      </div>
    )},
    { header: 'KALM Assignee', accessorKey: 'kalmAssignee' },
    { header: 'Onboarding Status', accessorKey: 'onboardingStatus' },
    { header: 'Onboarding Disposition', accessorKey: 'onboardingDisposition' },
    { header: 'AIR Disposition', accessorKey: 'airDisposition' },
    { header: 'Maintenance Disposition', accessorKey: 'maintenanceDisposition' },
    { header: 'Last Connector Delivery Date', accessorKey: 'lastConnectorDeliveryDate' },
    { header: 'Maintenance SLA Expiration', accessorKey: 'maintenanceSLAExpiration' },
    { header: 'Technology', accessorKey: 'technology' },
    { header: 'CMDB Status', accessorKey: 'cmdbStatus' },
    { header: 'CMDB Being Retired', accessorKey: 'cmdbBeingRetired' },
    { header: 'CMDB Legal Hold', accessorKey: 'cmdbLegalHold' },
    { header: 'Tickets Opened', accessorKey: 'ticketsOpened' },
    { header: 'Asset Type', accessorKey: 'assetType' },
    { header: 'Year Onboarded', accessorKey: 'yearOnboarded' },
    { header: 'Month Onboarded', accessorKey: 'monthOnboarded' },
    { header: 'Asset POCs', accessorKey: 'assetPOCs' },
    { header: 'Onboarding Schedule', accessorKey: 'onboardingSchedule' },
    { header: 'Entitlements Missing', accessorKey: 'entitlementsMissing' },
    { header: 'Members Missing', accessorKey: 'membersMissing' },
    { header: 'CIs Missing', accessorKey: 'cisMissing' },
    { header: 'Relies on CA Federation', accessorKey: 'reliesOnCAFederation' },
    { header: 'Connector Pattern', accessorKey: 'connectorPattern' },
    { header: 'Automation Team', accessorKey: 'automationTeam' },
    { header: 'Name of Connector', accessorKey: 'nameOfConnector' },
    { header: 'Connector Status', accessorKey: 'connectorStatus' },
    { header: 'Enrollment Status', accessorKey: 'enrollmentStatus' },
    { header: 'Evidence Status', accessorKey: 'evidenceStatus' },
    { header: 'MI Schedule', accessorKey: 'miSchedule' },
    { header: 'MI Last AIR Upload', accessorKey: 'miLastAIRUpload' },
    { header: 'MI Days Since', accessorKey: 'miDaysSince' },
    { header: 'MI Due Date', accessorKey: 'miDueDate' },
    { header: 'MI Onboarding Change Date', accessorKey: 'miOnboardingChangeDate' },
    { header: 'MI L2 Assignee', accessorKey: 'miL2Assignee' },
    { header: 'MI Status', accessorKey: 'miStatus' },
    { header: 'Attestation Kicked Off', accessorKey: 'attestationKickedOff' },
    { header: 'Attestation Complete', accessorKey: 'attestationComplete' },
    { header: 'AI Last C&A Attestation', accessorKey: 'aiLastCandAAttestation' },
    { header: 'Keychain Attestation Kickoff Date', accessorKey: 'keychainAttestationKickoffDate' },
    { header: 'AI Days Since', accessorKey: 'aiDaysSince' },
    { header: 'AI Attestation Due Date', accessorKey: 'aiAttestationDueDate' },
    { header: 'AI Onboarding Change Date', accessorKey: 'aiOnboardingChangeDate' },
    { header: 'AI L2 Assignee', accessorKey: 'aiL2Assignee' },
    { header: 'AI Status', accessorKey: 'aiStatus' },
    { header: 'The Gap', accessorKey: 'theGap' },
    { header: 'Comments', accessorKey: 'comments' },
    { header: 'Last Modified By', accessorKey: 'lastModifiedBy' },
    { header: 'Last Modified Date', accessorKey: 'lastModifiedDate' },
  ], [isAdmin]);

  const cardFields = [
    { label: 'Asset ID', key: 'id' },
    { label: 'Asset Type', key: 'assetType' },
    { label: 'Technology', key: 'technology' },
    { label: 'Onboarding Status', key: 'onboardingStatus' },
    { label: 'Maintenance Disposition', key: 'maintenanceDisposition' },
    { label: 'Connector Status', key: 'connectorStatus' },
    { label: 'CMDB Status', key: 'cmdbStatus' },
    { label: 'KALM Assignee', key: 'kalmAssignee' },
    { label: 'Year Onboarded', key: 'yearOnboarded' },
  ];

  const searchFilteredData = useMemo(() => {
    if (!searchQuery.trim()) return dateFilteredData;
    const query = searchQuery.toLowerCase();
    return dateFilteredData.filter((item: any) => {
      if (searchColumn === 'all') {
        return columns.some(col => {
          const value = item[col.accessorKey];
          return value && String(value).toLowerCase().includes(query);
        });
      }
      const value = item[searchColumn];
      return value && String(value).toLowerCase().includes(query);
    });
  }, [dateFilteredData, searchQuery, searchColumn, columns]);

  const { columnFilters, setColumnFilters, filteredData } = useColumnFilters(searchFilteredData);
  const { sortConfig, handleSort, sortedData } = useSorting(filteredData);

  // When FAST History is enabled, group by asset ID for pagination at asset level
  const groupedAssetData = useMemo(() => {
    if (!showVersionHistory) {
      return { assets: sortedData, versionMap: new Map() };
    }
    // Group all versions by asset ID, keep only latest version as the display row
    const versionMap = new Map<string, any[]>();
    const latestVersions: any[] = [];
    
    sortedData.forEach((item: any) => {
      const assetId = item.id;
      if (!versionMap.has(assetId)) {
        versionMap.set(assetId, []);
      }
      versionMap.get(assetId)!.push(item);
    });
    
    // For each asset, find the latest version to display as the main row
    versionMap.forEach((versions, assetId) => {
      // Sort versions by version number descending
      versions.sort((a, b) => (b.version || 1) - (a.version || 1));
      // Add version count to the latest version for display
      const latestVersion = versions.find(v => v.isLatestVersion) || versions[0];
      latestVersions.push({ ...latestVersion, _versionCount: versions.length, _allVersions: versions });
    });
    
    return { assets: latestVersions, versionMap };
  }, [sortedData, showVersionHistory]);

  // Use asset-level data for pagination when showing version history
  const dataForPagination = showVersionHistory ? groupedAssetData.assets : sortedData;
  const { currentPage, pageSize, setCurrentPage, setPageSize, paginatedData, totalPages, totalItems } = usePagination(dataForPagination);

  // When showing version history, expand paginated data to include all versions for each asset
  // This is needed for DataTable's expandable version accordion to work
  const tableData = useMemo(() => {
    if (!showVersionHistory) {
      return paginatedData;
    }
    // For each paginated asset, include all its versions
    const expandedData: any[] = [];
    paginatedData.forEach((asset: any) => {
      const allVersions = asset._allVersions || [asset];
      allVersions.forEach((version: any) => expandedData.push(version));
    });
    return expandedData;
  }, [paginatedData, showVersionHistory]);

  const visibleColumns = useMemo(() => {
    return columns.filter(col => columnVisibility[col.accessorKey] !== false);
  }, [columns, columnVisibility]);

  const visibleCardFields = useMemo(() => {
    return cardFields.filter(field => cardFieldVisibility[field.key]);
  }, [cardFieldVisibility]);

  const visibleColumnCount = Object.values(columnVisibility).filter(Boolean).length;
  const totalColumnCount = ALL_COLUMN_KEYS.length;

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEditClick = (item?: any) => {
    const itemToEdit = item || selectedItem;
    if (itemToEdit) {
      if (!itemToEdit.isLatestVersion) {
        toast({
          title: "Cannot Edit Historical Version",
          description: "Only the latest version of an asset can be edited.",
          variant: "destructive"
        });
        return;
      }
      setEditFormData({ ...itemToEdit });
      setSelectedItem(itemToEdit);
      setIsEditing(true);
      setAssetIdError(null);
      setAssetIdAvailable(false);
      setIsDialogOpen(true);
    }
  };

  const handleAddNew = () => {
    const newId = `FAST-${String(data.filter(f => f.isLatestVersion).length + 1).padStart(4, '0')}`;
    const newItem: any = {
      id: newId,
      name: '',
      version: 1,
      isLatestVersion: true,
      isFakeAsset: false,
      kalmAssignee: '',
      onboardingStatus: 'Not Started',
      onboardingDisposition: 'N/A',
      airDisposition: 'N/A',
      maintenanceDisposition: 'N/A',
      cmdbStatus: 'Active',
      assetType: '',
      technology: '',
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

  const handleCancelEdit = () => {
    setIsEditing(false);
    setIsDialogOpen(false);
    setEditFormData({});
    setAssetIdError(null);
    setAssetIdAvailable(false);
    setDateFieldErrors({});
  };

  const validateAssetId = (id: string): boolean => {
    if (!id || id.trim() === '') {
      setAssetIdError('Asset ID is required');
      setAssetIdAvailable(false);
      return false;
    }
    const pattern = /^FAST-\d{4}$/;
    if (!pattern.test(id)) {
      setAssetIdError('Asset ID must match format: FAST-XXXX');
      setAssetIdAvailable(false);
      return false;
    }
    const isDuplicate = data.some((item: any) => 
      item.id === id && (!selectedItem || item.id !== selectedItem.id || item.version !== selectedItem.version)
    );
    if (isDuplicate) {
      setAssetIdError('This Asset ID already exists');
      setAssetIdAvailable(false);
      return false;
    }
    setAssetIdError(null);
    setAssetIdAvailable(true);
    return true;
  };

  const handleSave = () => {
    if (!validateAssetId(editFormData.id)) return;
    const hasDateErrors = Object.values(dateFieldErrors).some(error => error !== null);
    if (hasDateErrors) {
      toast({
        title: "Invalid Date Format",
        description: "Please correct the date format errors before saving.",
        variant: "destructive"
      });
      return;
    }

    const updatedItem = {
      ...editFormData,
      lastModifiedBy: user?.name || 'Unknown User',
      lastModifiedDate: format(new Date(), 'MMM d, yyyy HH:mm'),
    };

    let updatedList: any[];
    if (selectedItem) {
      const oldVersion = { ...selectedItem, isLatestVersion: false };
      const newVersion = { 
        ...updatedItem, 
        version: (selectedItem.version || 1) + 1, 
        isLatestVersion: true 
      };
      updatedList = data.map((item: any) => {
        if (item.id === selectedItem.id && item.version === selectedItem.version) {
          return oldVersion;
        }
        return item;
      });
      updatedList.push(newVersion);
      setSelectedItem(newVersion);
      setEditFormData(newVersion);
    } else {
      updatedItem.version = 1;
      updatedItem.isLatestVersion = true;
      updatedList = [...data, updatedItem];
      setSelectedItem(updatedItem);
      setEditFormData(updatedItem);
    }

    setData(updatedList);
    setIsEditing(false);
    toast({
      title: selectedItem ? "Changes Saved" : "Asset Created",
      description: selectedItem 
        ? `Version ${(selectedItem.version || 1) + 1} has been saved.`
        : `New asset ${updatedItem.id} has been created.`,
    });
  };

  const handleDuplicate = () => {
    if (!selectedItem) return;
    const newId = `FAST-${String(data.filter(f => f.isLatestVersion).length + 1).padStart(4, '0')}`;
    const duplicatedItem = {
      ...selectedItem,
      id: newId,
      name: `${selectedItem.name} (Copy)`,
      version: 1,
      isLatestVersion: true,
      lastModifiedBy: user?.name || 'Unknown User',
      lastModifiedDate: format(new Date(), 'MMM d, yyyy HH:mm'),
    };
    setData([...data, duplicatedItem]);
    setIsDuplicateConfirmOpen(false);
    toast({
      title: "Asset Duplicated",
      description: `Created ${newId} as a copy of ${selectedItem.id}.`,
    });
  };

  const handleMarkAsFakeAsset = () => {
    if (!selectedItem) return;
    const updatedList = data.map((item: any) =>
      item.id === selectedItem.id ? { ...item, isFakeAsset: true } : item
    );
    setData(updatedList);
    setSelectedItem({ ...selectedItem, isFakeAsset: true });
    setIsFakeAssetConfirmOpen(false);
    toast({
      title: "Marked as Fake Asset",
      description: `${selectedItem.id} has been marked as a fake asset.`,
    });
  };

  const applyColumnPreset = (preset: { name: string; columns: string[] | 'all' | 'default' }) => {
    let cols: string[];
    if (preset.columns === 'all') {
      cols = ALL_COLUMN_KEYS;
    } else if (preset.columns === 'default') {
      cols = defaultVisibleColumns;
    } else {
      cols = preset.columns;
    }
    const visibility: Record<string, boolean> = {};
    ALL_COLUMN_KEYS.forEach(key => {
      visibility[key] = cols.includes(key);
    });
    setColumnVisibility(visibility);
  };

  const applyVersionDatePreset = (preset: string) => {
    setVersionDatePreset(preset);
    const now = new Date();
    switch (preset) {
      case 'today':
        setVersionDateRange({ from: startOfDay(now), to: endOfDay(now) });
        break;
      case 'last7days':
        setVersionDateRange({ from: startOfDay(subDays(now, 7)), to: endOfDay(now) });
        break;
      case 'last30days':
        setVersionDateRange({ from: startOfDay(subDays(now, 30)), to: endOfDay(now) });
        break;
      case 'thisMonth':
        setVersionDateRange({ from: startOfMonth(now), to: endOfMonth(now) });
        break;
      case 'lastMonth':
        const lastMonth = subMonths(now, 1);
        setVersionDateRange({ from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) });
        break;
      default:
        setVersionDateRange({ from: undefined, to: undefined });
    }
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
    XLSX.utils.book_append_sheet(wb, ws, 'FAST');
    XLSX.writeFile(wb, `FAST_Export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast({ title: "Export Complete", description: `Exported ${exportData.length} records.` });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Full Asset Status Tracker (FAST)</h1>
            <p className="text-muted-foreground mt-1">Comprehensive asset tracking for onboarding, maintenance, and attestation workflows.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportToExcel} className="gap-2">
              <Download className="h-4 w-4" />
              Export to Excel
            </Button>
            {isAdmin && (
              <Button onClick={handleAddNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Add New
              </Button>
            )}
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
          </div>

          <div className="flex items-center gap-2 ml-auto flex-wrap">
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
                <DropdownMenuLabel>Column Visibility</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <Input
                    placeholder="Search columns..."
                    value={columnSearchQuery}
                    onChange={(e) => setColumnSearchQuery(e.target.value)}
                    className="h-8"
                  />
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">Presets</DropdownMenuLabel>
                <div className="flex flex-wrap gap-1 p-2">
                  {COLUMN_PRESETS.map(preset => (
                    <Button key={preset.name} variant="outline" size="sm" className="h-6 text-xs" onClick={() => applyColumnPreset(preset)}>
                      {preset.name}
                    </Button>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                  {columns
                    .filter(col => col.header.toLowerCase().includes(columnSearchQuery.toLowerCase()))
                    .map(col => (
                      <DropdownMenuCheckboxItem
                        key={col.accessorKey}
                        checked={columnVisibility[col.accessorKey] !== false}
                        onCheckedChange={(checked) => {
                          setColumnVisibility(prev => ({ ...prev, [col.accessorKey]: checked }));
                        }}
                      >
                        {col.header}
                      </DropdownMenuCheckboxItem>
                    ))}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-md border">
              <Checkbox
                id="showVersionHistory"
                checked={showVersionHistory}
                onCheckedChange={(checked) => {
                  setShowVersionHistory(checked === true);
                  if (!checked) {
                    setVersionDateRange({ from: undefined, to: undefined });
                    setVersionDatePreset('all');
                  }
                }}
              />
              <Label htmlFor="showVersionHistory" className="text-sm font-medium cursor-pointer">
                FAST History
              </Label>
            </div>

            {showVersionHistory && (
              <Popover open={isVersionDateOpen} onOpenChange={setIsVersionDateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("justify-start text-left font-normal", !versionDateRange.from && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {versionDatePreset !== 'custom' && versionDatePreset !== 'all'
                      ? { today: 'Today', last7days: 'Last 7 Days', last30days: 'Last 30 Days', thisMonth: 'This Month', lastMonth: 'Last Month' }[versionDatePreset]
                      : versionDatePreset === 'custom' && versionDateRange.from
                        ? versionDateRange.to
                          ? `${format(versionDateRange.from, 'MMM d')} - ${format(versionDateRange.to, 'MMM d, yyyy')}`
                          : format(versionDateRange.from, 'MMM d, yyyy')
                        : 'All Dates'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="p-3 border-b space-y-2">
                    <h4 className="font-medium text-sm">Filter by Date</h4>
                    <div className="flex flex-wrap gap-1">
                      {[
                        { key: 'all', label: 'All' },
                        { key: 'today', label: 'Today' },
                        { key: 'last7days', label: 'Last 7 Days' },
                        { key: 'last30days', label: 'Last 30 Days' },
                        { key: 'thisMonth', label: 'This Month' },
                        { key: 'lastMonth', label: 'Last Month' },
                      ].map(preset => (
                        <Button
                          key={preset.key}
                          variant={versionDatePreset === preset.key ? 'default' : 'outline'}
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => applyVersionDatePreset(preset.key)}
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Calendar
                    mode="range"
                    selected={{ from: versionDateRange.from, to: versionDateRange.to }}
                    onSelect={(range) => {
                      setVersionDateRange({ from: range?.from, to: range?.to });
                      setVersionDatePreset('custom');
                    }}
                    numberOfMonths={2}
                    disabled={(date) => date > new Date()}
                  />
                  <div className="p-3 border-t flex justify-end">
                    <Button size="sm" onClick={() => setIsVersionDateOpen(false)} disabled={!versionDateRange.from || !versionDateRange.to}>
                      Apply
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            <ViewToggle view={view} setView={setView} />
          </div>
        </div>

        {view === 'table' ? (
          <DataTable
            data={tableData}
            columns={visibleColumns}
            onSort={handleSort}
            sortConfig={sortConfig}
            columnFilters={columnFilters}
            onColumnFiltersChange={(filters: Record<string, string[]>) => setColumnFilters(filters)}
            allData={sortedData}
            expandableVersions={showVersionHistory}
            onRowClick={(item: any) => {
              if (isAdmin && item.isLatestVersion) {
                handleEditClick(item);
              } else {
                handleItemClick(item);
              }
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedData.map((item: any, index: number) => {
              const allVersionsForItem = showVersionHistory ? sortedData.filter((d: any) => d.id === item.id) : [];
              return (
                <DataCard
                  key={`${item.id}-${item.version || index}`}
                  item={item}
                  titleKey="name"
                  statusKey="cmdbStatus"
                  fields={visibleCardFields as any}
                  onClick={handleItemClick}
                  showVersion={showVersionHistory}
                  isLatestVersion={item.isLatestVersion}
                  allVersions={allVersionsForItem}
                />
              );
            })}
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="text-xl flex items-center gap-2">
                {isEditing ? (selectedItem ? 'Edit Item' : 'Add New Item') : (selectedItem?.name || 'Details')}
                {selectedItem?.isFakeAsset && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">Fake Asset</span>
                )}
              </DialogTitle>
              {selectedItem && !isEditing && (
                <DialogDescription>
                  {selectedItem.id} {selectedItem.version ? `• Version ${selectedItem.version}` : ''}
                  {selectedItem.isLatestVersion && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">Latest</span>
                  )}
                </DialogDescription>
              )}
            </DialogHeader>
            
            <ScrollArea className="flex-1 pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                {isEditing ? (
                  Object.entries(editFormData)
                    .filter(([key]) => !['version', 'isLatestVersion', 'isFakeAsset', 'parentFastId'].includes(key))
                    .map(([key, value]) => {
                      const column = columns.find(c => c.accessorKey === key);
                      const enumOptions = ENUM_FIELDS[key];
                      return (
                        <div key={key} className="space-y-2">
                          <Label htmlFor={key} className="text-sm font-medium">
                            {column?.header || key}
                            {key === 'id' && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                          {enumOptions ? (
                            <Select value={String(value || '')} onValueChange={(val) => setEditFormData((prev: any) => ({ ...prev, [key]: val }))}>
                              <SelectTrigger>
                                <SelectValue placeholder={`Select ${column?.header || key}`} />
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
                              value={String(value || '')}
                              onChange={(e) => {
                                setEditFormData((prev: any) => ({ ...prev, [key]: e.target.value }));
                                if (key === 'id') validateAssetId(e.target.value);
                              }}
                              className={key === 'id' && assetIdError ? 'border-red-500' : ''}
                            />
                          )}
                          {key === 'id' && assetIdError && <p className="text-red-500 text-xs">{assetIdError}</p>}
                          {key === 'id' && assetIdAvailable && <p className="text-green-500 text-xs flex items-center gap-1"><Check className="h-3 w-3" /> Available</p>}
                        </div>
                      );
                    })
                ) : (
                  selectedItem && Object.entries(selectedItem)
                    .filter(([key]) => !['version', 'isLatestVersion', 'isFakeAsset', 'parentFastId'].includes(key))
                    .map(([key, value]) => {
                      const column = columns.find(c => c.accessorKey === key);
                      return (
                        <div key={key} className="space-y-1">
                          <Label className="text-sm text-muted-foreground">{column?.header || key}</Label>
                          <p className="text-sm font-medium">{String(value || '-')}</p>
                        </div>
                      );
                    })
                )}
              </div>
            </ScrollArea>

            <div className="flex justify-between items-center pt-4 border-t">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                  <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4" /> Save</Button>
                </>
              ) : (
                <>
                  <div className="flex gap-2">
                    {isAdmin && selectedItem && !selectedItem.isFakeAsset && (
                      <Button variant="outline" size="sm" onClick={() => setIsFakeAssetConfirmOpen(true)} className="gap-1 text-orange-600">
                        <AlertTriangle className="h-4 w-4" /> Mark as Fake Asset
                      </Button>
                    )}
                    {isAdmin && selectedItem && (
                      <Button variant="outline" size="sm" onClick={() => setIsDuplicateConfirmOpen(true)} className="gap-1">
                        <Copy className="h-4 w-4" /> Duplicate
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button>
                    {isAdmin && selectedItem?.isLatestVersion && (
                      <Button onClick={() => handleEditClick()} className="gap-2"><Pencil className="h-4 w-4" /> Edit</Button>
                    )}
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isDuplicateConfirmOpen} onOpenChange={setIsDuplicateConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Duplicate Asset</DialogTitle>
              <DialogDescription>Create a copy of {selectedItem?.id}?</DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsDuplicateConfirmOpen(false)}>Cancel</Button>
              <Button onClick={handleDuplicate}>Duplicate</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isFakeAssetConfirmOpen} onOpenChange={setIsFakeAssetConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-orange-500" /> Mark as Fake Asset</DialogTitle>
              <DialogDescription>This action is permanent and cannot be undone.</DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsFakeAssetConfirmOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleMarkAsFakeAsset}>Mark as Fake Asset</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
