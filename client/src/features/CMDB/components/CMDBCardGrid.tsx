import React from 'react';
import { DataCard } from '@/components/DataCard';
import type { CMDBAsset } from '../types/asset.types';
import type { CardFieldDefinition } from '../types/column.types';

interface CMDBCardGridProps {
  data: CMDBAsset[];
  fields: CardFieldDefinition[];
  onItemClick: (item: CMDBAsset) => void;
}

type CMDBCardItem = CMDBAsset & { id: string; version?: number };

export function CMDBCardGrid({ data, fields, onItemClick }: CMDBCardGridProps) {
  const cardFields = fields.map(f => ({
    label: f.label,
    key: f.key as keyof CMDBCardItem,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((item) => {
        const cardItem = item as CMDBCardItem;
        return (
          <DataCard
            key={cardItem.id}
            item={cardItem}
            titleKey="configItem"
            statusKey="status"
            fields={cardFields}
            onClick={() => onItemClick(item)}
          />
        );
      })}
    </div>
  );
}
