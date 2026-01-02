import React from 'react';
import { CardGrid } from '@/components/CardGrid';
import type { ReconAsset } from '../types/asset.types';
import type { CardFieldDefinition } from '../types/column.types';

interface ReconCardGridProps {
  data: ReconAsset[];
  fields: CardFieldDefinition[];
  onItemClick: (item: ReconAsset) => void;
}

export function ReconCardGrid({ data, fields, onItemClick }: ReconCardGridProps) {
  const cardFields = fields.map(f => ({ label: f.label, key: f.key }));
  
  const dataWithId = data.map(item => ({
    ...item,
    id: String(item.internalId),
  }));
  
  const handleItemClick = (item: { id: string }) => {
    const originalItem = data.find(d => d.internalId === Number(item.id));
    if (originalItem) {
      onItemClick(originalItem);
    }
  };
  
  return (
    <CardGrid
      data={dataWithId}
      fields={cardFields}
      onItemClick={handleItemClick}
      titleKey="applicationname"
      statusKey="status"
      gridCols={4}
    />
  );
}
