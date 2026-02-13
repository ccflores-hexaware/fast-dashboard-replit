import { useState, useMemo, useCallback } from 'react';
import { format, startOfMonth, isAfter, isBefore, differenceInMonths } from 'date-fns';
import { useQuery, useMutation } from '@tanstack/react-query';
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
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { 
  CalendarIcon, 
  CheckCircle2, 
  ChevronsUpDown,
  Check,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  EXTERNAL_LINKS,
} from '@/lib/pbcMockData';

interface Control {
  id: number;
  controlId: string;
  name: string;
  isAutomated: boolean;
  createdAt: string | null;
}

interface EvidenceRequest {
  id: number;
  requestId: string;
  controlId: string;
  controlName: string;
  dateFrom: string;
  dateTo: string;
  status: 'In Progress' | 'Completed';
  userId: string;
  createdAt: string | null;
}

const MOCK_USER = {
  id: 'user-001',
  name: 'Auditor User',
  email: 'auditor@company.com',
};

async function fetchControls(): Promise<Control[]> {
  const response = await fetch('/api/pbc/controls');
  if (!response.ok) throw new Error('Failed to fetch controls');
  return response.json();
}

async function createRequest(data: {
  controlId: string;
  controlName: string;
  dateFrom: string;
  dateTo: string;
  userId: string;
}): Promise<EvidenceRequest> {
  const response = await fetch('/api/pbc/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create request');
  return response.json();
}

export default function PBCAutomationPage() {
  const [selectedControl, setSelectedControl] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(startOfMonth(new Date()));
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [lastRequestId, setLastRequestId] = useState('');
  const [dateErrors, setDateErrors] = useState<string[]>([]);
  const [controlComboboxOpen, setControlComboboxOpen] = useState(false);

  const { data: controls = [], isLoading: controlsLoading } = useQuery({
    queryKey: ['pbc-controls'],
    queryFn: fetchControls,
  });

  const createRequestMutation = useMutation({
    mutationFn: createRequest,
    onSuccess: (newRequest) => {
      setLastRequestId(newRequest.requestId);
      setShowSuccessDialog(true);
      setSelectedControl('');
      setDateFrom(startOfMonth(new Date()));
      setDateTo(new Date());
    },
    onError: () => {
      toast.error('Failed to submit request', {
        description: 'Please try again later.',
      });
    },
  });

  const isSubmitting = createRequestMutation.isPending;

  const selectedControlData = useMemo(() => 
    controls.find(c => c.controlId === selectedControl),
    [selectedControl, controls]
  );

  const isAutomated = useMemo(() => 
    selectedControlData?.isAutomated ?? false,
    [selectedControlData]
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
    createRequestMutation.mutate({
      controlId: selectedControl,
      controlName: selectedControlData?.name || '',
      dateFrom: format(dateFrom!, 'yyyy-MM-dd'),
      dateTo: format(dateTo!, 'yyyy-MM-dd'),
      userId: MOCK_USER.id,
    });
  };

  if (controlsLoading) {
    return (
      <PBCLayout>
        <div className="space-y-6">
          <PageHeader 
            title="Control Execution Evidence" 
            description="Request and manage evidence for IAM controls"
          />
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
            <span className="ml-3 text-muted-foreground">Loading controls...</span>
          </div>
        </div>
      </PBCLayout>
    );
  }

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
                              {controls.filter(c => c.isAutomated).map(control => (
                                <CommandItem
                                  key={control.controlId}
                                  value={control.controlId}
                                  onSelect={handleControlSelect}
                                  className="flex justify-between"
                                >
                                  <div className="flex items-center">
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedControl === control.controlId ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                                      {control.controlId}
                                    </span>
                                  </div>
                                  <Badge className="bg-accent text-accent-foreground text-xs">Automated</Badge>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                            <CommandGroup heading="Manual">
                              {controls.filter(c => !c.isAutomated).map(control => (
                                <CommandItem
                                  key={control.controlId}
                                  value={control.controlId}
                                  onSelect={handleControlSelect}
                                  className="flex justify-between"
                                >
                                  <div className="flex items-center">
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedControl === control.controlId ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                                      {control.controlId}
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
                          : `Choose from ${controls.length} available controls`}
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
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open SharePoint Intake Form
                    </Button>
                  )}
            </div>
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
                <p><strong>Control:</strong> {selectedControlData?.controlId}</p>
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
    </PBCLayout>
  );
}
