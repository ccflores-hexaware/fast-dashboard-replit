import React from 'react';
import { Loader2, Save, Pencil, Layers } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FASTAsset } from '../types/asset.types';
import type { ColumnDefinition } from '../types/column.types';
import { ENUM_FIELDS } from '../constants/columns';

interface FASTDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: FASTAsset | null;
  isEditing: boolean;
  editFormData: Partial<FASTAsset>;
  isSaving: boolean;
  assetIdError: string | null;
  assetIdAvailable: boolean;
  dateFieldErrors: Record<string, string | null>;
  columns: ColumnDefinition[];
  isAdmin: boolean;
  subAssetCount: number;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onEditFormDataChange: (data: Partial<FASTAsset>) => void;
  onDateFieldErrorsChange: React.Dispatch<React.SetStateAction<Record<string, string | null>>>;
  onCreateSubAsset: () => void;
}

export function FASTDetailsDialog({
  isOpen,
  onClose,
  selectedItem,
  isEditing,
  editFormData,
  isSaving,
  assetIdError,
  assetIdAvailable,
  dateFieldErrors,
  columns,
  isAdmin,
  subAssetCount,
  onEdit,
  onSave,
  onCancel,
  onEditFormDataChange,
  onDateFieldErrorsChange,
  onCreateSubAsset,
}: FASTDetailsDialogProps) {
  const handleFormFieldChange = (key: string, value: any) => {
    onEditFormDataChange({ ...editFormData, [key]: value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent className="w-full sm:max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-2">
          <div className="flex justify-between items-center pr-8">
            <DialogTitle className="text-2xl font-bold text-primary">
              {isEditing ? 'Edit Asset' : (selectedItem?.name || 'Asset Details')}
            </DialogTitle>
          </div>
          <DialogDescription className="flex items-center gap-2">
            <span>{selectedItem?.id}</span>
            {selectedItem && !isEditing && (
              <div className="flex items-center gap-2 ml-4">
                {subAssetCount > 0 && (
                  <Link href="/sub-assets">
                    <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                      <Layers className="h-3 w-3 mr-1" />
                      {subAssetCount} Sub-asset{subAssetCount > 1 ? 's' : ''}
                    </Badge>
                  </Link>
                )}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 min-h-0">
          <div className="py-4">
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                {columns.map((col) => {
                  const key = col.accessorKey;
                  const value = (editFormData as any)[key];
                  const enumOptions = ENUM_FIELDS[key];
                  const isAuditField = key === 'lastModifiedBy' || key === 'lastModifiedDate';
                  const isIdField = key === 'id';
                  const shouldDisable = isAuditField || isIdField;
                  
                  return (
                    <div key={key} className="flex flex-col space-y-2 py-3 border-b border-border/50">
                      <Label htmlFor={key} className="text-sm font-medium text-muted-foreground">
                        {col.header}
                        {isIdField && assetIdError && (
                          <span className="text-red-500 ml-2 text-xs">{assetIdError}</span>
                        )}
                        {isIdField && assetIdAvailable && !assetIdError && (
                          <span className="text-green-500 ml-2 text-xs">Available</span>
                        )}
                        {dateFieldErrors[key] && (
                          <span className="text-red-500 ml-2 text-xs">{dateFieldErrors[key]}</span>
                        )}
                      </Label>
                      {enumOptions && !shouldDisable ? (
                        <Select 
                          value={String(value || '')} 
                          onValueChange={(val) => handleFormFieldChange(key, val)}
                        >
                          <SelectTrigger className="font-semibold">
                            <SelectValue placeholder={`Select ${col.header}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {enumOptions.map(opt => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id={key}
                          value={shouldDisable && !value ? '-' : String(value || '')}
                          onChange={(e) => handleFormFieldChange(key, e.target.value)}
                          disabled={shouldDisable}
                          className={shouldDisable ? 'bg-muted cursor-not-allowed' : ''}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                {columns.map((col) => {
                  const key = col.accessorKey;
                  const value = selectedItem?.[key as keyof FASTAsset];
                  return (
                    <div key={key} className="flex flex-col space-y-1 py-3 border-b border-border/50">
                      <span className="text-sm font-medium text-muted-foreground">{col.header}</span>
                      <span className="text-base font-semibold text-foreground">
                        {(value === undefined || value === null || value === '') ? '-' : String(value)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 pt-4 border-t mt-auto bg-muted/20 flex justify-between items-center">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={onCancel} disabled={isSaving}>Cancel</Button>
              <Button onClick={onSave} disabled={isSaving} className="gap-2">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </>
          ) : (
            <>
              <div className="flex gap-2">
                {isAdmin && selectedItem && !selectedItem.isSubAsset && (
                  <Button 
                    size="sm" 
                    onClick={onCreateSubAsset} 
                    className="gap-1 text-white" 
                    style={{ backgroundColor: '#f59e0b' }} 
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d97706'} 
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
                  >
                    <Layers className="h-4 w-4" /> Create Sub-asset
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>Close</Button>
                {isAdmin && selectedItem && (
                  <Button onClick={onEdit} className="gap-2"><Pencil className="h-4 w-4" /> Edit</Button>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
