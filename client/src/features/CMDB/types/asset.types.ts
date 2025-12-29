export interface CMDBAsset {
  internalId: number;
  id: string;
  configItem: string;
  version: string;
  environment: string;
  status: string;
  owner: string;
  lastUpdated: string;
  createdAt: string;
}

export interface CMDBHistoryRecord extends CMDBAsset {
  historyId: number;
  cmdbAssetId: string;
  startDate: string;
  endDate: string;
}

export interface CMDBHistoryData {
  history: CMDBHistoryRecord[];
  total: number;
}

export interface CMDBHistoryCache {
  [assetId: string]: CMDBHistoryData;
}

export interface DialogHistoryData extends CMDBHistoryData {
  assetId: string;
}
