import React from 'react';
import { cn } from '@/lib/utils';
import type { ReconAsset } from '../../types/asset.types';
import type { ColumnDefinition } from '../../types/column.types';

interface ReconTableRowProps {
  item: ReconAsset;
  visibleColumns: ColumnDefinition[];
  onItemClick: (item: ReconAsset) => void;
}

export const ReconTableRow = React.memo(function ReconTableRow({
  item,
  visibleColumns,
  onItemClick,
}: ReconTableRowProps) {
  return (
    <tr className="hover:bg-muted/30 transition-colors border-b border-border cursor-pointer">
      {visibleColumns.map((col, colIndex) => (
        <td 
          key={String(col.accessorKey)} 
          className={cn(
            "text-sm border-r border-border px-4 py-3 whitespace-nowrap", 
            colIndex === 0 && "sticky left-0 z-20 bg-slate-100", 
            colIndex === visibleColumns.length - 1 && "border-r-0"
          )} 
          onClick={() => onItemClick(item)}
        >
          {colIndex === 0 || col.accessorKey === 'applicationname' ? (
            <span className="font-semibold text-primary">{item[col.accessorKey] ?? '—'}</span>
          ) : (
            <span>{item[col.accessorKey] ?? '—'}</span>
          )}
        </td>
      ))}
    </tr>
  );
});
