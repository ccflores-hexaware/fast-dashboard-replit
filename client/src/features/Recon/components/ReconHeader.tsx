import React from 'react';
import { PageHeader } from '@/components/PageHeader';

interface ReconHeaderProps {
  onExport: () => void;
}

export function ReconHeader({ onExport }: ReconHeaderProps) {
  return (
    <PageHeader
      title="Recon"
      description="View and analyze reconciliation data"
      onExport={onExport}
    />
  );
}
