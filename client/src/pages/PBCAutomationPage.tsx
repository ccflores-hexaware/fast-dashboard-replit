import { useState, useMemo, useCallback, Fragment } from 'react';
import { format, subMonths, startOfMonth, isAfter, isBefore, differenceInMonths } from 'date-fns';
import * as XLSX from 'xlsx';
import { PBCLayout } from '@/components/PBCLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
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
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronsUpDown,
  Check,
  ChevronRight,
  ChevronDown,
  Search,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
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
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());
  const [requests, setRequests] = useState<EvidenceRequest[]>(SAMPLE_REQUESTS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [lastRequestId, setLastRequestId] = useState('');
  const [dateErrors, setDateErrors] = useState<string[]>([]);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<EvidenceReport[] | null>(null);
  const [selectedReportRequest, setSelectedReportRequest] = useState<EvidenceRequest | null>(null);
  const [controlComboboxOpen, setControlComboboxOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [historySearch, setHistorySearch] = useState('');

  const toggleGroupExpansion = useCallback((controlId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(controlId)) {
        next.delete(controlId);
      } else {
        next.add(controlId);
      }
      return next;
    });
  }, []);

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
    setControlComboboxOpen(false);
  };

  const handleOpenManualForm = () => {
    window.open(EXTERNAL_LINKS.sharepointIntakeForm, '_blank', 'noopener,noreferrer');
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
    setDateTo(new Date());
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

  const filteredRequests = useMemo(() => {
    if (!historySearch.trim()) return userRequests;
    const searchLower = historySearch.toLowerCase().trim();
    return userRequests.filter(request => 
      request.controlId.toLowerCase().includes(searchLower) ||
      request.requestId.toLowerCase().includes(searchLower) ||
      request.status.toLowerCase().includes(searchLower) ||
      request.dateFrom.includes(searchLower) ||
      request.dateTo.includes(searchLower) ||
      format(new Date(request.dateFrom), 'MMM d, yyyy').toLowerCase().includes(searchLower) ||
      format(new Date(request.dateTo), 'MMM d, yyyy').toLowerCase().includes(searchLower)
    );
  }, [userRequests, historySearch]);

  const groupedRequests = useMemo(() => {
    const grouped: Record<string, EvidenceRequest[]> = {};
    filteredRequests.forEach(request => {
      if (!grouped[request.controlId]) {
        grouped[request.controlId] = [];
      }
      grouped[request.controlId].push(request);
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredRequests]);

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
                    <Popover open={controlComboboxOpen} onOpenChange={setControlComboboxOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          id="control-select"
                          variant="outline"
                          role="combobox"
                          aria-expanded={controlComboboxOpen}
                          aria-describedby="control-help"
                          className="w-full justify-between"
                        >
                          {selectedControl ? (
                            <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                              {selectedControl}
                            </span>
                          ) : (
                            "Select control..."
                          )}
                          <div className="flex items-center gap-2">
                            {selectedControl && (
                              selectedControlData?.isAutomated ? (
                                <Badge className="bg-accent text-accent-foreground text-xs">Automated</Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">Manual</Badge>
                              )
                            )}
                            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                          </div>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                        <Command>
                          <CommandInput placeholder="Search controls..." />
                          <CommandList>
                            <CommandEmpty>No control found.</CommandEmpty>
                            <CommandGroup heading="Automated">
                              {ALL_CONTROLS.filter(c => c.isAutomated).map(control => (
                                <CommandItem
                                  key={control.id}
                                  value={control.id}
                                  onSelect={handleControlSelect}
                                  className="flex justify-between"
                                >
                                  <div className="flex items-center">
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedControl === control.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                                      {control.id}
                                    </span>
                                  </div>
                                  <Badge className="bg-accent text-accent-foreground text-xs">Automated</Badge>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                            <CommandGroup heading="Manual">
                              {ALL_CONTROLS.filter(c => !c.isAutomated).map(control => (
                                <CommandItem
                                  key={control.id}
                                  value={control.id}
                                  onSelect={handleControlSelect}
                                  className="flex justify-between"
                                >
                                  <div className="flex items-center">
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedControl === control.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                                      {control.id}
                                    </span>
                                  </div>
                                  <Badge variant="secondary" className="text-xs">Manual</Badge>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <p id="control-help" className="text-sm text-muted-foreground">
                      {isAutomated 
                        ? 'This control supports automated evidence generation'
                        : selectedControl 
                          ? 'This control requires manual processing. Please submit your request through the SharePoint intake form.'
                          : 'Choose from 43 available controls'}
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

                  {selectedControl && !isAutomated && (
                    <Button onClick={handleOpenManualForm} className="w-full md:w-auto">
                      Open SharePoint Intake Form
                    </Button>
                  )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Request History</CardTitle>
                <CardDescription>View your previous evidence requests and their status</CardDescription>
              </div>
              {userRequests.length > 0 && (
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search requests..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="pl-9 pr-8"
                  />
                  {historySearch && (
                    <button
                      onClick={() => setHistorySearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
                      aria-label="Clear search"
                    >
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {userRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No requests found. Submit your first evidence request above.</p>
              </div>
            ) : groupedRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No requests match "{historySearch}"</p>
                <Button 
                  variant="link" 
                  className="mt-2 text-sm"
                  onClick={() => setHistorySearch('')}
                >
                  Clear search
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border bg-card overflow-hidden">
                <Table>
                  <TableBody>
                    {groupedRequests.map(([controlId, controlRequests]) => {
                      const isExpanded = expandedGroups.has(controlId);
                      return (
                        <Fragment key={controlId}>
                          <TableRow 
                            className="bg-slate-100 hover:bg-slate-100 cursor-pointer border-t"
                            onClick={() => toggleGroupExpansion(controlId)}
                          >
                            <TableCell colSpan={4} className="py-2.5 px-4">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleGroupExpansion(controlId); }}
                                  className="flex items-center justify-center w-6 h-6 rounded hover:bg-slate-200 transition-colors"
                                  aria-label={isExpanded ? "Collapse" : "Expand"}
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-slate-600" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-slate-600" />
                                  )}
                                </button>
                                <span className="font-semibold text-slate-800">{controlId}</span>
                                <span className="text-sm text-slate-500">
                                  ({controlRequests.length} {controlRequests.length === 1 ? 'request' : 'requests'})
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                          {isExpanded && (
                            <>
                              <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
                                <TableCell className="py-2 px-4 pl-14 text-xs font-semibold text-slate-500 uppercase tracking-wider">Request ID</TableCell>
                                <TableCell className="py-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Range</TableCell>
                                <TableCell className="py-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</TableCell>
                                <TableCell className="py-2 px-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Actions</TableCell>
                              </TableRow>
                              {controlRequests.map((request, idx) => (
                                <TableRow 
                                  key={request.id}
                                  className={cn(
                                    "hover:bg-slate-50 transition-colors",
                                    idx === controlRequests.length - 1 ? "" : "border-b border-slate-100"
                                  )}
                                >
                                  <TableCell className="py-3 px-4 pl-14">
                                    <span className="font-mono text-sm text-slate-700">{request.requestId}</span>
                                  </TableCell>
                                  <TableCell className="py-3 px-4">
                                    <span className="text-sm text-slate-600">
                                      {format(new Date(request.dateFrom), 'MMM d, yyyy')} — {format(new Date(request.dateTo), 'MMM d, yyyy')}
                                    </span>
                                  </TableCell>
                                  <TableCell className="py-3 px-4">
                                    <StatusBadge status={request.status} />
                                  </TableCell>
                                  <TableCell className="py-3 px-4 text-right">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={(e) => { e.stopPropagation(); handleDownloadReport(request); }}
                                      disabled={request.status !== 'Completed'}
                                      aria-label={`Download report for ${request.requestId}`}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </>
                          )}
                        </Fragment>
                      );
                    })}
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
