import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TPIAsset } from '../../types/asset.types';
import type { ColumnDefinition } from '../../types/column.types';

interface TPITableRowProps {
  item: TPIAsset;
  visibleColumns: ColumnDefinition[];
  isExpanded: boolean;
  onToggleExpand: (assetId: string) => void;
  onItemClick: (item: TPIAsset) => void;
}

export const TPITableRow = React.memo(function TPITableRow({
  item,
  visibleColumns,
  isExpanded,
  onToggleExpand,
  onItemClick,
}: TPITableRowProps) {
  return (
    <tr className="hover:bg-muted/30 transition-colors border-b border-border cursor-pointer">
      {visibleColumns.map((col, colIndex) => (
        <td 
          key={col.accessorKey} 
          className={cn(
            "text-sm border-r border-border px-4 py-3 whitespace-nowrap", 
            colIndex === 0 && "sticky left-0 z-20 bg-slate-100", 
            colIndex === visibleColumns.length - 1 && "border-r-0"
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
              <span className="font-semibold text-primary">{item[col.accessorKey] ?? '—'}</span>
            </div>
          ) : (
            col.accessorKey === 'name' ? (
              <span className="font-semibold text-primary">{item[col.accessorKey] ?? '—'}</span>
            ) : (
              <span>{item[col.accessorKey] ?? '—'}</span>
            )
          )}
        </td>
      ))}
    </tr>
  );
});
