import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Download, ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface BtoSummaryRow {
  higherLevelBto: string;
  bto: string | null;
  division: string | null;
  totalAssets: number;
}

interface AggregatedBto {
  higherLevelBto: string;
  totalAssets: number;
  breakdown: { bto: string; division: string; totalAssets: number }[];
}

export default function BTOPage() {
  const { toast } = useToast();
  const [data, setData] = useState<BtoSummaryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/bto/summary');
        if (!response.ok) throw new Error('Failed to fetch');
        const summary = await response.json();
        setData(summary);
      } catch (error) {
        console.error('Error fetching BTO data:', error);
        toast({ title: "Error", description: "Failed to load BTO data", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const aggregatedData = useMemo(() => {
    const grouped: Record<string, AggregatedBto> = {};
    
    for (const row of data) {
      if (!grouped[row.higherLevelBto]) {
        grouped[row.higherLevelBto] = {
          higherLevelBto: row.higherLevelBto,
          totalAssets: 0,
          breakdown: []
        };
      }
      grouped[row.higherLevelBto].totalAssets += row.totalAssets;
      grouped[row.higherLevelBto].breakdown.push({
        bto: row.bto || '(Not specified)',
        division: row.division || '(Not specified)',
        totalAssets: row.totalAssets
      });
    }
    
    return Object.values(grouped)
      .filter(row => row.totalAssets >= 1)
      .map(row => ({
        ...row,
        breakdown: row.breakdown.filter(b => b.totalAssets >= 1)
      }))
      .sort((a, b) => a.higherLevelBto.localeCompare(b.higherLevelBto));
  }, [data]);

  const toggleRow = (higherLevelBto: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(higherLevelBto)) {
        next.delete(higherLevelBto);
      } else {
        next.add(higherLevelBto);
      }
      return next;
    });
  };

  const exportToExcel = () => {
    const exportData: any[] = [];
    
    for (const row of aggregatedData) {
      exportData.push({
        'Higher Level BTO': row.higherLevelBto,
        'BTO': '',
        'Division': '',
        'Total Assets': row.totalAssets
      });
      
      for (const breakdown of row.breakdown) {
        exportData.push({
          'Higher Level BTO': '',
          'BTO': breakdown.bto,
          'Division': breakdown.division,
          'Total Assets': breakdown.totalAssets
        });
      }
    }
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    const headerStyle = { fill: { fgColor: { rgb: "89c24b" } }, font: { color: { rgb: "FFFFFF" }, bold: true } };
    ws['!cols'] = [{ wch: 20 }, { wch: 40 }, { wch: 40 }, { wch: 15 }];
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BTO Summary');
    XLSX.writeFile(wb, `BTO_Export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast({ title: "Export Complete", description: `Exported BTO summary data.`, variant: "success" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Business Technology Office (BTO)</h1>
            <p className="text-muted-foreground mt-1">Asset counts by Higher Level BTO, derived from TPI data.</p>
          </div>
          <Button 
            onClick={exportToExcel} 
            className="gap-2 text-white" 
            style={{ backgroundColor: '#89c24b' }} 
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7ab043'} 
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#89c24b'}
          >
            <Download className="h-4 w-4" />Export to Excel
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading BTO summary...</p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-semibold w-10"></th>
                  <th className="text-left p-4 font-semibold">Higher Level BTO</th>
                  <th className="text-left p-4 font-semibold">BTO</th>
                  <th className="text-left p-4 font-semibold">Division</th>
                  <th className="text-right p-4 font-semibold">Total Assets</th>
                </tr>
              </thead>
              <tbody>
                {aggregatedData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-muted-foreground">
                      <p className="text-lg font-medium">No BTO Data</p>
                      <p className="text-sm">No matching assets found in TPI data.</p>
                    </td>
                  </tr>
                ) : (
                  aggregatedData.map((row) => (
                    <React.Fragment key={row.higherLevelBto}>
                      <tr 
                        className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => toggleRow(row.higherLevelBto)}
                      >
                        <td className="p-4">
                          {expandedRows.has(row.higherLevelBto) ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </td>
                        <td className="p-4 font-semibold text-primary">{row.higherLevelBto}</td>
                        <td className="p-4 text-muted-foreground italic">{row.breakdown.length} mappings</td>
                        <td className="p-4 text-muted-foreground italic">-</td>
                        <td className="p-4 text-right font-semibold">{row.totalAssets}</td>
                      </tr>
                      
                      {expandedRows.has(row.higherLevelBto) && (
                        row.breakdown.map((breakdown, idx) => (
                          <tr 
                            key={`${row.higherLevelBto}-${idx}`} 
                            className="border-b bg-muted/30 hover:bg-muted/50"
                          >
                            <td className="p-4"></td>
                            <td className="p-4"></td>
                            <td className="p-4 pl-8">{breakdown.bto}</td>
                            <td className="p-4">{breakdown.division}</td>
                            <td className="p-4 text-right">{breakdown.totalAssets}</td>
                          </tr>
                        ))
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
            
            {aggregatedData.length > 0 && (
              <div className="p-4 border-t bg-muted/30">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Total: {aggregatedData.length} Higher Level BTOs
                  </span>
                  <span className="font-semibold">
                    Grand Total: {aggregatedData.reduce((sum, row) => sum + row.totalAssets, 0)} assets
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
