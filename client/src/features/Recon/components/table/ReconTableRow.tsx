import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import type { ReconAsset } from '../../types/asset.types';
import type { ColumnDefinition } from '../../types/column.types';
import { formatFieldValue } from '../../utils/formatters';

interface ReconTableRowProps {
  item: ReconAsset;
  columns: ColumnDefinition[];
  onClick: (item: ReconAsset) => void;
}

export function ReconTableRow({ item, columns, onClick }: ReconTableRowProps) {
  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => onClick(item)}
    >
      {columns.map((column) => (
        <TableCell key={String(column.accessorKey)} className="whitespace-nowrap">
          {formatFieldValue(item[column.accessorKey])}
        </TableCell>
      ))}
    </TableRow>
  );
}
