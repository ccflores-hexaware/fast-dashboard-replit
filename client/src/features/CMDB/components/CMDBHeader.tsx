import React from 'react';
import { PageHeader } from '@/components/PageHeader';

interface CMDBHeaderProps {
  onExport: () => void;
}

export function CMDBHeader({ onExport }: CMDBHeaderProps) {
  return (
    <PageHeader
      title="Configuration Management Database (CMDB)"
      description="View configuration items, versions, and operational status."
      onExport={onExport}
    />
  );
}
