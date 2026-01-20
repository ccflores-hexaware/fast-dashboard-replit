import { useState, useMemo, useCallback } from 'react';
import { format, subMonths, startOfMonth, endOfMonth, isAfter, isBefore, differenceInMonths } from 'date-fns';
import * as XLSX from 'xlsx';
import { PBCLayout } from '@/components/PBCLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { 
  CalendarIcon, 
  Download, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ALL_CONTROLS,
  SAMPLE_REQUESTS,
  SAMPLE_EVIDENCE_REPORTS,
  MOCK_USER,
  EXTERNAL_LINKS,
  generateRequestId,
  isAutomatedControl,
  type EvidenceRequest,
  type EvidenceReport,
} from '@/lib/pbcMockData';

type RequestStatus = 'In Progress' | 'Completed' | 'Failed';

function StatusBadge({ status }: { status: RequestStatus }) {
  const variants: Record<RequestStatus, { className?: string; variant: 'default' | 'secondary' | 'destructive'; icon: React.ReactNode }> = {
    'In Progress': { variant: 'secondary', icon: <Clock className="h-3 w-3 mr-1" /> },
    'Completed': { variant: 'default', className: 'bg-accent hover:bg-accent/90 text-accent-foreground', icon: <CheckCircle2 className="h-3 w-3 mr-1" /> },
    'Failed': { variant: 'destructive', icon: <AlertCircle className="h-3 w-3 mr-1" /> },
  };

  const { variant, icon, className } = variants[status];

  return (
    <Badge variant={variant} className={cn("flex items-center w-fit", className)}>
      {icon}
      {status}
    </Badge>
  );
}

