import React from 'react';
import { CardGrid } from '@/components/CardGrid';
import type { TPIAsset } from '../types/asset.types';
import type { CardFieldDefinition } from '../types/column.types';

interface TPICardGridProps {
  data: TPIAsset[];
  fields: CardFieldDefinition[];
  onItemClick: (item: TPIAsset) => void;
}

export function TPICardGrid({ data, fields, onItemClick }: TPICardGridProps) {
  const cardFields = fields.map(f => ({ label: f.label, key: f.key }));
  
  const handleItemClick = (item: { id: string }) => {
    onItemClick(item as TPIAsset);
  };
  
  return (
    <CardGrid
      data={data}
      fields={cardFields}
      onItemClick={handleItemClick}
      titleKey="name"
      statusKey="cmdbStatus"
      gridCols={4}
    />
  );
}
