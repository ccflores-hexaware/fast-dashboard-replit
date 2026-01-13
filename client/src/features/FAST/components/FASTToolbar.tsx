import React from 'react';
import { DataToolbar } from '@/components/DataToolbar';
import type { ColumnDefinition, ColumnVisibility, ColumnPreset } from '@/types/table.types';
import { COLUMN_PRESETS, ALL_COLUMN_KEYS } from '../constants/columns';

interface FASTToolbarProps {
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

export function FASTToolbar({
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
}: FASTToolbarProps) {
  return (
    <DataToolbar
      searchQuery={searchQuery}
      onSearchQueryChange={onSearchQueryChange}
      searchColumn={searchColumn}
      onSearchColumnChange={onSearchColumnChange}
      openCombobox={openCombobox}
      onOpenComboboxChange={onOpenComboboxChange}
      columns={columns}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={onColumnVisibilityChange}
      columnSearchQuery={columnSearchQuery}
      onColumnSearchQueryChange={onColumnSearchQueryChange}
      visibleColumnCount={visibleColumnCount}
      totalColumnCount={ALL_COLUMN_KEYS.length}
      presets={COLUMN_PRESETS as ColumnPreset[]}
      onApplyPreset={onApplyPreset}
      view={view}
      onViewChange={onViewChange}
    />
  );
}
