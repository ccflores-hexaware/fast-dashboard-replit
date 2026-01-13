import React from 'react';
import { PageHeader } from '@/components/PageHeader';

interface FASTHeaderProps {
  onExport: () => void;
}

export function FASTHeader({ onExport }: FASTHeaderProps) {
  return (
    <PageHeader
      title="FAST Dashboard"
      description="Manage and track assets with detailed attributes and status information."
      onExport={onExport}
    />
  );
}
