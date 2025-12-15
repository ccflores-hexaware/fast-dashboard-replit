import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from './DataTable';
import { ArrowRight, History, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataCardProps<T> {
  item: T;
  titleKey: keyof T;
  statusKey?: keyof T;
  fields: { label: string; key: keyof T; format?: (val: any) => string }[];
  onClick?: (item: T) => void;
  showVersion?: boolean;
  isLatestVersion?: boolean;
}

export function DataCard<T extends { id: string; version?: number }>({ 
  item, 
  titleKey, 
  statusKey, 
  fields, 
  onClick,
  showVersion = false,
  isLatestVersion = false
}: DataCardProps<T>) {
  const version = item.version || 1;
  
  return (
    <Card 
      className={cn(
        "hover:shadow-md transition-all cursor-pointer border-t-4 relative",
        isLatestVersion && showVersion ? "border-t-green-500 ring-2 ring-green-200" : "border-t-primary",
        !isLatestVersion && showVersion && "opacity-80 hover:opacity-100"
      )}
      onClick={() => onClick && onClick(item)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick && onClick(item);
        }
      }}
    >
      {showVersion && (
        <div className="absolute -top-0 -right-0">
          <div className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-bl-lg rounded-tr-sm text-xs font-bold shadow-sm",
            isLatestVersion 
              ? "bg-green-500 text-white" 
              : "bg-slate-200 text-slate-600"
          )}>
            {isLatestVersion ? (
              <>
                <Star className="h-3 w-3 fill-current" />
                <span>v{version} Latest</span>
              </>
            ) : (
              <>
                <History className="h-3 w-3" />
                <span>v{version}</span>
              </>
            )}
          </div>
        </div>
      )}
      <CardHeader className={cn("pb-2 flex flex-row items-start justify-between space-y-0", showVersion && "pt-8")}>
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
