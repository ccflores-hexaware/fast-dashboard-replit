import React, { memo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CMDBAsset } from '../../types/asset.types';
import type { ColumnDefinition } from '../../types/column.types';
import { formatDisplayValue } from '../../utils/formatters';

interface CMDBTableRowProps {
  item: CMDBAsset;
  columns: ColumnDefinition[];
  isExpanded: boolean;
  onToggleExpand: (assetId: string) => void;
  onItemClick: (item: CMDBAsset) => void;
}

export const CMDBTableRow = memo(function CMDBTableRow({
  item,
  columns,
  isExpanded,
  onToggleExpand,
  onItemClick,
}: CMDBTableRowProps) {
  return (
    <tr className="hover:bg-muted/30 transition-colors border-b border-border cursor-pointer">
      {columns.map((col, colIndex) => (
        <td 
          key={col.accessorKey} 
          className={cn(
            "text-sm border-r border-border px-4 py-3 whitespace-nowrap",
            colIndex === 0 && "sticky left-0 z-20 bg-slate-100",
            colIndex === columns.length - 1 && "border-r-0"
          )} 
          onClick={() => onItemClick(item)}
        >
          {colIndex === 0 ? (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onToggleExpand(item.id); }}
                className="p-0.5 hover:bg-muted rounded transition-colors"
                aria-label={isExpanded ? "Collapse history" : "Expand history"}
              >
                {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </button>
              <span className={col.accessorKey === 'configItem' ? 'font-semibold text-primary' : ''}>
                {formatDisplayValue(item[col.accessorKey as keyof CMDBAsset])}
              </span>
            </div>
          ) : (
            <span className={col.accessorKey === 'configItem' ? 'font-semibold text-primary' : ''}>
              {formatDisplayValue(item[col.accessorKey as keyof CMDBAsset])}
            </span>
          )}
        </td>
      ))}
    </tr>
  );
});
