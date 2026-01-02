export interface ReconAsset {
  internalId: number;
  applicationname: string | null;
  accountname: string | null;
  entitlementcolumn: string | null;
  entitlementvalue: string | null;
  filepath: string | null;
  applicationstatus: string | null;
  status: string | null;
}

export interface GroupedReconAsset {
  applicationName: string;
  recordCount: number;
  records: ReconAsset[];
}

export interface GroupedPaginatedResult {
  data: GroupedReconAsset[];
  totalGroups: number;
  totalRecords: number;
  totalPages: number;
  currentPage: number;
}
