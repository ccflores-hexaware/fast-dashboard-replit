import React from 'react';
import { Clock } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { FieldChange, formatHistoryDate } from '@/lib/fieldVersionHistory';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FieldHistoryIndicatorProps {
  fieldKey: string;
  fieldLabel: string;
  history: FieldChange[] | undefined;
}

export function FieldHistoryIndicator({ fieldKey, fieldLabel, history }: FieldHistoryIndicatorProps) {
  if (!history || history.length === 0) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="inline-flex items-center justify-center w-5 h-5 rounded-full hover:bg-muted text-muted-foreground hover:text-primary transition-colors ml-1"
          title={`View ${history.length} change${history.length > 1 ? 's' : ''} to ${fieldLabel}`}
        >
          <Clock className="w-3.5 h-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="px-4 py-3 border-b bg-muted/50">
          <h4 className="font-semibold text-sm">Change History</h4>
          <p className="text-xs text-muted-foreground mt-0.5">{fieldLabel}</p>
        </div>
        <div className="max-h-64 overflow-y-auto">
          <div className="p-2">
            {history.map((change, index) => (
              <div
                key={index}
                className="p-3 rounded-lg hover:bg-muted/50 transition-colors border-l-2 border-primary/30 ml-2 mb-2 last:mb-0"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-foreground">
                    {change.changedBy}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatHistoryDate(change.changedAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded text-xs line-through">
                    {change.oldValue ?? 'Empty'}
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium">
                    {change.newValue ?? 'Empty'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="px-4 py-2 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            {history.length} change{history.length > 1 ? 's' : ''} recorded
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
