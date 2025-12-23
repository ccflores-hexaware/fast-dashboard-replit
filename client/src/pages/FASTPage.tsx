import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ViewToggle } from '@/components/ViewToggle';
import { DataTable, StatusBadge } from '@/components/DataTable';
import { DataCard } from '@/components/DataCard';
import { Pagination } from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Download, Save, X, Pencil, Search, Check, ChevronsUpDown, Copy, ArrowRight, Settings2, RotateCcw, Eye, EyeOff, Loader2, MessageSquare, History } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
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
  'id', 'name', 'kalmAssignee', 'onboardingStatus', 'onboardingDisposition', 'airDisposition', 
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
  'id', 'name', 'kalmAssignee', 'onboardingStatus', 'onboardingDisposition',
  'airDisposition', 'maintenanceDisposition', 'cmdbStatus', 'assetType', 'technology',
  'connectorStatus', 'enrollmentStatus', 'evidenceStatus', 'lastModifiedBy', 'lastModifiedDate'
];

const VIEWER_DEFAULT_COLUMNS = [
  'id', 'name', 'assetType', 'technology', 'onboardingStatus', 'cmdbStatus',
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

const FIELD_LABELS: Record<string, string> = {
  id: 'Asset ID',
  name: 'Name',
  kalmAssignee: 'KALM Assignee',
  onboardingStatus: 'Onboarding Status',
  onboardingDisposition: 'Onboarding Disposition',
  airDisposition: 'AIR Disposition',
  maintenanceDisposition: 'Maintenance Disposition',
  lastConnectorDeliveryDate: 'Last Connector Delivery Date',
  maintenanceSLAExpiration: 'Maintenance SLA Expiration',
  technology: 'Technology',
  cmdbStatus: 'CMDB Status',
  cmdbBeingRetired: 'CMDB Being Retired',
  cmdbLegalHold: 'CMDB Legal Hold',
  ticketsOpened: 'Tickets Opened',
  assetType: 'Asset Type',
  yearOnboarded: 'Year Onboarded',
  monthOnboarded: 'Month Onboarded',
  assetPOCs: 'Asset POCs',
  onboardingSchedule: 'Onboarding Schedule',
  entitlementsMissing: 'Entitlements Missing',
  membersMissing: 'Members Missing',
  cisMissing: 'CIS Missing',
  reliesOnCAFederation: 'Relies on CA Federation',
  connectorPattern: 'Connector Pattern',
  automationTeam: 'Automation Team',
  nameOfConnector: 'Name of Connector',
  connectorStatus: 'Connector Status',
  enrollmentStatus: 'Enrollment Status',
  evidenceStatus: 'Evidence Status',
  miSchedule: 'MI Schedule',
  miLastAIRUpload: 'MI Last AIR Upload',
  miDaysSince: 'MI Days Since',
  miDueDate: 'MI Due Date',
  miOnboardingChangeDate: 'MI Onboarding Change Date',
  miL2Assignee: 'MI L2 Assignee',
  miStatus: 'MI Status',
  attestationKickedOff: 'Attestation Kicked Off',
  attestationComplete: 'Attestation Complete',
  aiLastCandAAttestation: 'AI Last C&A Attestation',
  keychainAttestationKickoffDate: 'Keychain Attestation Kickoff Date',
  aiDaysSince: 'AI Days Since',
  aiAttestationDueDate: 'AI Attestation Due Date',
  aiOnboardingChangeDate: 'AI Onboarding Change Date',
  aiL2Assignee: 'AI L2 Assignee',
  aiStatus: 'AI Status',
  theGap: 'The Gap',
  comments: 'Comments',
  lastModifiedBy: 'Last Modified By',
  lastModifiedDate: 'Last Modified Date',
};

const getFieldLabel = (key: string): string => {
  return FIELD_LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
};

export default function FASTPage() {
  const { toast } = useToast();
  const { isAdmin, user } = useUser();
  const { view, setView } = useViewToggle('table');
  
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [originalItem, setOriginalItem] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/fast');
        if (!response.ok) throw new Error('Failed to fetch');
        const assets = await response.json();
        setData(assets);
      } catch (error) {
        console.error('Error fetching FAST data:', error);
        toast({ title: "Error", description: "Failed to load FAST data", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
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
  const [isDuplicateConfirmOpen, setIsDuplicateConfirmOpen] = useState(false);
  
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
    return data;
  }, [data]);

  const columns = useMemo(() => [
    { 
      header: 'Asset ID', 
      accessorKey: 'id',
      cell: (item: any) => (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (isAdmin) {
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
    if (!searchQuery.trim()) return baseData;
    const query = searchQuery.toLowerCase();
    return baseData.filter((item: any) => {
      if (searchColumn === 'all') {
        return columns.some(col => {
          const value = item[col.accessorKey];
          return value && String(value).toLowerCase().includes(query);
        });
      }
      const value = item[searchColumn];
      return value && String(value).toLowerCase().includes(query);
    });
  }, [baseData, searchQuery, searchColumn, columns]);

  const { columnFilters, setColumnFilters, filteredData } = useColumnFilters(searchFilteredData);
  const { sortConfig, handleSort, sortedData } = useSorting(filteredData);
  const { currentPage, pageSize, setCurrentPage, setPageSize, paginatedData, totalPages, totalItems } = usePagination(sortedData);

  const visibleColumns = useMemo(() => {
    return columns.filter(col => {
      if (columnVisibility[col.accessorKey] === false) return false;
      return true;
    });
  }, [columns, columnVisibility]);

  const visibleCardFields = useMemo(() => {
    return cardFields.filter(field => cardFieldVisibility[field.key]);
  }, [cardFieldVisibility]);

  const visibleColumnCount = Object.values(columnVisibility).filter(Boolean).length;
  const totalColumnCount = ALL_COLUMN_KEYS.length;

  const fetchActivities = async (assetId: string) => {
    setIsLoadingActivities(true);
    try {
      const response = await fetch(`/api/activity/${assetId}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setIsEditing(false);
    setActiveTab('details');
    setIsDialogOpen(true);
    fetchActivities(item.id);
  };

  const handleEditClick = (item?: any) => {
    const itemToEdit = item || selectedItem;
    if (itemToEdit) {
      setEditFormData({ ...itemToEdit });
      setOriginalItem({ ...itemToEdit });
      setSelectedItem(itemToEdit);
      setIsEditing(true);
      setComment('');
      setAssetIdError(null);
      setAssetIdAvailable(false);
      setIsDialogOpen(true);
      fetchActivities(itemToEdit.id);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setIsDialogOpen(false);
    setEditFormData({});
    setOriginalItem(null);
    setComment('');
    setActiveTab('details');
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
    // When editing an existing item, only allow the original ID
    if (selectedItem) {
      if (id !== selectedItem.id) {
        setAssetIdError('Asset ID cannot be changed');
        setAssetIdAvailable(false);
        return false;
      }
      setAssetIdError(null);
      setAssetIdAvailable(true);
      return true;
    }
    // When adding new item, check if ID already exists
    const isDuplicate = data.some((item: any) => item.id === id);
    if (isDuplicate) {
      setAssetIdError('This Asset ID already exists');
      setAssetIdAvailable(false);
      return false;
    }
    setAssetIdError(null);
    setAssetIdAvailable(true);
    return true;
  };

  const handleSave = async () => {
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

    setIsSaving(true);
    const updatedItem = {
      ...editFormData,
      lastModifiedBy: user?.name || 'Unknown User',
      lastModifiedDate: format(new Date(), 'MMM d, yyyy HH:mm'),
    };
    
    // Remove internal fields that shouldn't be sent to the server
    delete updatedItem.internalId;
    delete updatedItem.createdAt;
    delete updatedItem.version;
    delete updatedItem.isLatestVersion;

    // Detect field changes for activity tracking
    const fieldChanges: Record<string, { old: any; new: any }> = {};
    if (originalItem) {
      const excludeFields = ['internalId', 'createdAt', 'version', 'isLatestVersion', 'lastModifiedBy', 'lastModifiedDate'];
      Object.keys(editFormData).forEach(key => {
        if (!excludeFields.includes(key)) {
          const oldVal = originalItem[key];
          const newVal = editFormData[key];
          // Use nullish coalescing to preserve falsy values like 0 or false
          const oldStr = String(oldVal ?? '');
          const newStr = String(newVal ?? '');
          if (oldStr !== newStr) {
            fieldChanges[key] = { old: oldVal ?? '', new: newVal ?? '' };
          }
        }
      });
    }

    try {
      if (selectedItem) {
        // Update existing asset in place
        const response = await fetch(`/api/fast/${selectedItem.internalId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedItem)
        });
        
        if (!response.ok) throw new Error('Failed to save');
        const savedItem = await response.json();
        
        // Create activity record if there are changes or a comment
        const hasChanges = Object.keys(fieldChanges).length > 0;
        const hasComment = comment.trim().length > 0;
        if (hasChanges || hasComment) {
          await fetch('/api/activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              assetId: savedItem.id,
              text: hasComment ? comment.trim() : null,
              field: hasChanges ? fieldChanges : null,
              modifiedBy: user?.name || 'Unknown User',
            })
          });
        }
        
        // Refresh data from server
        const refreshResponse = await fetch('/api/fast');
        if (refreshResponse.ok) {
          const refreshedData = await refreshResponse.json();
          setData(refreshedData);
        }
        
        setSelectedItem(savedItem);
        setEditFormData(savedItem);
        setOriginalItem(savedItem);
        setComment('');
        fetchActivities(savedItem.id);
        toast({
          title: "Changes Saved",
          description: `Asset ${savedItem.id} has been updated.`,
        });
      } else {
        // Create new asset
        const response = await fetch('/api/fast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedItem)
        });
        
        if (!response.ok) throw new Error('Failed to create');
        const savedItem = await response.json();
        
        setData([savedItem, ...data]);
        setSelectedItem(savedItem);
        setEditFormData(savedItem);
        toast({
          title: "Asset Created",
          description: `New asset ${savedItem.id} has been created.`,
        });
      }
      setIsEditing(false);
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

  const handleDuplicate = async () => {
    if (!selectedItem) return;
    const newId = `AST-${String(data.length + 1).padStart(4, '0')}`;
    const duplicatedItem = {
      ...selectedItem,
      id: newId,
      name: `${selectedItem.name} (Copy)`,
      lastModifiedBy: user?.name || 'Unknown User',
      lastModifiedDate: format(new Date(), 'MMM d, yyyy HH:mm'),
    };
    delete duplicatedItem.internalId;
    delete duplicatedItem.createdAt;
    
    try {
      const response = await fetch('/api/fast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicatedItem)
      });
      
      if (!response.ok) throw new Error('Failed to duplicate');
      const savedItem = await response.json();
      
      setData([savedItem, ...data]);
      setIsDuplicateConfirmOpen(false);
      toast({
        title: "Asset Duplicated",
        description: `Created ${newId} as a copy of ${selectedItem.id}.`,
      });
    } catch (error) {
      console.error('Error duplicating:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate asset.",
        variant: "destructive"
      });
    }
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
            <Button onClick={exportToExcel} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
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
          <DataTable
            data={paginatedData}
            columns={visibleColumns}
            onSort={handleSort}
            sortConfig={sortConfig}
            columnFilters={columnFilters}
            onColumnFiltersChange={(filters: Record<string, string[]>) => setColumnFilters(filters)}
            allData={sortedData}
            onRowClick={handleItemClick}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedData.map((item: any, index: number) => (
              <DataCard
                key={`${item.id}-${item.internalId || index}`}
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
                  {isEditing ? (selectedItem ? 'Edit Item' : 'Add New Item') : (selectedItem?.name || 'Details')}
                </DialogTitle>
              </div>
              <DialogDescription>
                {selectedItem?.id && `ID: ${selectedItem.id}`}
              </DialogDescription>
            </DialogHeader>
            
            {!isEditing && (
              <div className="px-6 border-b">
                <div className="flex gap-1">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={cn(
                      "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                      activeTab === 'details'
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setActiveTab('activity')}
                    className={cn(
                      "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                      activeTab === 'activity'
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <History className="h-4 w-4" />
                    Activity History
                    {activities.length > 0 && (
                      <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                        {activities.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto px-6 min-h-0">
              <div className="py-4">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                      {columns.map((col) => {
                        const key = col.accessorKey;
                        const value = editFormData[key];
                        const enumOptions = ENUM_FIELDS[key];
                        const isAuditField = key === 'lastModifiedBy' || key === 'lastModifiedDate';
                        const shouldDisable = (key === 'id' && !!selectedItem) || isAuditField;
                        
                        return (
                          <div key={key} className="flex flex-col space-y-2 py-3 border-b border-border/50">
                            <Label htmlFor={key} className="text-sm font-medium text-muted-foreground">
                              {col.header}
                              {key === 'id' && <span className="text-red-500 ml-1">*</span>}
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
                                  if (key === 'id') validateAssetId(e.target.value);
                                }}
                                disabled={shouldDisable}
                                className={cn(
                                  "font-semibold",
                                  key === 'id' && assetIdError ? 'border-red-500' : '',
                                  shouldDisable ? 'bg-muted cursor-not-allowed' : ''
                                )}
                              />
                            )}
                            {key === 'id' && !selectedItem && assetIdError && <p className="text-red-500 text-xs">{assetIdError}</p>}
                            {key === 'id' && !selectedItem && assetIdAvailable && <p className="text-green-500 text-xs flex items-center gap-1"><Check className="h-3 w-3" /> Available</p>}
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="flex flex-col space-y-2 py-4 border-t border-border mt-4">
                      <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" /> Add Comment (optional)
                      </Label>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Enter a comment about this change..."
                        className="resize-none"
                        rows={3}
                      />
                    </div>
                  </>
                ) : activeTab === 'details' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                    {columns.map((col) => {
                      const key = col.accessorKey;
                      const value = selectedItem?.[key];
                      return (
                        <div key={key} className="flex flex-col space-y-1 py-3 border-b border-border/50">
                          <span className="text-sm font-medium text-muted-foreground">{col.header}</span>
                          <span className="text-base font-semibold text-foreground">
                            {(value === undefined || value === null || value === '') ? '-' : String(value)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <>
                    {isLoadingActivities ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : activities.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <History className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground font-medium">No activity recorded yet</p>
                        <p className="text-sm text-muted-foreground/70 mt-1">Changes and comments will appear here</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {activities.map((activity: any) => (
                          <div key={activity.id} className="border rounded-lg p-4 bg-card shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-xs font-bold text-primary">
                                    {activity.modifiedBy?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?'}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{activity.modifiedBy}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {activity.modifiedDate ? format(new Date(activity.modifiedDate), 'MMM d, yyyy \'at\' h:mm a') : '-'}
                                  </p>
                                </div>
                              </div>
                            </div>
                            {activity.text && (
                              <div className="mb-3 p-3 bg-muted/50 rounded-md">
                                <p className="text-sm flex items-start gap-2">
                                  <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                  {activity.text}
                                </p>
                              </div>
                            )}
                            {activity.field && Object.keys(activity.field).length > 0 && (
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Field Changes</p>
                                <div className="space-y-2">
                                  {Object.entries(activity.field).map(([fieldKey, change]: [string, any]) => (
                                    <div key={fieldKey} className="flex items-center gap-3 text-base p-3 bg-muted/30 rounded-lg">
                                      <span className="font-semibold min-w-[180px]">{getFieldLabel(fieldKey)}</span>
                                      <span className="text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-1 rounded text-sm line-through">
                                        {change.old || '(empty)'}
                                      </span>
                                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                      <span className="text-green-600 bg-green-50 dark:bg-green-950/30 px-3 py-1 rounded text-sm">
                                        {change.new || '(empty)'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="p-6 pt-4 border-t mt-auto bg-muted/20 flex justify-between items-center">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>Cancel</Button>
                  <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex gap-2">
                    {isAdmin && selectedItem && (
                      <Button variant="outline" size="sm" onClick={() => setIsDuplicateConfirmOpen(true)} className="gap-1">
                        <Copy className="h-4 w-4" /> Duplicate
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button>
                    {isAdmin && selectedItem && (
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

      </div>
    </DashboardLayout>
  );
}