export default function PBCAutomationPage() {
  const [selectedControl, setSelectedControl] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(startOfMonth(new Date()));
  const [dateTo, setDateTo] = useState<Date | undefined>(endOfMonth(new Date()));
  const [requests, setRequests] = useState<EvidenceRequest[]>(SAMPLE_REQUESTS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [lastRequestId, setLastRequestId] = useState('');
  const [dateErrors, setDateErrors] = useState<string[]>([]);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<EvidenceReport[] | null>(null);
  const [selectedReportRequest, setSelectedReportRequest] = useState<EvidenceRequest | null>(null);

  const selectedControlData = useMemo(() => 
    ALL_CONTROLS.find(c => c.id === selectedControl),
    [selectedControl]
  );

  const isAutomated = useMemo(() => 
    selectedControl ? isAutomatedControl(selectedControl) : false,
    [selectedControl]
  );

  const validateDates = useCallback((from: Date | undefined, to: Date | undefined): string[] => {
    const errors: string[] = [];
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (from && isAfter(from, today)) {
      errors.push('From date cannot be in the future');
    }
    if (to && isAfter(to, today)) {
      errors.push('To date cannot be in the future');
    }
    if (from && to && isAfter(from, to)) {
      errors.push('From date must be before To date');
    }
    if (from && to && differenceInMonths(to, from) > 9) {
      errors.push('Date range cannot exceed 9 months');
    }

    return errors;
  }, []);

  const handleDateFromChange = (date: Date | undefined) => {
    setDateFrom(date);
    setDateErrors(validateDates(date, dateTo));
  };

  const handleDateToChange = (date: Date | undefined) => {
    setDateTo(date);
    setDateErrors(validateDates(dateFrom, date));
  };

  const handleControlSelect = (controlId: string) => {
    setSelectedControl(controlId);
    if (!isAutomatedControl(controlId)) {
      window.open(EXTERNAL_LINKS.sharepointIntakeForm, '_blank', 'noopener,noreferrer');
    }
  };

  const canSubmit = useMemo(() => {
    return (
      isAutomated &&
      dateFrom &&
      dateTo &&
      dateErrors.length === 0 &&
      !isSubmitting
    );
  }, [isAutomated, dateFrom, dateTo, dateErrors, isSubmitting]);

  const handleGenerateClick = () => {
    if (canSubmit) {
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmDialog(false);
    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const requestId = generateRequestId();
    const newRequest: EvidenceRequest = {
      id: String(requests.length + 1),
      requestId,
      controlId: selectedControl,
      controlName: selectedControlData?.name || '',
      dateFrom: format(dateFrom!, 'yyyy-MM-dd'),
      dateTo: format(dateTo!, 'yyyy-MM-dd'),
      status: 'In Progress',
      createdAt: new Date().toISOString(),
      userId: MOCK_USER.id,
    };

    setRequests(prev => [newRequest, ...prev]);
    setLastRequestId(requestId);
    setIsSubmitting(false);
    setShowSuccessDialog(true);
    setSelectedControl('');
    setDateFrom(startOfMonth(new Date()));
    setDateTo(endOfMonth(new Date()));
  };

  const handleViewReport = (request: EvidenceRequest) => {
    const report = SAMPLE_EVIDENCE_REPORTS[request.requestId];
    if (report) {
      setSelectedReport(report);
      setSelectedReportRequest(request);
      setShowReportDialog(true);
    } else {
      toast.error('Report not available', {
        description: `The evidence report for ${request.requestId} is not yet available. Please try again later.`,
      });
    }
  };

  const handleDownloadReport = (request: EvidenceRequest) => {
    const report = SAMPLE_EVIDENCE_REPORTS[request.requestId];
    if (!report) {
      toast.error('Download failed', {
        description: `The evidence report for ${request.requestId} is not yet available for download.`,
      });
      return;
    }

    const worksheetData = report.map(r => ({
      'Keychain Database Name': r.keychainDatabase,
      'Executed Query': r.executedQuery,
      'Number of Records': r.recordCount,
      'Date & Time Executed': format(new Date(r.executedAt), 'yyyy-MM-dd HH:mm:ss'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Evidence Report');

    const colWidths = [
      { wch: 25 },
      { wch: 80 },
      { wch: 18 },
      { wch: 22 },
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `${request.requestId}_Evidence_Report.xlsx`);
  };

  const userRequests = useMemo(() => 
    requests.filter(r => r.userId === MOCK_USER.id),
    [requests]
  );

  return (
    <PBCLayout>
      <div className="space-y-6">
        <PageHeader 
          title="Control Execution Evidence" 
          description="Request and manage evidence for IAM controls"
        />
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Request Evidence</CardTitle>
            <CardDescription>Select a control and date range to generate evidence</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="control-select">Select Control</Label>
                    <Select value={selectedControl} onValueChange={handleControlSelect}>
                      <SelectTrigger id="control-select" className="w-full" aria-describedby="control-help">
                        <SelectValue placeholder="Select an IAM control..." />
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_CONTROLS.map(control => (
                          <SelectItem key={control.id} value={control.id}>
                            <span className="flex items-center gap-2">
                              <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                                {control.id}
                              </span>
                              {control.isAutomated && (
                                <Badge variant="secondary" className="text-xs">Automated</Badge>
                              )}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p id="control-help" className="text-sm text-muted-foreground">
                      {isAutomated 
                        ? 'This control supports automated evidence generation'
                        : selectedControl 
                          ? 'This control requires manual processing via SharePoint'
                          : 'Choose from 43 available IAM controls'}
                    </p>
                  </div>

                  {isAutomated && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="date-from">Date From</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="date-from"
                                variant="outline"
                                className={cn(
                                  'w-full justify-start text-left font-normal',
                                  !dateFrom && 'text-muted-foreground'
                                )}
                                aria-describedby="date-from-help"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateFrom ? format(dateFrom, 'PPP') : 'Pick a date'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={dateFrom}
                                onSelect={handleDateFromChange}
                                disabled={(date) => isAfter(date, new Date())}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <p id="date-from-help" className="text-xs text-muted-foreground">
                            Start of the evidence period
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="date-to">Date To</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="date-to"
                                variant="outline"
                                className={cn(
                                  'w-full justify-start text-left font-normal',
                                  !dateTo && 'text-muted-foreground'
                                )}
                                aria-describedby="date-to-help"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateTo ? format(dateTo, 'PPP') : 'Pick a date'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={dateTo}
                                onSelect={handleDateToChange}
                                disabled={(date) => 
                                  isAfter(date, new Date()) || 
                                  (dateFrom ? isBefore(date, dateFrom) : false)
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <p id="date-to-help" className="text-xs text-muted-foreground">
                            End of the evidence period
                          </p>
                        </div>
                      </div>

                      <div 
                        role="alert" 
                        aria-live="polite" 
                        aria-atomic="true"
                        className={dateErrors.length > 0 ? "bg-destructive/10 border border-destructive/20 rounded-md p-3" : "sr-only"}
                      >
                        {dateErrors.length > 0 && (
                          <ul className="text-sm text-destructive list-disc list-inside">
                            {dateErrors.map((error, idx) => (
                              <li key={idx}>{error}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <Button
                        onClick={handleGenerateClick}
                        disabled={!canSubmit}
                        className="w-full md:w-auto"
                        aria-busy={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Spinner className="mr-2 h-4 w-4" />
                            Submitting...
                          </>
                        ) : (
                          'Generate Evidence'
                        )}
                      </Button>
                    </>
                  )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request History</CardTitle>
            <CardDescription>View your previous evidence requests and their status</CardDescription>
          </CardHeader>
          <CardContent>
            {userRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No requests found. Submit your first evidence request above.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Control ID</TableHead>
                      <TableHead>Date From</TableHead>
                      <TableHead>Date To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userRequests.map(request => (
                      <TableRow key={request.id}>
                        <TableCell className="font-mono text-sm">{request.requestId}</TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">
                            {request.controlId}
                          </span>
                        </TableCell>
                        <TableCell>{format(new Date(request.dateFrom), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{format(new Date(request.dateTo), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <StatusBadge status={request.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewReport(request)}
                              disabled={request.status !== 'Completed'}
                              aria-label={`View report for ${request.requestId}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadReport(request)}
                              disabled={request.status !== 'Completed'}
                              aria-label={`Download report for ${request.requestId}`}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Evidence Request</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>You are about to submit an evidence generation request with the following details:</p>
              <div className="bg-muted p-3 rounded-md text-sm space-y-1 mt-2">
                <p><strong>Control:</strong> {selectedControlData?.id}</p>
                <p><strong>Date Range:</strong> {dateFrom ? format(dateFrom, 'MMM d, yyyy') : ''} to {dateTo ? format(dateTo, 'MMM d, yyyy') : ''}</p>
              </div>
              <p className="mt-2">Do you want to proceed?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit}>Submit Request</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Request Submitted Successfully!
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>Your evidence request has been submitted to the processing queue.</p>
              <div className="bg-muted p-4 rounded-md text-center">
                <p className="text-sm text-muted-foreground">Request ID</p>
                <p className="text-xl font-mono font-bold">{lastRequestId}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                You will receive an email notification when your evidence is ready for download.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccessDialog(false)}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Evidence Report</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedReportRequest && (
                <span>
                  Request ID: <strong>{selectedReportRequest.requestId}</strong> | 
                  Control: <strong>{selectedReportRequest.controlId}</strong>
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            {selectedReport?.map((report, idx) => (
              <div key={idx} className="border rounded-md p-4 space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Keychain Database</p>
                    <p className="font-mono font-medium">{report.keychainDatabase}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Records Returned</p>
                    <p className="font-medium">{report.recordCount.toLocaleString()}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Executed Query</p>
                    <pre className="bg-muted p-2 rounded text-xs overflow-x-auto mt-1">
                      {report.executedQuery}
                    </pre>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Executed At</p>
                    <p className="text-sm">{format(new Date(report.executedAt), 'PPpp')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            {selectedReportRequest && (
              <AlertDialogAction onClick={() => handleDownloadReport(selectedReportRequest)}>
                <Download className="mr-2 h-4 w-4" />
                Download Excel
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PBCLayout>
  );
}
