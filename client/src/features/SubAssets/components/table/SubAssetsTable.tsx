import React from 'react';
import { DataTable } from '@/components/DataTable';
import type { SubAsset } from '../../types/asset.types';

interface SubAssetsTableColumn {
  header: string;
  accessorKey: string;
  cell?: (item: SubAsset) => React.ReactNode;
}

interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc';
}

interface SubAssetsTableProps {
  data: SubAsset[];
  visibleColumns: SubAssetsTableColumn[];
  sortConfig: SortConfig | null;
  onSort: (key: string) => void;
  columnFilters: Record<string, string[]>;
  onColumnFiltersChange: (filters: Record<string, string[]>) => void;
  allData: SubAsset[];
  onRowClick: (item: SubAsset) => void;
}

export function SubAssetsTable({
  data,
  visibleColumns,
  sortConfig,
  onSort,
  columnFilters,
  onColumnFiltersChange,
  allData,
  onRowClick,
}: SubAssetsTableProps) {
  return (
    <DataTable
      data={data as any}
      columns={visibleColumns as any}
      onRowClick={onRowClick as any}
      sortConfig={sortConfig || undefined}
      onSort={onSort}
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      allData={allData as any}
    />
  );
}
