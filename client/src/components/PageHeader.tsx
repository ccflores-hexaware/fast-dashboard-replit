import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  description: string;
  onExport?: () => void;
  exportLabel?: string;
  children?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  description, 
  onExport, 
  exportLabel = 'Export to Excel',
  children 
}: PageHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        {children}
        {onExport && (
          <Button 
            onClick={onExport} 
            className="gap-2 text-white" 
            style={{ backgroundColor: '#3b82f6' }} 
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'} 
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
          >
            <Download className="h-4 w-4" />
            {exportLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
