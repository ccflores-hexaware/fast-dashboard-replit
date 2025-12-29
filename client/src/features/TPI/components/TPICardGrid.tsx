import React from 'react';
import { DataCard } from '@/components/DataCard';
import type { TPIAsset } from '../types/asset.types';
import type { CardFieldDefinition } from '../types/column.types';

interface TPICardGridProps {
  data: TPIAsset[];
  fields: CardFieldDefinition[];
  onItemClick: (item: TPIAsset) => void;
}

export function TPICardGrid({ data, fields, onItemClick }: TPICardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.map((item: TPIAsset, index: number) => (
        <DataCard 
          key={`${item.id}-${index}`} 
          item={item as any} 
          titleKey={"name" as any}
          statusKey={"cmdbStatus" as any}
          fields={fields as any} 
          onClick={onItemClick as any} 
        />
      ))}
    </div>
  );
}
