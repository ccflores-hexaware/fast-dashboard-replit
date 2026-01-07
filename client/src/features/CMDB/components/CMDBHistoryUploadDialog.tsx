import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UploadError {
  row: number;
  message: string;
}

interface UploadResult {
  success: boolean;
  message: string;
  insertedCount?: number;
  totalRows?: number;
  errors?: UploadError[];
}

interface CMDBHistoryUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
}

export function CMDBHistoryUploadDialog({ isOpen, onClose, onUploadComplete }: CMDBHistoryUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isValidFile(droppedFile)) {
      setFile(droppedFile);
      setUploadResult(null);
    } else {
      toast({ title: "Invalid file", description: "Please upload an Excel (.xlsx, .xls) or CSV file", variant: "destructive" });
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && isValidFile(selectedFile)) {
      setFile(selectedFile);
      setUploadResult(null);
    } else if (selectedFile) {
      toast({ title: "Invalid file", description: "Please upload an Excel (.xlsx, .xls) or CSV file", variant: "destructive" });
    }
  }, []);

  const isValidFile = (file: File): boolean => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    return validTypes.includes(file.type) || validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('replaceExisting', String(replaceExisting));

      const response = await fetch('/api/cmdb/history/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setUploadResult(result);

      if (result.success) {
        toast({ title: "Success", description: result.message });
        onUploadComplete();
      } else {
        toast({ title: "Upload failed", description: result.message || "Failed to upload file", variant: "destructive" });
      }
    } catch (error) {
      const errorResult = { success: false, message: error instanceof Error ? error.message : "Upload failed" };
      setUploadResult(errorResult);
      toast({ title: "Error", description: errorResult.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/cmdb/history/template/download');
      if (!response.ok) throw new Error('Failed to download template');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cmdb_history_template.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({ title: "Error", description: "Failed to download template", variant: "destructive" });
    }
  };

  const handleClose = () => {
    setFile(null);
    setUploadResult(null);
    setReplaceExisting(false);
    onClose();
  };

  const removeFile = () => {
    setFile(null);
    setUploadResult(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload CMDB History
          </DialogTitle>
          <DialogDescription>
            Upload an Excel or CSV file to import CMDB history records for multiple assets.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-green-600" />
                <div className="text-left">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <Button variant="ghost" size="icon" onClick={removeFile} className="ml-2">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <FileSpreadsheet className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop your file here, or
                </p>
                <label>
                  <input
                    type="file"
                    className="hidden"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                  />
                  <Button variant="outline" size="sm" asChild>
                    <span className="cursor-pointer">Browse Files</span>
                  </Button>
                </label>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports Excel (.xlsx, .xls) and CSV files
                </p>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="replaceExisting"
              checked={replaceExisting}
              onCheckedChange={(checked) => setReplaceExisting(checked === true)}
            />
            <Label htmlFor="replaceExisting" className="text-sm font-normal cursor-pointer">
              Replace all existing history records
            </Label>
          </div>

          {uploadResult && (
            <div className={`rounded-lg p-4 ${uploadResult.success ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
              <div className="flex items-start gap-2">
                {uploadResult.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${uploadResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                    {uploadResult.message}
                  </p>
                  {uploadResult.success && uploadResult.insertedCount !== undefined && (
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Imported {uploadResult.insertedCount} of {uploadResult.totalRows} rows
                    </p>
                  )}
                  {uploadResult.errors && uploadResult.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-red-700 dark:text-red-300">Errors:</p>
                      <ul className="text-sm text-red-600 dark:text-red-400 mt-1 max-h-24 overflow-y-auto">
                        {uploadResult.errors.slice(0, 5).map((error, i) => (
                          <li key={i}>Row {error.row}: {error.message}</li>
                        ))}
                        {uploadResult.errors.length > 5 && (
                          <li>...and {uploadResult.errors.length - 5} more errors</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <Button variant="link" className="p-0 h-auto text-sm" onClick={handleDownloadTemplate}>
            <Download className="h-4 w-4 mr-1" />
            Download template file
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleUpload} 
            disabled={!file || isUploading}
            className="gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
