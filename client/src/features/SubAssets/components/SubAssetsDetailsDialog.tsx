import React from 'react';
import { Loader2, Save, Pencil, ExternalLink } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
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
import type { SubAsset } from '../types/asset.types';
import type { ColumnDefinition } from '@/types/table.types';
import { ENUM_FIELDS } from '../constants/columns';

interface SubAssetsDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: SubAsset | null;
  isEditing: boolean;
  editFormData: Partial<SubAsset>;
  isSaving: boolean;
  columns: ColumnDefinition[];
  isAdmin: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onEditFormDataChange: React.Dispatch<React.SetStateAction<Partial<SubAsset>>>;
}

export function SubAssetsDetailsDialog({
  isOpen,
  onClose,
  selectedItem,
  isEditing,
  editFormData,
  isSaving,
  columns,
  isAdmin,
  onEdit,
  onSave,
  onCancel,
  onEditFormDataChange,
}: SubAssetsDetailsDialogProps) {
  const handleFormFieldChange = (key: string, value: any) => {
    onEditFormDataChange(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onCancel(); onClose(); } }}>
      <DialogContent className="w-full sm:max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-2">
          <div className="flex justify-between items-center pr-8">
            <DialogTitle className="text-2xl font-bold text-primary">
              {isEditing ? 'Edit Sub-asset' : (selectedItem?.name || 'Sub-asset Details')}
            </DialogTitle>
          </div>
          <DialogDescription className="flex items-center gap-2">
            {selectedItem?.parentAssetId && (
              <>
                <span>Parent Asset:</span>
                <Link href="/fast" className="text-primary hover:underline flex items-center gap-1">
                  {selectedItem.parentAssetId}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 min-h-0">
          <div className="py-4">
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                {columns.filter(col => col.accessorKey !== 'parentAssetId').map((col) => {
                  const key = col.accessorKey;
                  const value = (editFormData as any)[key];
                  const enumOptions = ENUM_FIELDS[key];
                  const isAuditField = key === 'lastModifiedBy' || key === 'lastModifiedDate';
                  const isAssetIdField = key === 'assetId';
                  const shouldDisable = isAuditField || isAssetIdField;
                  
                  return (
                    <div key={key} className="flex flex-col space-y-2 py-3 border-b border-border/50">
                      <Label htmlFor={key} className="text-sm font-medium text-muted-foreground">
                        {col.header}
                      </Label>
                      {enumOptions && !shouldDisable ? (
                        <Select value={String(value || '')} onValueChange={(val) => handleFormFieldChange(key, val)}>
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
                  const value = selectedItem?.[key as keyof SubAsset];
                  const isParentAssetId = key === 'parentAssetId';
                  
                  return (
                    <div key={key} className="flex flex-col space-y-1 py-3 border-b border-border/50">
                      <span className="text-sm font-medium text-muted-foreground">{col.header}</span>
                      {isParentAssetId && value ? (
                        <Link href="/fast" className="text-base font-semibold text-primary hover:underline flex items-center gap-1">
                          {String(value)}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span className="text-base font-semibold text-foreground">
                          {(value === undefined || value === null || value === '') ? '-' : String(value)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 pt-4 border-t mt-auto bg-muted/20 flex justify-end items-center gap-2">
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
              <Button variant="outline" onClick={onClose}>Close</Button>
              {isAdmin && selectedItem && (
                <Button onClick={onEdit} className="gap-2"><Pencil className="h-4 w-4" /> Edit</Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
