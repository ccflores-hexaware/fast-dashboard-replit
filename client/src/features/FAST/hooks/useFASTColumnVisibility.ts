import { useState, useEffect, useMemo } from 'react';
import type { ColumnDefinition, ColumnVisibility, CardFieldVisibility, ColumnPreset, CardFieldDefinition } from '../types/column.types';
import { ALL_COLUMN_KEYS, ADMIN_DEFAULT_COLUMNS, VIEWER_DEFAULT_COLUMNS, DEFAULT_CARD_FIELDS, COLUMN_HEADERS, CARD_FIELDS } from '../constants/columns';
import { useUser } from '@/lib/userContext';

export interface UseFASTColumnVisibilityReturn {
  columnVisibility: ColumnVisibility;
  cardFieldVisibility: CardFieldVisibility;
  visibleColumns: ColumnDefinition[];
  visibleCardFields: CardFieldDefinition[];
  visibleColumnCount: number;
  setColumnVisibility: React.Dispatch<React.SetStateAction<ColumnVisibility>>;
  setCardFieldVisibility: React.Dispatch<React.SetStateAction<CardFieldVisibility>>;
  applyPreset: (preset: ColumnPreset) => void;
  columnSearchQuery: string;
  setColumnSearchQuery: (query: string) => void;
  allColumns: ColumnDefinition[];
  cardFields: CardFieldDefinition[];
}

export function useFASTColumnVisibility(): UseFASTColumnVisibilityReturn {
  const { isAdmin } = useUser();
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({});
  const [cardFieldVisibility, setCardFieldVisibility] = useState<CardFieldVisibility>({});
  const [columnSearchQuery, setColumnSearchQuery] = useState('');

  const defaultVisibleColumns = isAdmin ? ADMIN_DEFAULT_COLUMNS : VIEWER_DEFAULT_COLUMNS;

  useEffect(() => {
    const storageKey = `fast-column-visibility-${isAdmin ? 'admin' : 'viewer'}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setColumnVisibility(JSON.parse(saved));
      } catch {
        const v: ColumnVisibility = {};
        ALL_COLUMN_KEYS.forEach(k => { v[k] = defaultVisibleColumns.includes(k); });
        setColumnVisibility(v);
      }
    } else {
      const v: ColumnVisibility = {};
      ALL_COLUMN_KEYS.forEach(k => { v[k] = defaultVisibleColumns.includes(k); });
      setColumnVisibility(v);
    }

    const cardStorageKey = 'fast-card-field-visibility';
    const cardSaved = localStorage.getItem(cardStorageKey);
    if (cardSaved) {
      try {
        setCardFieldVisibility(JSON.parse(cardSaved));
      } catch {
        const v: CardFieldVisibility = {};
        DEFAULT_CARD_FIELDS.forEach(k => { v[k] = true; });
        setCardFieldVisibility(v);
      }
    } else {
      const v: CardFieldVisibility = {};
      DEFAULT_CARD_FIELDS.forEach(k => { v[k] = true; });
      setCardFieldVisibility(v);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (Object.keys(columnVisibility).length > 0) {
      const storageKey = `fast-column-visibility-${isAdmin ? 'admin' : 'viewer'}`;
      localStorage.setItem(storageKey, JSON.stringify(columnVisibility));
    }
  }, [columnVisibility, isAdmin]);

  useEffect(() => {
    if (Object.keys(cardFieldVisibility).length > 0) {
      localStorage.setItem('fast-card-field-visibility', JSON.stringify(cardFieldVisibility));
    }
  }, [cardFieldVisibility]);

  const allColumns: ColumnDefinition[] = useMemo(() => 
    ALL_COLUMN_KEYS.map(key => ({
      header: COLUMN_HEADERS[key],
      accessorKey: key,
    })), 
  []);

  const visibleColumns = useMemo(() => {
    if (Object.keys(columnVisibility).length === 0) {
      return allColumns.filter(col => defaultVisibleColumns.includes(col.accessorKey));
    }
    return allColumns.filter(col => columnVisibility[col.accessorKey] !== false);
  }, [allColumns, columnVisibility, defaultVisibleColumns]);

  const visibleCardFields = useMemo(() => {
    if (Object.keys(cardFieldVisibility).length === 0) {
      return CARD_FIELDS.filter(field => DEFAULT_CARD_FIELDS.includes(field.key));
    }
    return CARD_FIELDS.filter(field => cardFieldVisibility[field.key] !== false);
  }, [cardFieldVisibility]);

  const visibleColumnCount = useMemo(() => {
    if (Object.keys(columnVisibility).length === 0) {
      return defaultVisibleColumns.length;
    }
    return Object.values(columnVisibility).filter(Boolean).length;
  }, [columnVisibility, defaultVisibleColumns]);

  const applyPreset = (preset: ColumnPreset) => {
    let cols: typeof ALL_COLUMN_KEYS;
    if (preset.columns === 'all') cols = ALL_COLUMN_KEYS;
    else if (preset.columns === 'default') cols = defaultVisibleColumns;
    else cols = preset.columns;
    
    const v: ColumnVisibility = {};
    ALL_COLUMN_KEYS.forEach(k => { v[k] = cols.includes(k); });
    setColumnVisibility(v);
  };

  return {
    columnVisibility,
    cardFieldVisibility,
    visibleColumns,
    visibleCardFields,
    visibleColumnCount,
    setColumnVisibility,
    setCardFieldVisibility,
    applyPreset,
    columnSearchQuery,
    setColumnSearchQuery,
    allColumns,
    cardFields: CARD_FIELDS,
  };
}
