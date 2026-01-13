export type FASTColumnKey = 
  | 'id' | 'name' | 'kalmAssignee' | 'onboardingStatus' | 'onboardingDisposition'
  | 'airDisposition' | 'maintenanceDisposition' | 'lastConnectorDeliveryDate' | 'maintenanceSLAExpiration'
  | 'technology' | 'cmdbStatus' | 'cmdbBeingRetired' | 'cmdbLegalHold' | 'ticketsOpened'
  | 'assetType' | 'yearOnboarded' | 'monthOnboarded' | 'assetPOCs' | 'onboardingSchedule'
  | 'entitlementsMissing' | 'membersMissing' | 'cisMissing' | 'reliesOnCAFederation'
  | 'connectorPattern' | 'automationTeam' | 'nameOfConnector' | 'connectorStatus'
  | 'enrollmentStatus' | 'evidenceStatus' | 'miSchedule' | 'miLastAIRUpload' | 'miDaysSince'
  | 'miDueDate' | 'miOnboardingChangeDate' | 'miL2Assignee' | 'miStatus'
  | 'attestationKickedOff' | 'attestationComplete' | 'aiLastCandAAttestation'
  | 'keychainAttestationKickoffDate' | 'aiDaysSince' | 'aiAttestationDueDate'
  | 'aiOnboardingChangeDate' | 'aiL2Assignee' | 'aiStatus' | 'theGap'
  | 'comments' | 'lastModifiedBy' | 'lastModifiedDate';

export interface ColumnDefinition {
  header: string;
  accessorKey: FASTColumnKey;
  cell?: (item: any) => React.ReactNode;
}

export interface ColumnVisibility {
  [key: string]: boolean;
}

export interface CardFieldVisibility {
  [key: string]: boolean;
}

export interface CardFieldDefinition {
  label: string;
  key: FASTColumnKey;
}

export interface ColumnPreset {
  name: string;
  columns: FASTColumnKey[] | 'all' | 'default';
}

export interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc';
}

export interface ColumnFilters {
  [key: string]: string[];
}
