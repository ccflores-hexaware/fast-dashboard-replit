import { useState, useMemo, useCallback, useEffect } from 'react';
import type { ReconAsset } from '../types/asset.types';
import type { ColumnDefinition, CardFieldDefinition } from '../types/column.types';
import type { UseReconColumnVisibilityReturn } from '../types/state.types';
import { 
  ALL_COLUMN_KEYS, 
  DEFAULT_COLUMNS, 
  COLUMN_HEADERS, 
  CARD_FIELDS,
  DEFAULT_CARD_FIELDS 
} from '../constants/columns';

const STORAGE_KEY = 'recon-column-visibility';

export function useReconColumnVisibility(): UseReconColumnVisibilityReturn {
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore parse errors
    }
    const initial: Record<string, boolean> = {};
    ALL_COLUMN_KEYS.forEach(key => {
      initial[key] = DEFAULT_COLUMNS.includes(key);
    });
    return initial;
  });

  const [columnSearchQuery, setColumnSearchQuery] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(columnVisibility));
    } catch {
      // Ignore storage errors
    }
  }, [columnVisibility]);

  const visibleColumns = useMemo((): ColumnDefinition[] => {
    return ALL_COLUMN_KEYS
      .filter(key => columnVisibility[key])
      .map(key => ({
        header: COLUMN_HEADERS[key],
        accessorKey: key,
      }));
  }, [columnVisibility]);

  const visibleCardFields = useMemo((): CardFieldDefinition[] => {
    const visibleKeys = ALL_COLUMN_KEYS.filter(key => columnVisibility[key]);
    const cardFieldKeys = visibleKeys.length > 0 
      ? visibleKeys.slice(0, 7)
      : DEFAULT_CARD_FIELDS;
    
    return cardFieldKeys.map(key => ({
      label: COLUMN_HEADERS[key],
      key,
    }));
  }, [columnVisibility]);

  const visibleColumnCount = useMemo(() => {
    return Object.values(columnVisibility).filter(Boolean).length;
  }, [columnVisibility]);

  const applyPreset = useCallback((preset: 'default' | 'all' | (keyof ReconAsset)[]) => {
    const newVisibility: Record<string, boolean> = {};
    
    if (preset === 'default') {
      ALL_COLUMN_KEYS.forEach(key => {
        newVisibility[key] = DEFAULT_COLUMNS.includes(key);
      });
    } else if (preset === 'all') {
      ALL_COLUMN_KEYS.forEach(key => {
        newVisibility[key] = true;
      });
    } else if (Array.isArray(preset)) {
      ALL_COLUMN_KEYS.forEach(key => {
        newVisibility[key] = preset.includes(key);
      });
    }
    
    setColumnVisibility(newVisibility);
  }, []);

  return {
    columnVisibility,
    setColumnVisibility,
    visibleColumns,
    visibleCardFields,
    columnSearchQuery,
    setColumnSearchQuery,
    visibleColumnCount,
    applyPreset,
  };
}
