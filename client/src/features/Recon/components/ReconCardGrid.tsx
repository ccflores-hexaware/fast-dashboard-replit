import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ReconAsset } from '../types/asset.types';
import type { CardFieldDefinition } from '../types/column.types';
import { formatFieldValue } from '../utils/formatters';
import { cn } from '@/lib/utils';

interface ReconCardGridProps {
  data: ReconAsset[];
  fields: CardFieldDefinition[];
  onItemClick: (item: ReconAsset) => void;
}

export function ReconCardGrid({ data, fields, onItemClick }: ReconCardGridProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-muted-foreground">
          <h3 className="text-lg font-semibold">No Records Found</h3>
          <p className="text-sm mt-1">Try adjusting your filters or search criteria</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.map((item) => (
        <Card
          key={item.id}
          className={cn(
            "cursor-pointer hover:shadow-md transition-all border-t-4 border-t-[#89c24b]"
          )}
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
              <CardTitle className="text-sm font-semibold line-clamp-1">
                {item.applicationname || item.id}
              </CardTitle>
              {item.status && (
                <Badge variant="secondary" className="text-xs shrink-0">
                  {item.status}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <dl className="space-y-1 text-sm">
              {fields.filter(f => f.key !== 'applicationname' && f.key !== 'status').slice(0, 5).map((field) => (
                <div key={String(field.key)} className="flex justify-between gap-2">
                  <dt className="text-muted-foreground truncate">{field.label}:</dt>
                  <dd className="font-medium text-right truncate">
                    {formatFieldValue(item[field.key])}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
