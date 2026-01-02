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
  
  const handleItemClick = (item: { id: string }) => {
    onItemClick(item as ReconAsset);
  };
  
  return (
    <CardGrid
      data={data}
      fields={cardFields}
      onItemClick={handleItemClick}
      titleKey="applicationname"
      statusKey="status"
      gridCols={4}
    />
  );
}
