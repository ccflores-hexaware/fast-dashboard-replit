export interface HistoryRecord {
  id: number | string;
  startDate: string;
  endDate: string;
  [key: string]: unknown;
}

export interface HistoryResponse<T extends HistoryRecord = HistoryRecord> {
  history: T[];
  total: number;
}

export interface HistoryCache<T extends HistoryRecord = HistoryRecord> {
  [assetId: string]: HistoryResponse<T>;
}

export interface DialogHistoryData<T extends HistoryRecord = HistoryRecord> extends HistoryResponse<T> {
  assetId: string;
}
