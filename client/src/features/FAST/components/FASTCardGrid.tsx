import React from 'react';
import { DataCard } from '@/components/DataCard';
import type { FASTAsset } from '../types/asset.types';
import type { CardFieldDefinition } from '../types/column.types';

interface FASTCardGridProps {
  data: FASTAsset[];
  visibleCardFields: CardFieldDefinition[];
  onItemClick: (item: FASTAsset) => void;
}

export function FASTCardGrid({ data, visibleCardFields, onItemClick }: FASTCardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.map((item, index) => (
        <DataCard
          key={`${item.internalId}-${index}`}
          item={item}
          titleKey="name"
          statusKey="onboardingStatus"
          fields={visibleCardFields as any}
          onClick={() => onItemClick(item)}
        />
      ))}
    </div>
  );
}
