import React, { useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { ApplicationListView } from '@/features/Recon/components/ApplicationListView';
import { ApplicationDetailView } from '@/features/Recon/components/ApplicationDetailView';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';

export default function ReconPage() {
  const { toast } = useToast();
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);

  const handleSelectApplication = useCallback((applicationName: string) => {
    setSelectedApplication(applicationName);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedApplication(null);
  }, []);

  const exportToExcel = useCallback(async () => {
    try {
      let url: string;
      if (selectedApplication) {
        url = `/api/recon/applications/${encodeURIComponent(selectedApplication)}?limit=1000`;
      } else {
        url = '/api/recon/applications?limit=1000';
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const result = await response.json();
      let exportData: any[];
      
      if (selectedApplication) {
        exportData = result.data.flatMap((group: any) => 
          group.records.map((record: any) => ({
            'Application Name': selectedApplication,
            'Account Name': group.accountName,
            'Entitlement Column': record.entitlementcolumn,
            'Entitlement Value': record.entitlementvalue,
            'File Path': record.filepath,
            'Status': record.status,
          }))
        );
      } else {
        exportData = result.data.map((app: any) => ({
          'Application Name': app.applicationName,
          'Record Count': app.recordCount,
        }));
      }
      
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Recon Data');
      
      const fileName = selectedApplication 
        ? `recon-${selectedApplication.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`
        : 'recon-applications.xlsx';
      XLSX.writeFile(wb, fileName);
      
      toast({
        title: 'Export Complete',
        description: `Successfully exported to ${fileName}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export data to Excel',
        variant: 'destructive',
      });
    }
  }, [selectedApplication, toast]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Recon"
          description={selectedApplication 
            ? `Viewing records for ${selectedApplication}` 
            : "View and analyze reconciliation data"
          }
          onExport={exportToExcel}
        />

        {selectedApplication ? (
          <ApplicationDetailView
            applicationName={selectedApplication}
            onBack={handleBack}
          />
        ) : (
          <ApplicationListView
            onSelectApplication={handleSelectApplication}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
