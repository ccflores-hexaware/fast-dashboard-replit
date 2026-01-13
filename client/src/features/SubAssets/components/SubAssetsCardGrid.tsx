import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from '@/components/DataTable';
import type { SubAsset } from '../types/asset.types';
import type { CardFieldDefinition } from '@/types/table.types';

interface SubAssetsCardGridProps {
  data: SubAsset[];
  visibleCardFields: CardFieldDefinition[];
  onItemClick: (item: SubAsset) => void;
}

export function SubAssetsCardGrid({ data, visibleCardFields, onItemClick }: SubAssetsCardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.map((item, index) => (
        <Card 
          key={`${item.internalId}-${index}`}
          className="hover:shadow-md transition-all cursor-pointer border-t-4 border-t-[#89c24b]"
          onClick={() => onItemClick(item)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onItemClick(item);
            }
          }}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base font-semibold line-clamp-2">
                {item.name || item.assetId || '-'}
              </CardTitle>
              {item.cmdbStatus && <StatusBadge status={item.cmdbStatus} />}
            </div>
          </CardHeader>
          <CardContent>
            <dl className="space-y-1 text-sm">
              {visibleCardFields.slice(0, 7).map(field => {
                const value = item[field.key as keyof SubAsset];
                return (
                  <div key={field.key} className="flex justify-between">
                    <dt className="text-muted-foreground">{field.label}:</dt>
                    <dd className="font-medium text-right truncate max-w-[60%]">
                      {value !== null && value !== undefined && value !== '' ? String(value) : '-'}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
