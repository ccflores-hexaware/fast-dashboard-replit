import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TPIHeaderProps {
  onExport: () => void;
}

export function TPIHeader({ onExport }: TPIHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Technology Portfolio Insight (TPI)</h1>
        <p className="text-muted-foreground mt-1">Monitor integration status and detailed configuration attributes.</p>
      </div>
      <Button 
        onClick={onExport} 
        className="gap-2 text-white" 
        style={{ backgroundColor: '#89c24b' }} 
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7ab043'} 
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#89c24b'}
      >
        <Download className="h-4 w-4" />
        Export to Excel
      </Button>
    </div>
  );
}
