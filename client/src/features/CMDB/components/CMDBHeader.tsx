import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface CMDBHeaderProps {
  onExport: () => void;
}

export function CMDBHeader({ onExport }: CMDBHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuration Management Database (CMDB)</h1>
        <p className="text-muted-foreground mt-1">View configuration items, versions, and operational status.</p>
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
