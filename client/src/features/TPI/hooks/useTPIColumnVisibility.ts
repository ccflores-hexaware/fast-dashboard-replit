import { useState, useEffect, useMemo } from 'react';
import type { ColumnDefinition, ColumnVisibility, CardFieldVisibility, ColumnPreset, CardFieldDefinition } from '../types/column.types';
import type { UseTPIColumnVisibilityReturn } from '../types/state.types';
import { ALL_COLUMN_KEYS, DEFAULT_COLUMNS, DEFAULT_CARD_FIELDS, COLUMN_HEADERS, CARD_FIELDS } from '../constants/columns';
import { useUser } from '@/lib/userContext';

export function useTPIColumnVisibility(): UseTPIColumnVisibilityReturn {
  const { isAdmin } = useUser();
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({});
  const [cardFieldVisibility, setCardFieldVisibility] = useState<CardFieldVisibility>({});
  const [columnSearchQuery, setColumnSearchQuery] = useState('');

  useEffect(() => {
    const storageKey = `tpi-column-visibility-${isAdmin ? 'admin' : 'viewer'}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setColumnVisibility(JSON.parse(saved));
      } catch {
        const v: ColumnVisibility = {};
        ALL_COLUMN_KEYS.forEach(k => { v[k] = DEFAULT_COLUMNS.includes(k); });
        setColumnVisibility(v);
      }
    } else {
      const v: ColumnVisibility = {};
      ALL_COLUMN_KEYS.forEach(k => { v[k] = DEFAULT_COLUMNS.includes(k); });
      setColumnVisibility(v);
    }

    const cardSaved = localStorage.getItem('tpi-card-field-visibility');
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
      localStorage.setItem(`tpi-column-visibility-${isAdmin ? 'admin' : 'viewer'}`, JSON.stringify(columnVisibility));
    }
  }, [columnVisibility, isAdmin]);

  useEffect(() => {
    if (Object.keys(cardFieldVisibility).length > 0) {
      localStorage.setItem('tpi-card-field-visibility', JSON.stringify(cardFieldVisibility));
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
      return allColumns.filter(col => DEFAULT_COLUMNS.includes(col.accessorKey));
    }
    return allColumns.filter(col => columnVisibility[col.accessorKey] !== false);
  }, [allColumns, columnVisibility]);

  const visibleCardFields = useMemo(() => {
    if (Object.keys(cardFieldVisibility).length === 0) {
      return CARD_FIELDS.filter(field => DEFAULT_CARD_FIELDS.includes(field.key));
    }
    return CARD_FIELDS.filter(field => cardFieldVisibility[field.key] !== false);
  }, [cardFieldVisibility]);

  const visibleColumnCount = useMemo(() => {
    if (Object.keys(columnVisibility).length === 0) {
      return DEFAULT_COLUMNS.length;
    }
    return Object.values(columnVisibility).filter(Boolean).length;
  }, [columnVisibility]);

  const applyPreset = (preset: ColumnPreset) => {
    let cols: (keyof typeof COLUMN_HEADERS)[];
    if (preset.columns === 'all') cols = ALL_COLUMN_KEYS;
    else if (preset.columns === 'default') cols = DEFAULT_COLUMNS;
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
  };
}
