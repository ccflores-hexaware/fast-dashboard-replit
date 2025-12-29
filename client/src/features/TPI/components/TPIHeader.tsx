import React from 'react';
import { PageHeader } from '@/components/PageHeader';

interface TPIHeaderProps {
  onExport: () => void;
}

export function TPIHeader({ onExport }: TPIHeaderProps) {
  return (
    <PageHeader
      title="Technology Portfolio Insight (TPI)"
      description="Monitor integration status and detailed configuration attributes."
      onExport={onExport}
    />
  );
}
