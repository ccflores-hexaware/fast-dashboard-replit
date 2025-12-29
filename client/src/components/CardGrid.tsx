import React from 'react';
import { DataCard } from '@/components/DataCard';
import type { CardFieldDefinition } from '@/types/table.types';

interface CardGridProps<T = Record<string, unknown>> {
  data: T[];
  fields: CardFieldDefinition[];
  onItemClick: (item: T) => void;
  titleKey: string;
  statusKey?: string;
  gridCols?: 3 | 4;
}

export function CardGrid<T extends { id: string }>({ 
  data, 
  fields, 
  onItemClick, 
  titleKey, 
  statusKey,
  gridCols = 3 
}: CardGridProps<T>) {
  const cardFields = fields.map(f => ({
    label: f.label,
    key: f.key,
  }));

  const gridClass = gridCols === 4 
    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4";

  return (
    <div className={gridClass}>
      {data.map((item, index) => (
        <DataCard
          key={`${item.id}-${index}`}
          item={item as unknown as { id: string; version?: number }}
          titleKey={titleKey as keyof { id: string; version?: number }}
          statusKey={statusKey as keyof { id: string; version?: number } | undefined}
          fields={cardFields as { label: string; key: keyof { id: string; version?: number } }[]}
          onClick={() => onItemClick(item)}
        />
      ))}
    </div>
  );
}
