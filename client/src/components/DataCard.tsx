import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from './DataTable';
import { ArrowRight, History, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataCardProps<T> {
  item: T;
  titleKey: keyof T;
  statusKey?: keyof T;
  fields: { label: string; key: keyof T; format?: (val: any) => string }[];
  onClick?: (item: T) => void;
  showVersion?: boolean;
  isLatestVersion?: boolean;
  allVersions?: T[];
}

export function DataCard<T extends { id: string; version?: number; isLatestVersion?: boolean }>({ 
  item, 
  titleKey, 
  statusKey, 
  fields, 
  onClick,
  showVersion = false,
  isLatestVersion = false,
  allVersions = []
}: DataCardProps<T>) {
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  
  const sortedVersions = allVersions.length > 0 
    ? [...allVersions].sort((a, b) => (b.version || 1) - (a.version || 1))
    : [];
  
  const displayItem = selectedVersion !== null 
    ? sortedVersions.find(v => v.version === selectedVersion) || item
    : item;
  
  const currentVersion = displayItem.version || 1;
  const latestVersion = sortedVersions.length > 0 ? sortedVersions[0].version || 1 : item.version || 1;
  const isViewingLatest = selectedVersion === null || selectedVersion === latestVersion;
  
  return (
    <Card 
      className={cn(
        "hover:shadow-md transition-all cursor-pointer border-t-4 relative border-t-[#89c24b]",
        isLatestVersion && showVersion && "ring-2 ring-[#89c24b]/30",
        !isLatestVersion && showVersion && "opacity-80 hover:opacity-100"
      )}
      onClick={() => onClick && onClick(displayItem)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick && onClick(displayItem);
        }
      }}
    >
      {showVersion && sortedVersions.length > 0 && (
        <div className="px-4 pt-3 pb-2 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Version:</span>
            <Select
              value={selectedVersion?.toString() || latestVersion.toString()}
              onValueChange={(value) => {
                setSelectedVersion(parseInt(value));
              }}
            >
              <SelectTrigger 
                className="h-7 w-auto min-w-[100px] text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent onClick={(e) => e.stopPropagation()} className="max-h-48 overflow-y-auto">
                {sortedVersions.map((v) => {
                  const ver = v.version || 1;
                  const isLatest = v.isLatestVersion;
                  return (
                    <SelectItem key={ver} value={ver.toString()} className="text-xs">
                      <span className="flex items-center gap-2">
                        v{ver}
                        {isLatest && (
                          <Badge variant="outline" className="h-4 text-[10px] px-1 bg-green-50 text-green-700 border-green-300">
                            Latest
                          </Badge>
                        )}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">
              ({sortedVersions.length} total)
            </span>
          </div>
        </div>
      )}
      
      <CardHeader className={cn(
        "pb-2 flex flex-row items-start justify-between space-y-0", 
        showVersion && sortedVersions.length > 0 && "pt-2"
      )}>
        <CardTitle className="text-lg font-bold text-primary truncate pr-4">
          {String(displayItem[titleKey])}
        </CardTitle>
        {statusKey && <StatusBadge status={String(displayItem[statusKey])} />}
      </CardHeader>
      <CardContent className="pt-2">
        <dl className="space-y-2 text-sm">
          {fields.map((field) => (
            <div key={`${displayItem.id}-${String(field.key)}-${currentVersion}`} className="flex justify-between">
              <dt className="text-muted-foreground font-medium">{field.label}:</dt>
              <dd className="text-right font-semibold text-foreground">
                {field.format 
                  ? field.format(displayItem[field.key]) 
                  : String(displayItem[field.key] ?? '')
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
