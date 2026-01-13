import React from 'react';
import { DataTable } from '@/components/DataTable';
import type { FASTAsset } from '../../types/asset.types';

interface FASTTableColumn {
  header: string;
  accessorKey: string;
  cell?: (item: FASTAsset) => React.ReactNode;
}

interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc';
}

interface FASTTableProps {
  data: FASTAsset[];
  visibleColumns: FASTTableColumn[];
  sortConfig: SortConfig | null;
  onSort: (key: string) => void;
  columnFilters: Record<string, string[]>;
  onColumnFiltersChange: (filters: Record<string, string[]>) => void;
  allData: FASTAsset[];
  onRowClick: (item: FASTAsset) => void;
  isAdmin: boolean;
  onEditClick: (item: FASTAsset) => void;
}

export function FASTTable({
  data,
  visibleColumns,
  sortConfig,
  onSort,
  columnFilters,
  onColumnFiltersChange,
  allData,
  onRowClick,
  isAdmin,
  onEditClick,
}: FASTTableProps) {
  const columnsWithClickHandler = visibleColumns.map(col => {
    if (col.accessorKey === 'id') {
      return {
        ...col,
        cell: (item: FASTAsset) => (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (isAdmin) {
                onEditClick(item);
              } else {
                onRowClick(item);
              }
            }}
            className="text-primary hover:underline font-bold underline decoration-2 underline-offset-2 hover:text-primary/80 transition-colors"
          >
            {item.id}
          </button>
        )
      };
    }
    if (col.accessorKey === 'name') {
      return {
        ...col,
        cell: (item: FASTAsset) => <span className="font-semibold text-primary">{item.name}</span>
      };
    }
    return col;
  });

  return (
    <DataTable
      data={data as any}
      columns={columnsWithClickHandler as any}
      onRowClick={onRowClick as any}
      sortConfig={sortConfig || undefined}
      onSort={onSort}
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      allData={allData as any}
    />
  );
}
