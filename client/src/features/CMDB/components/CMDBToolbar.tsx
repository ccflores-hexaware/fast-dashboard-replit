import React from 'react';
import { DataToolbar } from '@/components/DataToolbar';
import type { ColumnDefinition, ColumnVisibility, ColumnPreset } from '../types/column.types';
import { COLUMN_PRESETS, ALL_COLUMN_KEYS } from '../constants/columns';

interface CMDBToolbarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  searchColumn: string;
  onSearchColumnChange: (column: string) => void;
  openCombobox: boolean;
  onOpenComboboxChange: (open: boolean) => void;
  columns: ColumnDefinition[];
  columnVisibility: ColumnVisibility;
  onColumnVisibilityChange: React.Dispatch<React.SetStateAction<ColumnVisibility>>;
  columnSearchQuery: string;
  onColumnSearchQueryChange: (query: string) => void;
  visibleColumnCount: number;
  onApplyPreset: (preset: ColumnPreset) => void;
  view: 'table' | 'card';
  onViewChange: (view: 'table' | 'card') => void;
}

export function CMDBToolbar({
  searchQuery,
  onSearchQueryChange,
  searchColumn,
  onSearchColumnChange,
  openCombobox,
  onOpenComboboxChange,
  columns,
  columnVisibility,
  onColumnVisibilityChange,
  columnSearchQuery,
  onColumnSearchQueryChange,
  visibleColumnCount,
  onApplyPreset,
  view,
  onViewChange,
}: CMDBToolbarProps) {
  const sharedColumns = columns.map(col => ({ header: col.header, accessorKey: col.accessorKey }));
  const sharedPresets = COLUMN_PRESETS.map(p => ({ name: p.name, columns: p.columns }));
  
  return (
    <DataToolbar
      searchQuery={searchQuery}
      onSearchQueryChange={onSearchQueryChange}
      searchColumn={searchColumn}
      onSearchColumnChange={onSearchColumnChange}
      openCombobox={openCombobox}
      onOpenComboboxChange={onOpenComboboxChange}
      columns={sharedColumns}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={onColumnVisibilityChange}
      columnSearchQuery={columnSearchQuery}
      onColumnSearchQueryChange={onColumnSearchQueryChange}
      visibleColumnCount={visibleColumnCount}
      totalColumnCount={ALL_COLUMN_KEYS.length}
      presets={sharedPresets}
      onApplyPreset={(preset) => onApplyPreset(preset as ColumnPreset)}
      view={view}
      onViewChange={onViewChange}
    />
  );
}
