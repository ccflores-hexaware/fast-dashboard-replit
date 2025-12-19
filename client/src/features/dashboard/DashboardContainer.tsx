import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ViewToggle } from '@/components/ViewToggle';
import { DataTable, StatusBadge } from '@/components/DataTable';
import { DataCard } from '@/components/DataCard';
import { Pagination } from '@/components/Pagination';
import { mockAssets, mockTPI, mockBTO, mockCMDB, mockFAST } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Plus, Save, X, Pencil, Search, Check, ChevronsUpDown, Calendar as CalendarIcon, Copy, AlertTriangle, ArrowRight, Settings2, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { FilterMenu } from '@/components/FilterMenu';
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
import { format, parse, isValid, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/lib/userContext";
import * as XLSX from 'xlsx';

export type ModuleType = 'assets' | 'tpi' | 'bto' | 'cmdb' | 'fast';

interface DashboardContainerProps {
  type: ModuleType;
}

export function DashboardContainer({ type }: DashboardContainerProps) {
  const { toast } = useToast();
  const { isAdmin, user } = useUser();
  const [view, setView] = useState<'table' | 'card'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState('all');
  const [openCombobox, setOpenCombobox] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [historyDate, setHistoryDate] = useState<Date | undefined>(undefined);
  const [tempHistoryDate, setTempHistoryDate] = useState<Date | undefined>(undefined);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDuplicateConfirmOpen, setIsDuplicateConfirmOpen] = useState(false);
  const [isFakeAssetConfirmOpen, setIsFakeAssetConfirmOpen] = useState(false);
  const [assetIdError, setAssetIdError] = useState<string | null>(null);
  const [assetIdAvailable, setAssetIdAvailable] = useState<boolean>(false);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
  const [columnSearchQuery, setColumnSearchQuery] = useState('');
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);
  const [cardFieldVisibility, setCardFieldVisibility] = useState<Record<string, boolean>>({});
  const [cardFieldSearchQuery, setCardFieldSearchQuery] = useState('');
  const [isCardFieldSettingsOpen, setIsCardFieldSettingsOpen] = useState(false);
  const [dateFieldErrors, setDateFieldErrors] = useState<Record<string, string | null>>({});
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versionDateRange, setVersionDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [versionDatePreset, setVersionDatePreset] = useState<string>('all');
  const [isVersionDateOpen, setIsVersionDateOpen] = useState(false);

  const MAX_CARD_FIELDS = 7;

  const adminDefaultColumns: Record<string, string[]> = {
    fast: [
      'id', 'name', 'version', 'kalmAssignee', 'onboardingStatus', 'onboardingDisposition',
      'airDisposition', 'maintenanceDisposition', 'cmdbStatus', 'assetType', 'technology',
      'connectorStatus', 'enrollmentStatus', 'evidenceStatus', 'lastModifiedBy', 'lastModifiedDate'
    ],
    assets: [
      'id', 'name', 'cmdbStatus', 'type', 'btoAlignment', 'itOwner', 'businessOwner',
      'division', 'hosted', 'sox', 'missionCritical', 'businessCritical',
      'lastModifiedBy', 'lastModifiedDate'
    ],
    tpi: [
      'id', 'name', 'cmdbStatus', 'assetType', 'btoAlignment', 'applicationTypeFinancial',
      'itOwnerManagedBy', 'businessOwnerOwnedBy', 'connectorStatus', 'onboardingStatus',
      'disposition', 'assetTier', 'foundational'
    ],
    bto: [
      'id', 'higherLevelBTO', 'bto', 'division', 'owner', 'deadline', 'status', 'progress'
    ],
    cmdb: [
      'id', 'configItem', 'status', 'environment', 'owner', 'version'
    ]
  };

  const viewerDefaultColumns: Record<string, string[]> = {
    fast: [
      'id', 'name', 'version', 'assetType', 'technology', 'onboardingStatus', 'cmdbStatus',
      'maintenanceDisposition', 'airDisposition'
    ],
    assets: [
      'id', 'name', 'type', 'cmdbStatus', 'division', 'itOwner', 'businessOwner',
      'missionCritical', 'businessCritical'
    ],
    tpi: [
      'id', 'name', 'cmdbStatus', 'assetType', 'disposition', 'assetTier',
      'itOwnerManagedBy', 'businessOwnerOwnedBy'
    ],
    bto: [
      'id', 'higherLevelBTO', 'bto', 'division', 'owner', 'status', 'progress'
    ],
    cmdb: [
      'id', 'configItem', 'status', 'environment', 'owner', 'version'
    ]
  };

  const defaultVisibleColumns = isAdmin ? adminDefaultColumns : viewerDefaultColumns;

  const columnPresets: Record<string, { name: string; columns: string[] | 'all' | 'default' }[]> = {
    fast: [
      { name: 'Default', columns: 'default' },
      { name: 'All Columns', columns: 'all' },
      { name: 'Onboarding Focus', columns: ['id', 'name', 'onboardingStatus', 'onboardingDisposition', 'kalmAssignee', 'yearOnboarded', 'monthOnboarded', 'onboardingSchedule'] },
      { name: 'Maintenance Focus', columns: ['id', 'name', 'maintenanceDisposition', 'maintenanceSLAExpiration', 'miStatus', 'miSchedule', 'miL2Assignee', 'miDueDate'] },
      { name: 'Attestation Focus', columns: ['id', 'name', 'attestationKickedOff', 'attestationComplete', 'aiStatus', 'aiL2Assignee', 'aiAttestationDueDate', 'aiLastCandAAttestation'] },
      { name: 'Connector Focus', columns: ['id', 'name', 'connectorStatus', 'connectorPattern', 'nameOfConnector', 'automationTeam', 'reliesOnCAFederation'] },
    ],
    assets: [
      { name: 'Default', columns: 'default' },
      { name: 'All Columns', columns: 'all' },
      { name: 'Ownership View', columns: ['id', 'name', 'itOwner', 'businessOwner', 'businessOwnerSME', 'supportedBy', 'supportSME', 'architect'] },
      { name: 'Compliance View', columns: ['id', 'name', 'sox', 'sppi', 'ppiClassification', 'missionCritical', 'businessCritical', 'customerFacing'] },
    ],
    tpi: [
      { name: 'Default', columns: 'default' },
      { name: 'All Columns', columns: 'all' },
      { name: 'Status Overview', columns: ['id', 'name', 'cmdbStatus', 'connectorStatus', 'onboardingStatus', 'disposition'] },
    ],
    bto: [
      { name: 'Default', columns: 'default' },
      { name: 'All Columns', columns: 'all' },
    ],
    cmdb: [
      { name: 'Default', columns: 'default' },
      { name: 'All Columns', columns: 'all' },
    ]
  };

  const getAllColumnKeysForType = (moduleType: string): string[] => {
    const columnKeysByType: Record<string, string[]> = {
      fast: ['id', 'name', 'kalmAssignee', 'onboardingStatus', 'onboardingDisposition', 'airDisposition', 
        'maintenanceDisposition', 'lastConnectorDeliveryDate', 'maintenanceSLAExpiration', 'technology', 'cmdbStatus', 
        'cmdbBeingRetired', 'cmdbLegalHold', 'ticketsOpened', 'assetType', 'yearOnboarded', 'monthOnboarded', 
        'assetPOCs', 'onboardingSchedule', 'entitlementsMissing', 'membersMissing', 'cisMissing', 'reliesOnCAFederation',
        'connectorPattern', 'automationTeam', 'nameOfConnector', 'connectorStatus', 'enrollmentStatus', 'evidenceStatus',
        'miSchedule', 'miLastAIRUpload', 'miDaysSince', 'miDueDate', 'miOnboardingChangeDate', 'miL2Assignee', 'miStatus',
        'attestationKickedOff', 'attestationComplete', 'aiLastCandAAttestation', 'keychainAttestationKickoffDate',
        'aiDaysSince', 'aiAttestationDueDate', 'aiOnboardingChangeDate', 'aiL2Assignee', 'aiStatus', 'theGap', 
        'comments', 'lastModifiedBy', 'lastModifiedDate'],
      assets: ['id', 'name', 'cmdbStatus', 'type', 'btoAlignment', 'applicationTypeFinancial', 'architect',
        'assessmentCategory', 'blockFundingName', 'blockFundingOwner', 'businessCritical', 'businessOwner',
        'businessOwnerSME', 'cotsOrInHouse', 'customerFacing', 'deploymentLifecyclePhase', 'deploymentLifecycleStartDate',
        'description', 'division', 'foundational', 'hosted', 'isSaas', 'itOwner', 'maintenanceWindow', 'missionCritical',
        'operationalHours', 'ppiClassification', 'sox', 'sppi', 'supportSME', 'supportedBy', 'supporting',
        'lastModifiedBy', 'lastModifiedDate'],
      tpi: ['id', 'name', 'cmdbStatus', 'assetType', 'affinityGroup', 'appApprModernDelivery', 'applicationTypeFinancial',
        'architect', 'assetIdInFAST', 'assetIdInSchedule', 'assetIdInWeeklyStatusReport', 'assetTier', 'blockFunding',
        'btoAlignment', 'businessOwnerCommsCheck', 'businessOwnerOwnedBy', 'businessOwnerSME', 'cashPaymentSystems',
        'cmdbBeingRetired', 'cmdbLegalHold', 'concatinatedBTOandDivision', 'connectorStatus', 'cotsOrInHouseBuilt',
        'customerFacing', 'default', 'description', 'disposition', 'externalFacing', 'financialImpact4hrOutage',
        'foundational', 'highLevelBTO', 'hosted', 'infoSecCritical', 'informationClassification', 'isSaas',
        'itOwnerCommsCheck', 'itOwnerManagedBy', 'keyChainOnboardingStatus', 'maintenanceWindow', 'mdAssetDesignation',
        'multiFactorAuthentication', 'nfr9', 'nfr10', 'nonDefaultTier1', 'nonDefaultTier2', 'nonDefaultTier3',
        'nonDefaultTier4', 'onboardingStatus', 'operationalHours', 'owningInternalOrg', 'ppiClassification',
        'privilegedAccess', 'sox', 'spof', 'sppi', 'supportSME', 'supportedBy', 'supportedByCommsCheck', 'version'],
      bto: ['id', 'higherLevelBTO', 'bto', 'division', 'concatValue', 'owner', 'deadline', 'status', 'progress'],
      cmdb: ['id', 'configItem', 'status', 'environment', 'owner', 'version', 'lastUpdated']
    };
    return columnKeysByType[moduleType] || [];
  };

  const defaultCardFields: Record<string, string[]> = {
    fast: ['id', 'assetType', 'technology', 'onboardingStatus', 'maintenanceDisposition', 'connectorStatus', 'cmdbStatus'],
    assets: ['id', 'type', 'cmdbStatus', 'itOwner', 'businessOwner', 'division', 'hosted'],
    tpi: ['id', 'cmdbStatus', 'assetType', 'hosted'],
    bto: ['higherLevelBTO', 'division', 'concatValue'],
    cmdb: ['id', 'version', 'environment', 'owner']
  };

  const [dataMap, setDataMap] = useState<Record<string, any[]>>({
    assets: mockAssets,
    tpi: mockTPI,
    bto: mockBTO,
    cmdb: mockCMDB,
    fast: mockFAST
  });

  useEffect(() => {
    setCurrentPage(1);
    setSearchQuery('');
    setSearchColumn('all');
    setColumnFilters({});
    setSortConfig({ key: null, direction: 'asc' });
    setShowVersionHistory(false);
    setVersionDateRange({ from: undefined, to: undefined });
    setVersionDatePreset('all');
    
    const storageKey = `${type}-column-visibility-${isAdmin ? 'admin' : 'viewer'}`;
    const savedVisibility = localStorage.getItem(storageKey);
    
    if (savedVisibility) {
      try {
        setColumnVisibility(JSON.parse(savedVisibility));
      } catch {
        const defaultCols = defaultVisibleColumns[type] || [];
        const visibility: Record<string, boolean> = {};
        getAllColumnKeysForType(type).forEach(key => {
          visibility[key] = defaultCols.includes(key);
        });
        setColumnVisibility(visibility);
      }
    } else {
      const defaultCols = defaultVisibleColumns[type] || [];
      const visibility: Record<string, boolean> = {};
      getAllColumnKeysForType(type).forEach(key => {
        visibility[key] = defaultCols.includes(key);
      });
      setColumnVisibility(visibility);
    }

    const cardStorageKey = `${type}-card-field-visibility`;
    const savedCardVisibility = localStorage.getItem(cardStorageKey);
    
    if (savedCardVisibility) {
      try {
        setCardFieldVisibility(JSON.parse(savedCardVisibility));
      } catch {
        const defaultFields = defaultCardFields[type] || [];
        const visibility: Record<string, boolean> = {};
        defaultFields.forEach(key => {
          visibility[key] = true;
        });
        setCardFieldVisibility(visibility);
      }
    } else {
      const defaultFields = defaultCardFields[type] || [];
      const visibility: Record<string, boolean> = {};
      defaultFields.forEach(key => {
        visibility[key] = true;
      });
      setCardFieldVisibility(visibility);
    }
  }, [type, isAdmin]);

  useEffect(() => {
    if (Object.keys(columnVisibility).length > 0) {
      const storageKey = `${type}-column-visibility-${isAdmin ? 'admin' : 'viewer'}`;
      localStorage.setItem(storageKey, JSON.stringify(columnVisibility));
    }
  }, [columnVisibility, type, isAdmin]);

  useEffect(() => {
    if (Object.keys(cardFieldVisibility).length > 0) {
      const cardStorageKey = `${type}-card-field-visibility`;
      localStorage.setItem(cardStorageKey, JSON.stringify(cardFieldVisibility));
    }
  }, [cardFieldVisibility, type]);

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    const newId = type === 'fast' 
      ? `FAST-${String(dataMap.fast.filter(f => f.isLatestVersion).length + 1).padStart(4, '0')}`
      : `AST-${String(dataMap.assets.length + 1).padStart(4, '0')}`;
    
    const newItem: any = {
      id: newId,
      name: '',
      status: 'Active',
      lastModifiedBy: user?.name || 'Unknown User',
      lastModifiedDate: format(new Date(), 'MMM d, yyyy HH:mm'),
    };
    
    if (type === 'fast') {
      newItem.version = 1;
      newItem.isLatestVersion = true;
      newItem.isFakeAsset = false;
      newItem.kalmAssignee = '';
      newItem.onboardingStatus = 'Not Started';
      newItem.onboardingDisposition = 'N/A';
      newItem.airDisposition = 'N/A';
      newItem.maintenanceDisposition = 'N/A';
      newItem.cmdbStatus = 'Active';
      newItem.assetType = '';
      newItem.technology = '';
    }
    
    setEditFormData(newItem);
    setSelectedItem(null);
    setIsEditing(true);
    setAssetIdError(null);
    setAssetIdAvailable(false);
    setIsDialogOpen(true);
  };

  const handleEditClick = (item?: any) => {
    const itemToEdit = item || selectedItem;
    if (itemToEdit) {
      if (type === 'fast' && !itemToEdit.isLatestVersion) {
        toast({
          title: "Cannot Edit Historical Version",
          description: "Only the latest version of an asset can be edited. Please select the current version.",
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
    
    const pattern = type === 'fast' ? /^FAST-\d{4}$/ : /^AST-\d{4}$/;
    if (!pattern.test(id)) {
      setAssetIdError(`Asset ID must match format: ${type === 'fast' ? 'FAST-XXXX' : 'AST-XXXX'}`);
      setAssetIdAvailable(false);
      return false;
    }
    
    const currentList = dataMap[type];
    const isDuplicate = currentList.some((item: any) => 
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
    if (!validateAssetId(editFormData.id)) {
      return;
    }

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

    const currentList = dataMap[type];
    let updatedList: any[];

    if (selectedItem) {
      if (type === 'fast') {
        const oldVersion = { ...selectedItem, isLatestVersion: false };
        const newVersion = { 
          ...updatedItem, 
          version: (selectedItem.version || 1) + 1, 
          isLatestVersion: true 
        };
        
        updatedList = currentList.map((item: any) => {
          if (item.id === selectedItem.id && item.version === selectedItem.version) {
            return oldVersion;
          }
          return item;
        });
        updatedList.push(newVersion);
        
        setSelectedItem(newVersion);
        setEditFormData(newVersion);
      } else {
        updatedList = currentList.map((item: any) =>
          item.id === selectedItem.id ? updatedItem : item
        );
        setSelectedItem(updatedItem);
        setEditFormData(updatedItem);
      }
    } else {
      updatedList = [...currentList, updatedItem];
      setSelectedItem(updatedItem);
      setEditFormData(updatedItem);
    }

    setDataMap(prev => ({
      ...prev,
      [type]: updatedList
    }));

    toast({
      title: selectedItem ? "Changes Saved" : "Item Created",
      description: selectedItem 
        ? `${updatedItem.id} has been updated successfully.${type === 'fast' ? ` Version ${updatedItem.version} created.` : ''}`
        : `${updatedItem.id} has been created successfully.`,
      variant: "success"
    });
  };

  const handleDuplicateClick = () => {
    if (!selectedItem) return;
    setIsDuplicateConfirmOpen(true);
  };

  const confirmDuplicate = () => {
    if (!selectedItem) return;
    
    const currentList = dataMap[type];
    const baseId = selectedItem.id.replace(/-\d+$/, '');
    const existingDuplicates = currentList.filter((item: any) => 
      item.id.startsWith(baseId) && item.id !== selectedItem.id
    );
    const duplicateNumber = existingDuplicates.length + 2;
    const newId = type === 'fast' 
      ? `FAST-${String(currentList.filter((f: any) => f.isLatestVersion).length + 1).padStart(4, '0')}`
      : `AST-${String(currentList.length + 1).padStart(4, '0')}`;
    
    const duplicatedItem = {
      ...selectedItem,
      id: newId,
      name: `${selectedItem.name} (Copy)`,
      lastModifiedBy: user?.name || 'Unknown User',
      lastModifiedDate: format(new Date(), 'MMM d, yyyy HH:mm'),
      ...(type === 'fast' ? { version: 1, isLatestVersion: true, isFakeAsset: true } : {}),
    };

    let updatedList = [...currentList, duplicatedItem];
    let updatedAssetsList = dataMap.assets;
    
    if (type === 'fast') {
      const newAsset = {
        id: `AST-${String(dataMap.assets.length + 1).padStart(4, '0')}`,
        name: duplicatedItem.name,
        cmdbStatus: duplicatedItem.cmdbStatus || 'Active',
        type: duplicatedItem.assetType || 'Application',
        btoAlignment: '',
        applicationTypeFinancial: '',
        architect: '',
        assessmentCategory: '',
        blockFundingName: '',
        blockFundingOwner: '',
        businessCritical: 'No',
        businessOwner: '',
        businessOwnerSME: '',
        cotsOrInHouse: 'In-House',
        customerFacing: 'No',
        deploymentLifecyclePhase: 'Production',
        deploymentLifecycleStartDate: '',
        description: '',
        division: '',
        foundational: 'No',
        hosted: 'On-Premise',
        isSaas: 'No',
        itOwner: '',
        maintenanceWindow: '',
        missionCritical: 'No',
        operationalHours: 'Business Hours',
        ppiClassification: 'Internal Use',
        sox: 'No',
        sppi: 'No',
        supportSME: '',
        supportedBy: 'Internal IT',
        supporting: 'No',
        status: 'Active',
        parentFastId: duplicatedItem.id,
        isFakeAsset: true,
        lastModifiedBy: user?.name || 'Unknown User',
        lastModifiedDate: format(new Date(), 'MMM d, yyyy HH:mm'),
      };
      updatedAssetsList = [...dataMap.assets, newAsset];
    }
    
    setDataMap(prev => ({
      ...prev,
      [type]: updatedList,
      ...(type === 'fast' ? { assets: updatedAssetsList } : {})
    }));
    
    setIsDuplicateConfirmOpen(false);
    setIsDialogOpen(false);
    
    const syncInfo = type === 'fast' ? ' and added to Fake Asset List' : '';
    toast({
      title: "Asset Duplicated",
      description: `${selectedItem.id} has been duplicated as ${newId}${syncInfo}.`,
      variant: "success"
    });
  };

  const handleMarkFakeAssetClick = () => {
    if (!selectedItem || selectedItem.isFakeAsset) return;
    setIsFakeAssetConfirmOpen(true);
  };

  const confirmMarkFakeAsset = () => {
    if (!selectedItem) return;
    
    const updatedItem = {
      ...selectedItem,
      isFakeAsset: true,
      lastModifiedBy: user?.name || 'Unknown User',
      lastModifiedDate: format(new Date(), 'MMM d, yyyy HH:mm'),
    };
    
    const currentList = dataMap[type];
    let updatedList = currentList.map((item: any) => {
      if (type === 'fast') {
        if (item.id === selectedItem.id) {
          return { ...item, isFakeAsset: true };
        }
      } else {
        if (item.id === selectedItem.id) {
          return updatedItem;
        }
      }
      return item;
    });
    
    let updatedAssetsList = dataMap.assets;
    if (type === 'fast') {
      const existingAsset = dataMap.assets.find((a: any) => a.parentFastId === selectedItem.id);
      
      if (!existingAsset) {
        const newAsset = {
          id: `AST-${String(dataMap.assets.length + 1).padStart(4, '0')}`,
          name: selectedItem.name,
          cmdbStatus: selectedItem.cmdbStatus || 'Active',
          type: selectedItem.assetType || 'Application',
          btoAlignment: '',
          applicationTypeFinancial: '',
          architect: '',
          assessmentCategory: '',
          blockFundingName: '',
          blockFundingOwner: '',
          businessCritical: 'No',
          businessOwner: '',
          businessOwnerSME: '',
          cotsOrInHouse: 'In-House',
          customerFacing: 'No',
          deploymentLifecyclePhase: 'Production',
          deploymentLifecycleStartDate: '',
          description: '',
          division: '',
          foundational: 'No',
          hosted: 'On-Premise',
          isSaas: 'No',
          itOwner: '',
          maintenanceWindow: '',
          missionCritical: 'No',
          operationalHours: 'Business Hours',
          ppiClassification: 'Internal Use',
          sox: 'No',
          sppi: 'No',
          supportSME: '',
          supportedBy: 'Internal IT',
          supporting: 'No',
          status: 'Active',
          parentFastId: selectedItem.id,
          isFakeAsset: true,
          lastModifiedBy: user?.name || 'Unknown User',
          lastModifiedDate: format(new Date(), 'MMM d, yyyy HH:mm'),
        };
        updatedAssetsList = [...dataMap.assets, newAsset];
      }
    }
    
    setDataMap(prev => ({
      ...prev,
      [type]: updatedList,
      ...(type === 'fast' ? { assets: updatedAssetsList } : {})
    }));
    
    setSelectedItem(updatedItem);
    if (isEditing) {
      setEditFormData(updatedItem);
    }
    
    setIsFakeAssetConfirmOpen(false);
    
    const syncInfo = type === 'fast' ? ' and added to Fake Asset List' : '';
    toast({
      title: "Asset Marked as Fake",
      description: `${selectedItem.id} has been permanently marked as a Fake Asset${syncInfo}. You can edit additional details in the Fake Asset List.`,
      variant: "success"
    });
  };

  const getPageConfig = () => {
    const currentData = dataMap[type];

    switch (type) {
      case 'assets':
        return {
          title: 'Fake Asset List',
          description: 'Track IT asset lifecycle, ownership, and operational compliance.',
          data: currentData,
          columns: [
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
          ],
          cardFields: [
            { label: 'Asset ID', key: 'id' },
            { label: 'Asset Type', key: 'type' },
            { label: 'CMDB Status', key: 'cmdbStatus' },
            { label: 'IT Owner', key: 'itOwner' },
            { label: 'Business Owner', key: 'businessOwner' },
            { label: 'Division', key: 'division' },
            { label: 'Hosted', key: 'hosted' },
          ],
          titleKey: 'name',
          statusKey: 'status',
          enumFields: {
            cmdbStatus: ['Active', 'Retired', 'Provisioning', 'Maintenance', 'Decommissioned'],
            deploymentLifecyclePhase: ['Analysis', 'Design', 'Development', 'Testing', 'Staging', 'Production', 'Decommission'],
            applicationTypeFinancial: ['Financial', 'Non-Financial'],
            type: ['Application', 'Microservice', 'Database', 'Infrastructure', 'Platform', 'SaaS'],
            hosted: ['On-Premise', 'AWS Cloud', 'Azure Cloud', 'Hybrid', 'Vendor Cloud'],
            sox: ['Yes', 'No'],
            customerFacing: ['Yes', 'No'],
            sppi: ['Yes', 'No'],
            ppiClassification: ['Public', 'Internal Use', 'Confidential', 'Restricted'],
            foundational: ['Yes', 'No'],
            missionCritical: ['Yes', 'No'],
            businessCritical: ['Yes', 'No'],
            supporting: ['Yes', 'No'],
            cotsOrInHouse: ['COTS', 'In-House', 'Hybrid'],
            isSaas: ['Yes', 'No'],
            maintenanceWindow: ['Sundays 00:00-04:00', 'Weekends', 'Quarterly', 'Ad-hoc', 'Patch Tuesday'],
            operationalHours: ['24/7', 'Business Hours', 'Extended Business Hours', 'Weekdays Only'],
            assessmentCategory: ['Mission Critical', 'Business Critical', 'Business Operational', 'Administrative'],
            supportedBy: ['Internal IT', 'Vendor Managed', 'Hybrid Team', 'Offshore Partner'],
          } as Record<string, string[]>,
        };
      case 'tpi':
        return {
          title: 'Technology Portfolio Insight (TPI)',
          description: 'Monitor integration status and detailed configuration attributes.',
          data: currentData,
          columns: [
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
          ],
          cardFields: [
            { label: 'CI ID', key: 'id' },
            { label: 'CMDB Status', key: 'cmdbStatus' },
            { label: 'Asset Type', key: 'assetType' },
            { label: 'Hosted', key: 'hosted' },
          ],
          titleKey: 'name',
          statusKey: 'status',
        };
      case 'bto':
        return {
          title: 'Business Technology Office (BTO)',
          description: 'Align technology initiatives with business goals and organizational divisions.',
          data: currentData,
          columns: [
            { header: 'Higher Level BTO', accessorKey: 'higherLevelBTO', cell: (item: any) => <span className="font-semibold text-primary">{item.higherLevelBTO}</span> },
            { header: 'BTO', accessorKey: 'bto' },
            { header: 'Division', accessorKey: 'division' },
            { header: 'Concat Value', accessorKey: 'concatValue' },
          ],
          cardFields: [
            { label: 'Higher Level BTO', key: 'higherLevelBTO' },
            { label: 'Division', key: 'division' },
            { label: 'Concat Value', key: 'concatValue' },
          ],
          titleKey: 'bto',
          statusKey: undefined,
          hiddenFields: ['owner', 'deadline', 'progress'],
        };
      case 'cmdb':
        return {
          title: 'Configuration Management Database (CMDB)',
          description: 'View configuration items, versions, and operational status.',
          data: currentData,
          columns: [
            { header: 'CI ID', accessorKey: 'id' },
            { header: 'Config Item', accessorKey: 'configItem', cell: (item: any) => <span className="font-semibold text-primary">{item.configItem}</span> },
            { header: 'Status', accessorKey: 'status' },
            { header: 'Environment', accessorKey: 'environment' },
            { header: 'Owner', accessorKey: 'owner' },
            { header: 'Version', accessorKey: 'version' },
          ],
          cardFields: [
            { label: 'CI ID', key: 'id' },
            { label: 'Version', key: 'version' },
            { label: 'Environment', key: 'environment' },
            { label: 'Owner', key: 'owner' },
          ],
          titleKey: 'configItem',
          statusKey: 'status',
        };
      case 'fast':
      default:
        return {
          title: 'Full Asset Status Tracker (FAST)',
          description: 'Comprehensive asset tracking for onboarding, maintenance, and attestation workflows.',
          data: currentData,
          columns: [
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
            { header: 'Version', accessorKey: 'version' },
          ],
          cardFields: [
            { label: 'Asset ID', key: 'id' },
            { label: 'Asset Type', key: 'assetType' },
            { label: 'Technology', key: 'technology' },
            { label: 'Onboarding Status', key: 'onboardingStatus' },
            { label: 'Maintenance Disposition', key: 'maintenanceDisposition' },
            { label: 'Connector Status', key: 'connectorStatus' },
            { label: 'CMDB Status', key: 'cmdbStatus' },
          ],
          titleKey: 'name',
          statusKey: 'onboardingStatus',
          enumFields: {
            kalmAssignee: ['Donna Paulsen', 'Sarah Jenkins', 'Rachel Zane', 'Harvey Specter', 'Mike Ross', 'Louis Litt', 'Alex Williams', 'Robert Zane'],
            onboardingStatus: ['Not Started', 'Pending', 'In Progress', 'Blocked', 'Onboarded'],
            onboardingDisposition: ['N/A', 'Approved', 'Waived', 'Pending Review', 'Rejected'],
            airDisposition: ['N/A', 'Approved', 'Waived', 'Pending Review', 'Rejected'],
            maintenanceDisposition: ['N/A', 'Approved', 'Waived', 'Pending Review', 'Rejected'],
            cmdbStatus: ['Active', 'Retired', 'Provisioning', 'Maintenance', 'Decommissioned'],
            cmdbBeingRetired: ['Yes', 'No'],
            cmdbLegalHold: ['Yes', 'No'],
            assetType: ['Application', 'Service', 'Database', 'Platform', 'Interface', 'Infrastructure'],
            technology: ['Java', 'Python', '.NET', 'Node.js', 'React', 'Angular', 'Oracle', 'SQL Server', 'PostgreSQL', 'MongoDB', 'AWS', 'Azure', 'Kubernetes'],
            connectorPattern: ['API Gateway', 'Direct Connect', 'Message Queue', 'Event Stream', 'Batch', 'Real-time', 'Hybrid'],
            connectorStatus: ['Active', 'Inactive', 'In Development', 'Deprecated', 'Pending'],
            enrollmentStatus: ['Enrolled', 'Not Enrolled', 'Pending', 'Exempted'],
            evidenceStatus: ['Complete', 'Incomplete', 'Pending Review', 'Not Required'],
            miStatus: ['On Track', 'At Risk', 'Overdue', 'Complete', 'Not Started'],
            aiStatus: ['On Track', 'At Risk', 'Overdue', 'Complete', 'Not Started'],
            reliesOnCAFederation: ['Yes', 'No', 'Partial'],
            entitlementsMissing: ['Yes', 'No'],
            membersMissing: ['Yes', 'No'],
            cisMissing: ['Yes', 'No'],
            attestationKickedOff: ['Yes', 'No'],
            attestationComplete: ['Yes', 'No'],
          } as Record<string, string[]>,
        };
    }
  };

  const config = getPageConfig();

  const visibleColumns = config.columns.filter(col => 
    columnVisibility[col.accessorKey] !== false
  );

  const visibleCardFields = config.cardFields.filter(field =>
    cardFieldVisibility[field.key] !== false
  );

  const visibleColumnCount = Object.values(columnVisibility).filter(Boolean).length;
  const totalColumnCount = config.columns.length;

  const filteredData = config.data.filter((item: any) => {
    let matchesSearch = true;
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      if (searchColumn === 'all') {
        matchesSearch = Object.values(item).some(val => 
          String(val || '').toLowerCase().includes(searchLower)
        );
      } else {
        const val = item[searchColumn];
        matchesSearch = String(val || '').toLowerCase().includes(searchLower);
      }
    }

    let matchesStatus = true;
    if (selectedStatuses.length > 0) {
      matchesStatus = selectedStatuses.includes(item.status);
    }

    let matchesColumnFilters = true;
    if (Object.keys(columnFilters).length > 0) {
      matchesColumnFilters = Object.entries(columnFilters).every(([key, allowedValues]) => {
         if (!allowedValues) return true;
         const itemValue = String(item[key] || '');
         return allowedValues.includes(itemValue);
      });
    }

    let matchesHistory = true;
    if (type === 'cmdb' && historyDate) {
       const dateStr = format(historyDate, 'yyyy-MM-dd');
       matchesHistory = item.lastUpdated === dateStr;
    }

    let matchesVersionFilter = true;
    if (type === 'fast' && !showVersionHistory) {
       matchesVersionFilter = item.isLatestVersion === true;
    }

    let matchesVersionDateRange = true;
    if (type === 'fast' && showVersionHistory && versionDateRange.from && versionDateRange.to) {
       const itemDateStr = item.lastModifiedDate;
       if (itemDateStr) {
         const dateFormats = ['MMM d, yyyy HH:mm', 'MMM d, yyyy', 'yyyy-MM-dd', 'MM/dd/yyyy'];
         let itemDate: Date | null = null;
         for (const fmt of dateFormats) {
           const parsed = parse(itemDateStr, fmt, new Date());
           if (isValid(parsed)) {
             itemDate = parsed;
             break;
           }
         }
         if (itemDate) {
           matchesVersionDateRange = isWithinInterval(itemDate, { 
             start: startOfDay(versionDateRange.from), 
             end: endOfDay(versionDateRange.to) 
           });
         }
       }
    }

    return matchesSearch && matchesStatus && matchesColumnFilters && matchesHistory && matchesVersionFilter && matchesVersionDateRange;
  }).sort((a: any, b: any) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === bValue) return 0;
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    const dateColumns = ['lastModifiedDate', 'lastConnectorDeliveryDate', 'maintenanceSLAExpiration', 
      'miLastAIRUpload', 'miDueDate', 'miOnboardingChangeDate', 'aiLastCandAAttestation', 
      'keychainAttestationKickoffDate', 'aiAttestationDueDate', 'aiOnboardingChangeDate', 'lastUpdated'];
    
    if (dateColumns.includes(sortConfig.key) && typeof aValue === 'string' && typeof bValue === 'string') {
      const dateFormats = ['MMM d, yyyy HH:mm', 'MMM d, yyyy', 'yyyy-MM-dd', 'MM/dd/yyyy'];
      let aDate: Date | null = null;
      let bDate: Date | null = null;
      
      for (const fmt of dateFormats) {
        if (!aDate) {
          const parsed = parse(aValue, fmt, new Date());
          if (isValid(parsed)) aDate = parsed;
        }
        if (!bDate) {
          const parsed = parse(bValue, fmt, new Date());
          if (isValid(parsed)) bDate = parsed;
        }
        if (aDate && bDate) break;
      }
      
      if (aDate && bDate) {
        const aTime = aDate.getTime();
        const bTime = bDate.getTime();
        if (aTime < bTime) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aTime > bTime) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const shouldPaginateByAsset = type === 'fast' && showVersionHistory;
  
  let currentData: any[];
  let totalPages: number;
  let paginationTotalItems: number;
  
  if (shouldPaginateByAsset) {
    const assetMap = new Map<string, any[]>();
    filteredData.forEach((item: any) => {
      const existing = assetMap.get(item.id) || [];
      existing.push(item);
      assetMap.set(item.id, existing);
    });
    
    const uniqueAssetIds = Array.from(assetMap.keys());
    paginationTotalItems = uniqueAssetIds.length;
    totalPages = Math.ceil(paginationTotalItems / pageSize);
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedAssetIds = uniqueAssetIds.slice(startIndex, endIndex);
    
    currentData = paginatedAssetIds.flatMap(assetId => {
      const versions = assetMap.get(assetId) || [];
      return versions.sort((a, b) => (b.version || 1) - (a.version || 1));
    });
  } else {
    paginationTotalItems = filteredData.length;
    totalPages = Math.ceil(paginationTotalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    currentData = filteredData.slice(startIndex, startIndex + pageSize);
  }

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleExportToExcel = () => {
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    
    XLSX.writeFile(wb, `${config.title.replace(/[^a-zA-Z0-9]/g, '_')}_Export_${timestamp}.xlsx`);
    
    toast({
      title: "Export Successful",
      description: `${filteredData.length} records exported to Excel.`,
      variant: "success"
    });
  };

  const applyColumnPreset = (preset: { name: string; columns: string[] | 'all' | 'default' }) => {
    const allKeys = getAllColumnKeysForType(type);
    const newVisibility: Record<string, boolean> = {};
    
    if (preset.columns === 'all') {
      allKeys.forEach(key => { newVisibility[key] = true; });
    } else if (preset.columns === 'default') {
      const defaultCols = defaultVisibleColumns[type] || [];
      allKeys.forEach(key => { newVisibility[key] = defaultCols.includes(key); });
    } else {
      allKeys.forEach(key => { newVisibility[key] = preset.columns.includes(key); });
    }
    
    setColumnVisibility(newVisibility);
  };

  const applyVersionDatePreset = (presetKey: string) => {
    setVersionDatePreset(presetKey);
    const today = new Date();
    
    switch (presetKey) {
      case 'today':
        setVersionDateRange({ from: startOfDay(today), to: endOfDay(today) });
        break;
      case 'last7days':
        setVersionDateRange({ from: subDays(today, 7), to: endOfDay(today) });
        break;
      case 'last30days':
        setVersionDateRange({ from: subDays(today, 30), to: endOfDay(today) });
        break;
      case 'thisMonth':
        setVersionDateRange({ from: startOfMonth(today), to: endOfMonth(today) });
        break;
      case 'lastMonth':
        const lastMonth = subMonths(today, 1);
        setVersionDateRange({ from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) });
        break;
      case 'all':
      default:
        setVersionDateRange({ from: undefined, to: undefined });
        break;
    }
  };

  const renderFormField = (key: string, value: any, enumOptions?: string[]) => {
    const dateFields = ['lastModifiedDate', 'lastConnectorDeliveryDate', 'maintenanceSLAExpiration', 
      'miLastAIRUpload', 'miDueDate', 'miOnboardingChangeDate', 'aiLastCandAAttestation', 
      'keychainAttestationKickoffDate', 'aiAttestationDueDate', 'aiOnboardingChangeDate',
      'deploymentLifecycleStartDate'];
    
    const isDateField = dateFields.includes(key);
    
    if (enumOptions && enumOptions.length > 0) {
      return (
        <Select
          value={value || ''}
          onValueChange={(val) => setEditFormData((prev: any) => ({ ...prev, [key]: val }))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {enumOptions.map(option => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    
    if (isDateField) {
      return (
        <div className="space-y-1">
          <Input
            value={value || ''}
            onChange={(e) => {
              const newValue = e.target.value;
              setEditFormData((prev: any) => ({ ...prev, [key]: newValue }));
              
              if (newValue && newValue.trim() !== '') {
                const dateFormats = ['MMM d, yyyy HH:mm', 'MMM d, yyyy', 'yyyy-MM-dd', 'MM/dd/yyyy'];
                let isValidDate = false;
                for (const fmt of dateFormats) {
                  const parsed = parse(newValue, fmt, new Date());
                  if (isValid(parsed)) {
                    isValidDate = true;
                    break;
                  }
                }
                if (!isValidDate) {
                  setDateFieldErrors(prev => ({ ...prev, [key]: 'Invalid date format. Use: MMM d, yyyy or yyyy-MM-dd' }));
                } else {
                  setDateFieldErrors(prev => ({ ...prev, [key]: null }));
                }
              } else {
                setDateFieldErrors(prev => ({ ...prev, [key]: null }));
              }
            }}
            placeholder="MMM d, yyyy or yyyy-MM-dd"
            className={dateFieldErrors[key] ? 'border-red-500' : ''}
          />
          {dateFieldErrors[key] && (
            <p className="text-xs text-red-500">{dateFieldErrors[key]}</p>
          )}
        </div>
      );
    }
    
    return (
      <Input
        value={value || ''}
        onChange={(e) => setEditFormData((prev: any) => ({ ...prev, [key]: e.target.value }))}
      />
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{config.title}</h1>
            <p className="text-muted-foreground mt-1">{config.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {type === 'cmdb' && (
              <Popover open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="border-border">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Check History
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="p-3 border-b">
                    <h4 className="font-medium text-sm">Select History Date</h4>
                    <p className="text-xs text-muted-foreground mt-1">View configuration as of a specific date</p>
                  </div>
                  <Calendar
                    mode="single"
                    selected={tempHistoryDate}
                    onSelect={setTempHistoryDate}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                  <div className="p-3 border-t flex justify-between gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setTempHistoryDate(undefined);
                        setHistoryDate(undefined);
                      }}
                    >
                      Clear
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => {
                        setHistoryDate(tempHistoryDate);
                        setIsHistoryOpen(false);
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
            <Button onClick={handleExportToExcel} variant="outline" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
              <Download className="mr-2 h-4 w-4" /> Export to Excel
            </Button>
            {(type === 'fast' || type === 'assets') && isAdmin && (
              <Button onClick={handleAddNew} className="bg-primary text-white hover:bg-primary/90 shadow-sm">
                 <Plus className="mr-2 h-4 w-4" /> Add New
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <Select value={searchColumn} onValueChange={setSearchColumn}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Columns" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Columns</SelectItem>
                {config.columns.map(col => (
                  <SelectItem key={col.accessorKey} value={col.accessorKey}>
                    {col.header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search across all fields..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <DropdownMenu open={isColumnSettingsOpen} onOpenChange={setIsColumnSettingsOpen}>
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
                  {(columnPresets[type] || []).map(preset => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => applyColumnPreset(preset)}
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                  {config.columns
                    .filter(col => col.header.toLowerCase().includes(columnSearchQuery.toLowerCase()))
                    .map(col => (
                      <DropdownMenuCheckboxItem
                        key={col.accessorKey}
                        checked={columnVisibility[col.accessorKey] !== false}
                        onCheckedChange={(checked) => {
                          setColumnVisibility(prev => ({
                            ...prev,
                            [col.accessorKey]: checked
                          }));
                        }}
                      >
                        {col.header}
                      </DropdownMenuCheckboxItem>
                    ))}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>

            {type === 'fast' && (
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
                <Label 
                  htmlFor="showVersionHistory" 
                  className="text-sm font-medium cursor-pointer"
                >
                  FAST History
                </Label>
              </div>
            )}

            {type === 'fast' && showVersionHistory && (
              <Popover open={isVersionDateOpen} onOpenChange={setIsVersionDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !versionDateRange.from && "text-muted-foreground"
                    )}
                  >
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
                    <Button 
                      size="sm"
                      onClick={() => setIsVersionDateOpen(false)}
                      disabled={!versionDateRange.from || !versionDateRange.to}
                    >
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
            data={currentData}
            columns={visibleColumns}
            onSort={handleSort}
            sortConfig={sortConfig}
            columnFilters={columnFilters}
            onColumnFiltersChange={(filters: Record<string, string[]>) => {
              setColumnFilters(filters);
            }}
            allData={config.data}
            expandableVersions={type === 'fast' && showVersionHistory}
            onRowClick={(item: any) => {
              if (type === 'fast' && showVersionHistory) {
                if (isAdmin && item.isLatestVersion) {
                  handleEditClick(item);
                } else {
                  handleItemClick(item);
                }
              }
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentData.map((item: any, index: number) => {
              const allVersionsForItem = type === 'fast' && showVersionHistory
                ? config.data.filter((d: any) => d.id === item.id)
                : [];
              
              return (
                <DataCard
                  key={`${item.id}-${item.version || index}`}
                  item={item}
                  titleKey={config.titleKey as keyof typeof item}
                  statusKey={config.statusKey as keyof typeof item}
                  fields={visibleCardFields as any}
                  onClick={handleItemClick}
                  showVersion={type === 'fast' && showVersionHistory}
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
          totalItems={paginationTotalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) handleCancelEdit();
          setIsDialogOpen(open);
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="text-xl flex items-center gap-2">
                {isEditing ? (selectedItem ? 'Edit Item' : 'Add New Item') : (selectedItem ? selectedItem[config.titleKey as keyof typeof selectedItem] : 'Details')}
                {selectedItem?.isFakeAsset && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                    Fake Asset
                  </span>
                )}
              </DialogTitle>
              {selectedItem && !isEditing && (
                <DialogDescription>
                  {selectedItem.id} {type === 'fast' && selectedItem.version ? `• Version ${selectedItem.version}` : ''}
                  {type === 'fast' && selectedItem.isLatestVersion && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">Latest</span>
                  )}
                </DialogDescription>
              )}
            </DialogHeader>
            
            <ScrollArea className="flex-1 pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                {isEditing ? (
                  <>
                    {Object.entries(editFormData)
                      .filter(([key]) => !['version', 'isLatestVersion', 'isFakeAsset', 'parentFastId'].includes(key))
                      .map(([key, value]) => {
                        const column = config.columns.find(c => c.accessorKey === key);
                        const enumFields = (config as any).enumFields || {};
                        const enumOptions = enumFields[key];
                        
                        return (
                          <div key={key} className="space-y-2">
                            <Label htmlFor={key} className="text-sm font-medium">
                              {column?.header || key}
                              {key === 'id' && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            {key === 'id' ? (
                              <div className="space-y-1">
                                <div className="relative">
                                  <Input
                                    id={key}
                                    value={String(value || '')}
                                    onChange={(e) => {
                                      setEditFormData((prev: any) => ({ ...prev, [key]: e.target.value }));
                                      validateAssetId(e.target.value);
                                    }}
                                    className={cn(
                                      assetIdError && "border-red-500 focus-visible:ring-red-500",
                                      assetIdAvailable && "border-green-500 focus-visible:ring-green-500"
                                    )}
                                    disabled={!!selectedItem}
                                  />
                                  {assetIdAvailable && !selectedItem && (
                                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                                  )}
                                </div>
                                {assetIdError && (
                                  <p className="text-xs text-red-500">{assetIdError}</p>
                                )}
                              </div>
                            ) : (
                              renderFormField(key, value, enumOptions)
                            )}
                          </div>
                        );
                      })}
                  </>
                ) : (
                  <>
                    {config.columns.map(col => {
                      const value = selectedItem?.[col.accessorKey];
                      return (
                        <div key={col.accessorKey} className="space-y-1">
                          <Label className="text-xs text-muted-foreground">{col.header}</Label>
                          <p className="text-sm font-medium">
                            {value || <span className="text-muted-foreground italic">Not set</span>}
                          </p>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </ScrollArea>
            
            <div className="pt-4 border-t flex justify-between">
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button variant="ghost" onClick={handleCancelEdit} className="text-muted-foreground hover:text-foreground">
                      <X className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    {isAdmin && (type === 'fast' || type === 'assets') && (
                      <>
                        {!selectedItem?.isFakeAsset && (
                          <Button variant="secondary" onClick={handleDuplicateClick}>
                            <Copy className="mr-2 h-4 w-4" /> Duplicate
                          </Button>
                        )}
                        {type === 'fast' && !selectedItem?.isFakeAsset && (
                          <Button variant="outline" onClick={handleMarkFakeAssetClick} className="text-orange-600 border-orange-300 hover:bg-orange-50">
                            <AlertTriangle className="mr-2 h-4 w-4" /> Mark as Fake Asset
                          </Button>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                ) : (
                  <>
                    {isAdmin && (type === 'fast' || type === 'assets') && selectedItem?.isLatestVersion !== false && (
                      <Button onClick={() => handleEditClick()} className="bg-primary hover:bg-primary/90">
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isDuplicateConfirmOpen} onOpenChange={setIsDuplicateConfirmOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Copy className="w-5 h-5" /> Duplicate Asset
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to duplicate "{selectedItem?.name}" ({selectedItem?.id})? 
                {type === 'fast' && ' A copy will also be added to the Fake Asset List.'}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDuplicateConfirmOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmDuplicate}>
                Confirm Duplicate
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isFakeAssetConfirmOpen} onOpenChange={setIsFakeAssetConfirmOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="w-5 h-5" /> Mark as Fake Asset
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to mark "{selectedItem?.name}" ({selectedItem?.id}) as a Fake Asset? 
                Once marked, this asset will be added to the Fake Asset List and cannot be unmarked.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsFakeAssetConfirmOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmMarkFakeAsset} className="bg-orange-600 hover:bg-orange-700">
                Confirm
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

export default DashboardContainer;
