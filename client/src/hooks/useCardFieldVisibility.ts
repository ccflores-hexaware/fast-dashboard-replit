import { useState, useEffect, useMemo } from 'react';

interface Field {
  key: string;
  label: string;
}

interface UseCardFieldVisibilityOptions {
  storageKey: string;
  allFields: Field[];
  defaultVisibleFields: string[];
  maxFields?: number;
}

interface UseCardFieldVisibilityReturn {
  fieldVisibility: Record<string, boolean>;
  setFieldVisibility: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  visibleFields: Field[];
  visibleCount: number;
  maxFields: number;
  canAddMore: boolean;
  toggleField: (key: string) => void;
  resetToDefault: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function useCardFieldVisibility(
  options: UseCardFieldVisibilityOptions
): UseCardFieldVisibilityReturn {
  const { storageKey, allFields, defaultVisibleFields, maxFields = 7 } = options;
  
  const [fieldVisibility, setFieldVisibility] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        const visibility: Record<string, boolean> = {};
        allFields.forEach(field => {
          visibility[field.key] = defaultVisibleFields.includes(field.key);
        });
        return visibility;
      }
    }
    const visibility: Record<string, boolean> = {};
    allFields.forEach(field => {
      visibility[field.key] = defaultVisibleFields.includes(field.key);
    });
    return visibility;
  });

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (Object.keys(fieldVisibility).length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(fieldVisibility));
    }
  }, [fieldVisibility, storageKey]);

  const visibleFields = useMemo(() => {
    return allFields.filter(field => fieldVisibility[field.key]);
  }, [allFields, fieldVisibility]);

  const visibleCount = Object.values(fieldVisibility).filter(Boolean).length;
  const canAddMore = visibleCount < maxFields;

  const toggleField = (key: string) => {
    setFieldVisibility(prev => {
      const isCurrentlyVisible = prev[key];
      if (!isCurrentlyVisible && visibleCount >= maxFields) {
        return prev;
      }
      return {
        ...prev,
        [key]: !isCurrentlyVisible
      };
    });
  };

  const resetToDefault = () => {
    const visibility: Record<string, boolean> = {};
    allFields.forEach(field => {
      visibility[field.key] = defaultVisibleFields.includes(field.key);
    });
    setFieldVisibility(visibility);
  };

  return {
    fieldVisibility,
    setFieldVisibility,
    visibleFields,
    visibleCount,
    maxFields,
    canAddMore,
    toggleField,
    resetToDefault,
    searchQuery,
    setSearchQuery,
  };
}
