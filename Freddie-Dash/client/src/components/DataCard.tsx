import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from './DataTable';
import { ArrowRight } from 'lucide-react';

interface DataCardProps<T> {
  item: T;
  titleKey: keyof T;
  statusKey?: keyof T;
  fields: { label: string; key: keyof T; format?: (val: any) => string }[];
  onClick?: (item: T) => void;
}

export function DataCard<T extends { id: string }>({ item, titleKey, statusKey, fields, onClick }: DataCardProps<T>) {
  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer border-t-4 border-t-primary"
      onClick={() => onClick && onClick(item)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick && onClick(item);
        }
      }}
    >
      <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
        <CardTitle className="text-lg font-bold text-primary truncate pr-4">
          {String(item[titleKey])}
        </CardTitle>
        {statusKey && <StatusBadge status={String(item[statusKey])} />}
      </CardHeader>
      <CardContent className="pt-2">
        <dl className="space-y-2 text-sm">
          {fields.map((field) => (
            <div key={`${item.id}-${String(field.key)}`} className="flex justify-between">
              <dt className="text-muted-foreground font-medium">{field.label}:</dt>
              <dd className="text-right font-semibold text-foreground">
                {field.format 
                  ? field.format(item[field.key]) 
                  : String(item[field.key])
                }
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
      <CardFooter className="pt-2 pb-4">
        <div className="w-full flex justify-end text-primary text-sm font-semibold group">
          <span className="flex items-center group-hover:underline">
            View Details <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
