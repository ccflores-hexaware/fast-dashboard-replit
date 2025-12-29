import React from 'react';
import { CardGrid } from '@/components/CardGrid';
import type { CMDBAsset } from '../types/asset.types';
import type { CardFieldDefinition } from '../types/column.types';

interface CMDBCardGridProps {
  data: CMDBAsset[];
  fields: CardFieldDefinition[];
  onItemClick: (item: CMDBAsset) => void;
}

export function CMDBCardGrid({ data, fields, onItemClick }: CMDBCardGridProps) {
  const cardFields = fields.map(f => ({ label: f.label, key: f.key }));
  
  const handleItemClick = (item: { id: string }) => {
    onItemClick(item as CMDBAsset);
  };
  
  return (
    <CardGrid
      data={data}
      fields={cardFields}
      onItemClick={handleItemClick}
      titleKey="configItem"
      statusKey="status"
      gridCols={3}
    />
  );
}
