import React from 'react';
import { PageHeader } from '@/components/PageHeader';

interface SubAssetsHeaderProps {
  onExport: () => void;
}

export function SubAssetsHeader({ onExport }: SubAssetsHeaderProps) {
  return (
    <PageHeader
      title="Sub-assets"
      description="Manage sub-assets derived from FAST assets with detailed attributes."
      onExport={onExport}
    />
  );
}
