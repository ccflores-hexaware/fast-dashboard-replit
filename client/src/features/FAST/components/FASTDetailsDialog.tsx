import React from 'react';
import { Loader2, Save, Pencil, MessageSquare, History, Layers, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
import type { FASTAsset, FASTActivity } from '../types/asset.types';
import type { ColumnDefinition } from '../types/column.types';
import { ENUM_FIELDS, getFieldLabel } from '../constants/columns';

interface FASTDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: FASTAsset | null;
  isEditing: boolean;
  editFormData: Partial<FASTAsset>;
  isSaving: boolean;
  comment: string;
  assetIdError: string | null;
  assetIdAvailable: boolean;
  dateFieldErrors: Record<string, string | null>;
  activeTab: 'details' | 'activity';
  activities: FASTActivity[];
  isLoadingActivities: boolean;
  activityDisplayLimit: number;
  columns: ColumnDefinition[];
  isAdmin: boolean;
  subAssetCount: number;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onCommentChange: (comment: string) => void;
  onTabChange: (tab: 'details' | 'activity') => void;
  onActivityDisplayLimitChange: (limit: number | ((prev: number) => number)) => void;
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
  comment,
  assetIdError,
  assetIdAvailable,
  dateFieldErrors,
  activeTab,
  activities,
  isLoadingActivities,
  activityDisplayLimit,
  columns,
  isAdmin,
  subAssetCount,
  onEdit,
  onSave,
  onCancel,
  onCommentChange,
  onTabChange,
  onActivityDisplayLimitChange,
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

        {!isEditing && (
          <div className="px-6 flex gap-2 border-b">
            <button
              onClick={() => onTabChange('details')}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'details' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => onTabChange('activity')}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-1 ${
                activeTab === 'activity' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <History className="h-4 w-4" />
              Activity
              {activities.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-muted rounded-full">{activities.length}</span>
              )}
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 min-h-0">
          <div className="py-4">
            {isEditing ? (
              <>
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
                
                <div className="flex flex-col space-y-2 py-4 border-t border-border mt-4">
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" /> Add Comment (optional)
                  </Label>
                  <Textarea
                    value={comment}
                    onChange={(e) => onCommentChange(e.target.value)}
                    placeholder="Enter a comment about this change..."
                    className="resize-none"
                    rows={3}
                  />
                </div>
              </>
            ) : activeTab === 'details' ? (
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
            ) : (
              <>
                {isLoadingActivities ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : activities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <History className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground font-medium">No activity recorded yet</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">Changes and comments will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
                        <thead className="bg-muted/50 border-b">
                          <tr>
                            <th className="text-left p-3 font-semibold text-muted-foreground" style={{ width: '30%' }}>Comment</th>
                            <th className="text-left p-3 font-semibold text-muted-foreground" style={{ width: '50%' }}>Field Changes</th>
                            <th className="text-left p-3 font-semibold text-muted-foreground" style={{ width: '20%' }}>Last Modified</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {activities.slice(0, activityDisplayLimit).map((activity, idx) => (
                            <tr key={activity.id} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                              <td className="p-3 align-top" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                {activity.text ? (
                                  <span className="text-sm">{activity.text}</span>
                                ) : (
                                  <span className="text-muted-foreground/50">—</span>
                                )}
                              </td>
                              <td className="p-3 align-top">
                                {activity.field && Array.isArray(activity.field) && activity.field.length > 0 ? (
                                  <div className="space-y-1">
                                    {activity.field.map((change, index) => (
                                      <div key={change.field || index} className="flex items-center gap-2 text-sm flex-wrap">
                                        <span className="font-medium text-foreground">{getFieldLabel(change.field)}:</span>
                                        <span className="text-red-500 line-through">{change.old || '(empty)'}</span>
                                        <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                        <span className="text-green-600">{change.new || '(empty)'}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground/50">—</span>
                                )}
                              </td>
                              <td className="p-3 align-top">
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{activity.modifiedBy || '—'}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {activity.modifiedDate ? format(new Date(activity.modifiedDate), 'MMM d, yyyy h:mm a') : '—'}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {activities.length > activityDisplayLimit && (
                      <div className="flex justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onActivityDisplayLimitChange(prev => prev + 5)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          Load more... ({activities.length - activityDisplayLimit} remaining)
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </>
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
                {isAdmin && selectedItem && !selectedItem.isSubAsset && activeTab === 'details' && (
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
