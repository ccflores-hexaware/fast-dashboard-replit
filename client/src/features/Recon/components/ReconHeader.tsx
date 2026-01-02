import React from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';

interface ReconHeaderProps {
  onExport: () => void;
}

export function ReconHeader({ onExport }: ReconHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Recon</h2>
        <p className="text-sm text-muted-foreground">View and analyze reconciliation data</p>
      </div>
      <Button onClick={onExport} variant="default">
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        Export to Excel
      </Button>
    </div>
  );
}
