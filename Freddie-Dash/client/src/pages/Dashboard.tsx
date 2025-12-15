import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ViewToggle } from '@/components/ViewToggle';
import { DataTable, StatusBadge } from '@/components/DataTable';
import { DataCard } from '@/components/DataCard';
import { Pagination } from '@/components/Pagination';
import { mockAssets, mockTPI, mockBTO, mockCMDB, mockFAST } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Download, Plus, Save, X, Pencil, Search, Check, ChevronsUpDown, Calendar as CalendarIcon } from 'lucide-react';
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
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/lib/userContext";
import * as XLSX from 'xlsx';

interface DashboardPageProps {
  type: 'assets' | 'tpi' | 'bto' | 'cmdb' | 'fast';
}

export default function DashboardPage({ type }: DashboardPageProps) {
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

  // State to hold data so it can be edited
  const [dataMap, setDataMap] = useState({
    assets: mockAssets,
    tpi: mockTPI,
    bto: mockBTO,
    cmdb: mockCMDB,
    fast: mockFAST
  });

  // Reset pagination and selection when tab changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedItem(null);
    setIsDialogOpen(false);
    setIsEditing(false);
    setSearchQuery('');
    setSelectedStatuses([]);
    setColumnFilters({});
    setSortConfig({ key: null, direction: 'asc' });
    setHistoryDate(undefined);
    setTempHistoryDate(undefined);
    setIsHistoryOpen(false);
  }, [type]);

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
    setIsEditing(false);
  };

  const handleAddNew = () => {
    // Initialize empty form data based on columns to ensure all visible fields are present and ordered
    const emptyForm: any = {};
    
    // 1. Start with keys from columns to ensure order
    config.columns.forEach((col: any) => {
      if (col.accessorKey) {
        emptyForm[col.accessorKey] = '';
      }
    });

    // 2. Add any other keys from the data structure that might not be in columns (hidden fields)
    const currentList = dataMap[type] as any[];
    if (currentList.length > 0) {
      const templateItem = currentList[0];
      Object.keys(templateItem).forEach(key => {
        if (emptyForm[key] === undefined) {
          emptyForm[key] = '';
        }
      });
    }

    // 3. Status fallback if not in columns but required by type logic
    if (type !== 'assets' && 'status' in emptyForm && !emptyForm.status) {
       emptyForm.status = 'Active';
    } else if (type === 'assets' && 'cmdbStatus' in emptyForm && !emptyForm.cmdbStatus) {
       emptyForm.cmdbStatus = 'Active';
       emptyForm.status = 'Active'; // Keep synced
    }
    
    // Ensure ID is empty for manual entry
    emptyForm.id = '';
    
    setSelectedItem(null); // Indicates new item
    setEditFormData(emptyForm);
    setIsDialogOpen(true);
    setIsEditing(true);
  };

  const handleEditClick = (item?: any) => {
    // If an item is provided (from the action column), set it as selected first
    if (item) {
      setSelectedItem(item);
      setEditFormData({ ...item });
      setIsDialogOpen(true);
      setIsEditing(true);
    } else {
      // Otherwise we are already in the dialog, just switch to edit mode
      setEditFormData({ ...selectedItem });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsDialogOpen(false);
    setIsEditing(false);
    setEditFormData({});
  };

  const handleViewChange = (newView: 'table' | 'card') => {
    setView(newView);
    if (newView === 'card') {
      setPageSize(8); // Minimal items per page for card view to avoid scroll
    } else {
      setPageSize(10); // Standard for table
    }
    setCurrentPage(1);
  };

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current.key === key) {
        if (current.direction === 'asc') {
          return { key, direction: 'desc' };
        }
        return { key: null, direction: 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleInputChange = (key: string, value: string) => {
    setEditFormData((prev: any) => {
      const updates: any = { [key]: value };
      // Sync cmdbStatus and status for assets
      if (type === 'assets') {
          if (key === 'cmdbStatus') updates.status = value;
          if (key === 'status') updates.cmdbStatus = value;
      }
      return {
        ...prev,
        ...updates
      };
    });
  };

  const handleSave = () => {
    const currentList = dataMap[type] as any[];
    const isCreating = !selectedItem; // If no selectedItem, we are creating
    
    // Copy form data to avoid mutating state directly in the next steps
    const dataToSave = { ...editFormData };
    
    // Add audit trails
    const timestamp = format(new Date(), 'MMM d, yyyy HH:mm');
    dataToSave.lastModifiedBy = user.name;
    dataToSave.lastModifiedDate = timestamp;

    const userProvidedId = !!dataToSave.id;

    // Auto-generate ID if missing for new items
    let autoGenerated = false;
    if (isCreating && !userProvidedId && type === 'assets') {
        const randomId = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        dataToSave.id = `AST-${randomId}`;
        autoGenerated = true;
    }

    // Validate ID presence (should only happen if generation failed or not assets)
    if (!dataToSave.id) {
        toast({
          title: "Error",
          description: "ID is required.",
          variant: "destructive"
        });
        return;
    }

    if (isCreating) {
      // CREATE NEW ITEM
      // Check for uniqueness of ID
      let idExists = currentList.some(item => item.id === dataToSave.id);
      
      // If auto-generated ID conflicts, try one more time
      if (idExists && autoGenerated) {
         const randomId = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
         dataToSave.id = `AST-${randomId}`;
         idExists = currentList.some(item => item.id === dataToSave.id);
      }
      
      if (idExists) {
        toast({
          title: "Error: Duplicate ID",
          description: `ID "${dataToSave.id}" already exists. Please enter a unique ID for this new entry.`,
          variant: "destructive"
        });
        return;
      }

      // Insert new row at the top
      const newItem = { ...dataToSave };
      const updatedList = [newItem, ...currentList];

      setDataMap(prev => ({
        ...prev,
        [type]: updatedList
      }));

      // Keep dialog open, switch to read-only view of the new item
      // setIsDialogOpen(false); // Removed to keep dialog open
      setIsEditing(false);
      setSelectedItem(newItem); // Select the new item so it shows in read-only mode
      // setEditFormData({}); // Don't clear form data immediately, though selectedItem takes precedence
      
      toast({
        title: "New Entry Created",
        description: `${newItem.id} has been successfully added to the list. You can continue editing this item.`,
      });

    } else {
      // UPDATE EXISTING ITEM
      // If ID changed, check for conflict with OTHER items
      if (dataToSave.id !== selectedItem.id) {
          const idExists = currentList.some(item => item.id === dataToSave.id && item.id !== selectedItem.id);
          if (idExists) {
            toast({
              title: "Error: Duplicate ID",
              description: `ID "${dataToSave.id}" is already used by another item.`,
              variant: "destructive"
            });
            return;
          }
      }

      // Move updated item to the top
      const otherItems = currentList.filter(item => item.id !== selectedItem.id);
      const updatedList = [{ ...dataToSave }, ...otherItems];

      setDataMap(prev => ({
        ...prev,
        [type]: updatedList
      }));

      setSelectedItem(dataToSave);
      setIsEditing(false);
      
      toast({
        title: "Changes saved",
        description: `${dataToSave.id} has been successfully updated.`,
      });
    }
  };

  // Action Column Definition
  const actionColumn = {
    header: 'Action',
    cell: (item: any) => (
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-primary hover:bg-primary/10"
        onClick={(e) => {
          e.stopPropagation(); // Prevent row click if we had one
          handleEditClick(item);
        }}
        aria-label={`Edit ${item.id}`}
      >
        <Pencil className="h-4 w-4" />
      </Button>
    )
  };

  const getPageConfig = () => {
    // Use the state data instead of the import directly
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
            { header: 'Version', accessorKey: 'version' },
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
            // Removed actionColumn for TPI
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
            // Removed actionColumn for BTO
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
            // Removed actionColumn for CMDB to make it read-only
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
            { header: 'Attestation Kicked Off?', accessorKey: 'attestationKickedOff' },
            { header: 'Attestation Complete?', accessorKey: 'attestationComplete' },
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
          ],
          cardFields: [
            { label: 'Asset ID', key: 'id' },
            { label: 'KALM Assignee', key: 'kalmAssignee' },
            { label: 'Onboarding Status', key: 'onboardingStatus' },
            { label: 'CMDB Status', key: 'cmdbStatus' },
            { label: 'Technology', key: 'technology' },
            { label: 'Asset Type', key: 'assetType' },
            { label: 'Connector Status', key: 'connectorStatus' },
          ],
          titleKey: 'name',
          statusKey: 'onboardingStatus',
          editableFields: [
            'connectorStatus',
            'enrollmentStatus',
            'evidenceStatus',
            'cisMissing',
            'miStatus',
            'automationTeam',
            'onboardingDisposition',
            'onboardingSchedule',
            'reliesOnCAFederation',
            'lastConnectorDeliveryDate',
            'aiL2Assignee',
            'assetPOCs',
            'miL2Assignee',
            'kalmAssignee',
            'aiLastCandAAttestation',
            'ticketsOpened',
            'yearOnboarded',
            'monthOnboarded',
            'connectorPattern',
            'airDisposition',
            'maintenanceDisposition',
            'nameOfConnector',
            'theGap',
            'comments',
          ],
          enumFields: {
            onboardingStatus: ['Onboarded', 'In Progress', 'Pending', 'Not Started', 'Blocked'],
            onboardingDisposition: ['Approved', 'Pending Review', 'Rejected', 'N/A', 'Waived'],
            airDisposition: ['Approved', 'Pending Review', 'Rejected', 'N/A', 'Waived'],
            maintenanceDisposition: ['Approved', 'Pending Review', 'Rejected', 'N/A', 'Waived'],
            cmdbStatus: ['Active', 'Retired', 'Provisioning', 'Maintenance', 'Decommissioned'],
            cmdbBeingRetired: ['Yes', 'No'],
            cmdbLegalHold: ['Yes', 'No'],
            assetType: ['Application', 'Service', 'API', 'Database', 'Infrastructure', 'Platform'],
            monthOnboarded: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            onboardingSchedule: ['Weekly', 'Bi-Weekly', 'Monthly', 'Quarterly', 'On-Demand'],
            entitlementsMissing: ['Yes', 'No'],
            membersMissing: ['Yes', 'No'],
            cisMissing: ['Yes', 'No'],
            reliesOnCAFederation: ['Yes', 'No'],
            connectorPattern: ['REST API', 'SOAP', 'File Transfer', 'Database Direct', 'Message Queue', 'Custom'],
            automationTeam: ['Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta', 'Enterprise Ops', 'Platform Team'],
            connectorStatus: ['Active', 'Inactive', 'Pending', 'Error'],
            enrollmentStatus: ['Enrolled', 'Not Enrolled', 'Pending', 'Exempt'],
            evidenceStatus: ['Complete', 'Incomplete', 'Pending Review', 'N/A'],
            miSchedule: ['Weekly', 'Bi-Weekly', 'Monthly', 'Quarterly', 'On-Demand'],
            miStatus: ['Green', 'Yellow', 'Red', 'N/A'],
            attestationKickedOff: ['Yes', 'No'],
            attestationComplete: ['Yes', 'No'],
            aiStatus: ['Green', 'Yellow', 'Red', 'N/A'],
            technology: ['Java', '.NET', 'Python', 'Node.js', 'Angular', 'React', 'Legacy', 'Mainframe', 'Cloud Native'],
          } as Record<string, string[]>,
        };
      default:
        return {
          title: 'Dashboard',
          description: '',
          data: [],
          columns: [],
          cardFields: [],
          titleKey: 'id',
        };
    }
  };

  const rawConfig = getPageConfig();
  
  // Apply column limit for "View" role (Test User)
  // Show only first 20 columns in table and card popup
  const config = {
    ...rawConfig,
    columns: (!isAdmin && rawConfig.columns.length > 20) ? rawConfig.columns.slice(0, 20) : rawConfig.columns
  };

  // Get unique statuses for the current view
  const uniqueStatuses = Array.from(new Set(config.data.map((item: any) => item.status)));

  // Filter Data
  const filteredData = config.data.filter((item: any) => {
    // Search Filter
    let matchesSearch = true;
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      
      if (searchColumn === 'all') {
        matchesSearch = Object.values(item).some((val: any) => 
          String(val).toLowerCase().includes(searchLower)
        );
      } else {
        const val = item[searchColumn];
        matchesSearch = String(val || '').toLowerCase().includes(searchLower);
      }
    }

    // Status Filter
    let matchesStatus = true;
    if (selectedStatuses.length > 0) {
      matchesStatus = selectedStatuses.includes(item.status);
    }

    // Column Filters
    let matchesColumnFilters = true;
    if (Object.keys(columnFilters).length > 0) {
      matchesColumnFilters = Object.entries(columnFilters).every(([key, allowedValues]) => {
         if (!allowedValues) return true;
         const itemValue = String(item[key] || '');
         return allowedValues.includes(itemValue);
      });
    }

    // History Date Filter
    let matchesHistory = true;
    if (type === 'cmdb' && historyDate) {
       const dateStr = format(historyDate, 'yyyy-MM-dd');
       matchesHistory = item.lastUpdated === dateStr;
    }

    return matchesSearch && matchesStatus && matchesColumnFilters && matchesHistory;
  }).sort((a: any, b: any) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    // Handle null/undefined values
    if (aValue === bValue) return 0;
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    // String comparison (case insensitive)
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    // Number comparison
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination Logic
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = filteredData.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredData.length / pageSize);

  const renderDetailRow = (label: string, value: any) => (
    <div className="flex flex-col space-y-1 py-3 border-b border-border/50 last:border-0">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-base font-semibold text-foreground">
        {(value === undefined || value === null || value === 'undefined') ? '-' : value}
      </span>
    </div>
  );

  const renderEditRow = (key: string, value: any, isDisabled: boolean = false, headerLabel?: string) => {
    // Use header label if provided, otherwise format key for display (camelCase to Title Case)
    const label = headerLabel || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    
    // Determine if we should show a fallback for undefined values in edit mode
    // Typically for editable fields we want empty string, but for read-only audit fields we might want '-'
    const isAuditField = key === 'lastModifiedBy' || key === 'lastModifiedDate';
    const shouldDisable = isDisabled || (key === 'id' && !!selectedItem) || isAuditField;
    const displayValue = ((isAuditField || shouldDisable) && (value === undefined || value === null || value === 'undefined' || value === '')) ? '-' : value;

    // Check if this field has enum options from the config
    const enumOptions = (rawConfig as any).enumFields?.[key] as string[] | undefined;

    // If field has enum options and is not disabled, render a Select dropdown
    if (enumOptions && !shouldDisable) {
      return (
        <div className="flex flex-col space-y-2 py-3">
          <Label htmlFor={key} className="text-sm font-medium text-muted-foreground">{label}</Label>
          <Select
            value={value || ''}
            onValueChange={(newValue) => handleInputChange(key, newValue)}
          >
            <SelectTrigger id={key} className="font-semibold">
              <SelectValue placeholder={`Select ${label}`} />
            </SelectTrigger>
            <SelectContent>
              {enumOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    return (
      <div className="flex flex-col space-y-2 py-3">
        <Label htmlFor={key} className="text-sm font-medium text-muted-foreground">{label}</Label>
        <Input 
          id={key} 
          value={displayValue} 
          onChange={(e) => handleInputChange(key, e.target.value)}
          className="font-semibold"
          disabled={shouldDisable}
        />
      </div>
    );
  };

  const handleExportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${config.title.replace(/[^a-zA-Z0-9]/g, '_')}_Export.xlsx`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-primary">{config.title}</h1>
            <p className="text-muted-foreground mt-1 text-lg">{config.description}</p>
          </div>
          <div className="flex items-center gap-2">
             {/* History Check for CMDB */}
             {type === 'cmdb' && (
               <Popover open={isHistoryOpen} onOpenChange={(open) => {
                 setIsHistoryOpen(open);
                 if (open) setTempHistoryDate(historyDate);
               }}>
                 <PopoverTrigger asChild>
                   <Button variant={historyDate ? "default" : "outline"} className={cn("shadow-sm", historyDate && "bg-primary text-white hover:bg-primary/90")}>
                     <CalendarIcon className="mr-2 h-4 w-4" />
                     {historyDate ? format(historyDate, "PPP") : "Check History"}
                   </Button>
                 </PopoverTrigger>
                 <PopoverContent className="w-auto p-0 min-w-[320px]" align="end">
                   <div className="p-3 border-b border-border">
                      <h4 className="font-medium leading-none">Select Date</h4>
                   </div>
                   <Calendar
                     mode="single"
                     selected={tempHistoryDate}
                     onSelect={setTempHistoryDate}
                     disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                     initialFocus
                     captionLayout="dropdown"
                     fromYear={2020}
                     toYear={2025}
                     className="rounded-md border-0"
                   />
                   <div className="p-3 border-t border-border flex justify-between gap-2">
                     <Button variant="ghost" size="sm" onClick={() => {
                        setHistoryDate(undefined);
                        setIsHistoryOpen(false);
                     }}>
                       Clear
                     </Button>
                     <Button size="sm" onClick={() => {
                        setHistoryDate(tempHistoryDate);
                        setIsHistoryOpen(false);
                     }}>
                       Submit
                     </Button>
                   </div>
                 </PopoverContent>
               </Popover>
             )}

             <Button onClick={handleExportToExcel} className="bg-[#89c24b] text-white hover:bg-[#89c24b]/90 shadow-sm">
                <Download className="mr-2 h-4 w-4" /> Export to Excel
             </Button>
             {/* Add New Button only for Assets and Admin */}
             {type === 'assets' && isAdmin && (
               <Button onClick={handleAddNew} className="bg-primary text-white hover:bg-primary/90 shadow-sm">
                  <Plus className="mr-2 h-4 w-4" /> Add New
               </Button>
             )}
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="flex flex-col gap-4 bg-card p-4 rounded-lg border border-border shadow-sm">
          {/* Top Row: Search and Filter */}
          <div className="flex gap-2 w-full">
            <div className="relative flex-1 flex gap-2">
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-[200px] justify-between bg-background border-input"
                  >
                    <span className="truncate">
                      {searchColumn === 'all'
                        ? "All Columns"
                        : config.columns.find((col: any) => col.accessorKey === searchColumn)?.header || "Select column..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search column..." />
                    <CommandList>
                      <CommandEmpty>No column found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="All Columns"
                          onSelect={() => {
                            setSearchColumn("all");
                            setOpenCombobox(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              searchColumn === "all" ? "opacity-100" : "opacity-0"
                            )}
                          />
                          All Columns
                        </CommandItem>
                        {config.columns.map((col: any) => (
                          <CommandItem
                            key={col.accessorKey}
                            value={col.header}
                            onSelect={() => {
                              setSearchColumn(col.accessorKey);
                              setOpenCombobox(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                searchColumn === col.accessorKey ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {col.header}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder={searchColumn === 'all' ? "Search across all fields..." : `Search in ${config.columns.find((c: any) => c.accessorKey === searchColumn)?.header || 'column'}...`}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                  }}
                  className="pl-10 bg-background w-full h-9"
                />
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {view === 'card' && (
                <FilterMenu 
                  columns={config.columns as any}
                  allData={config.data as any}
                  filters={columnFilters}
                  onFiltersChange={setColumnFilters}
                />
              )}
              <ViewToggle view={view} setView={handleViewChange} />
            </div>
          </div>

          </div>

        {/* Content Area */}
        {view === 'table' ? (
          <DataTable
            data={currentData} 
            allData={config.data as any}
            columns={config.columns as any}
            onRowClick={handleItemClick}
            columnFilters={columnFilters}
            onColumnFiltersChange={setColumnFilters}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentData.map((item: any) => (
              <DataCard
                key={item.id} 
                item={item} 
                titleKey={config.titleKey as any}
                statusKey={config.statusKey as any}
                fields={config.cardFields as any}
                onClick={handleItemClick}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredData.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={view === 'card' ? [8, 12, 24, 48] : [10, 20, 50, 100]}
        />

        {/* Detail Modal */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setIsEditing(false);
        }}>
          <DialogContent className="w-full sm:max-w-lg max-h-[90vh] flex flex-col p-0 gap-0">
            <DialogHeader className="p-6 pb-2">
              <div className="flex justify-between items-center pr-8">
                <DialogTitle className="text-2xl font-bold text-primary">
                  {isEditing ? (selectedItem ? 'Edit Item' : 'Add New Item') : (selectedItem ? selectedItem[config.titleKey as keyof typeof selectedItem] : 'Details')}
                </DialogTitle>
                {/* Status indicator in header */}
                {!isEditing && selectedItem && config.statusKey && <StatusBadge status={selectedItem[config.statusKey as keyof typeof selectedItem]} />}
              </div>
              <DialogDescription>
                 {selectedItem?.id && `ID: ${selectedItem.id}`}
              </DialogDescription>
            </DialogHeader>
            
            {(selectedItem || isEditing) && (
              <div className="flex-1 overflow-y-auto px-6 min-h-0">
                <div className="flex flex-col space-y-1 pb-6 pt-2">
                   {!isEditing ? (
                     <>
                        {/* Read-Only View */}
                        {config.columns.map((col: any) => {
                           const key = col.accessorKey;
                           if (!key) return null;
                           if (['id', 'status', config.titleKey].includes(key)) return null;
                           
                           // Skip if this field is hidden (though usually columns are visible fields)
                           if ((config as any).hiddenFields?.includes(key)) return null;
                           
                           return (
                             <React.Fragment key={key}>
                               {renderDetailRow(col.header, selectedItem[key])}
                             </React.Fragment>
                           );
                        })}
                     </>
                   ) : (
                     <>
                        {/* Edit View - Render fields based on column order */}
                        {/* Manual Status field removed to respect column order */}

                        {config.columns.map((col: any) => {
                           if (!col.accessorKey) return null;
                           const key = col.accessorKey;
                           
                           // For non-assets, keep ID read-only during edit (if we were allowing edits for them)
                           // But since we are iterating columns, we just need to check if we should render input
                           if (type !== 'assets' && type !== 'fast' && key === 'id' && selectedItem) return null;
                           
                           // For FAST, check if field is in editableFields list
                           const editableFields = (config as any).editableFields;
                           const isFieldEditable = !editableFields || editableFields.includes(key);
                           
                           // If FAST and field not editable, show as disabled input
                           if (type === 'fast' && !isFieldEditable) {
                             return (
                               <React.Fragment key={key}>
                                 {renderEditRow(key, editFormData[key] !== undefined ? editFormData[key] : '', true, col.header)}
                               </React.Fragment>
                             );
                           }

                           return (
                             <React.Fragment key={key}>
                               {renderEditRow(key, editFormData[key] !== undefined ? editFormData[key] : '', false, col.header)}
                             </React.Fragment>
                           );
                        })}
                     </>
                   )}
                </div>
              </div>
            )}
            
            <div className="p-6 pt-4 border-t mt-auto bg-muted/20">
              {isEditing ? (
                <div className="flex gap-3">
                   <Button onClick={handleSave} className="w-full bg-primary hover:bg-primary/90">
                     <Save className="w-4 h-4 mr-2" /> Save Changes
                   </Button>
                   <Button variant="outline" onClick={handleCancelEdit} className="w-full">
                     <X className="w-4 h-4 mr-2" /> Close
                   </Button>
                </div>
              ) : (
                <div className="flex gap-3">
                   {type !== 'tpi' && type !== 'bto' && type !== 'cmdb' && isAdmin && <Button onClick={() => handleEditClick()} className="w-full">Edit</Button>}
                   <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full">
                     <X className="w-4 h-4 mr-2" /> Close
                   </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}
