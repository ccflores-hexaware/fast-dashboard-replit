import React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface CMDBHeaderProps {
  onExport: () => void;
  onUploadHistory?: () => void;
}

export function CMDBHeader({ onExport, onUploadHistory }: CMDBHeaderProps) {
  return (
    <PageHeader
      title="Configuration Management Database (CMDB)"
      description="View configuration items, versions, and operational status."
      onExport={onExport}
    >
      {onUploadHistory && (
        <Button variant="outline" onClick={onUploadHistory} className="gap-2">
          <Upload className="h-4 w-4" />
          Upload History
        </Button>
      )}
    </PageHeader>
  );
}
