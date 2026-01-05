import React from 'react';
import { Loader2, ChevronRight, ChevronDown } from 'lucide-react';
import type { ReconAsset, GroupedReconAsset } from '../../types/asset.types';
import type { ColumnDefinition } from '../../types/column.types';
import type { SortConfig } from '../../types/state.types';
import { ReconTableHeader } from './ReconTableHeader';
import { ReconTableRow } from './ReconTableRow';


interface ReconTableProps {
  groupedData: GroupedReconAsset[];
  visibleColumns: ColumnDefinition[];
  sortConfig: SortConfig;
  onSort: (key: string) => void;
  columnFilters: Record<string, string[]>;
  getUniqueValues: (key: string) => string[];
  onFilterChange: (key: string, value: string, uniqueValues: string[]) => void;
  onSelectAll: (key: string) => void;
  onClearFilter: (key: string) => void;
  onItemClick: (item: ReconAsset) => void;
  isLoading: boolean;
  expandedGroups: Set<string>;
  toggleGroup: (applicationName: string) => void;
}

export function ReconTable({
  groupedData,
  visibleColumns,
  sortConfig,
  onSort,
  columnFilters,
  getUniqueValues,
  onFilterChange,
  onSelectAll,
  onClearFilter,
  onItemClick,
  isLoading,
  expandedGroups,
  toggleGroup,
}: ReconTableProps) {
  return (
    <div className="rounded-md border border-border bg-card shadow-sm overflow-x-auto overflow-y-hidden">
      <table className="w-full caption-bottom text-sm">
        <ReconTableHeader
          visibleColumns={visibleColumns}
          sortConfig={sortConfig}
          onSort={onSort}
          columnFilters={columnFilters}
          getUniqueValues={getUniqueValues}
          onFilterChange={onFilterChange}
          onSelectAll={onSelectAll}
          onClearFilter={onClearFilter}
        />
        <tbody className="[&_tr:last-child]:border-0">
          {isLoading ? (
            <tr>
              <td colSpan={visibleColumns.length} className="py-16">
                <div className="flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading assets...</p>
                  </div>
                </div>
              </td>
            </tr>
          ) : groupedData.length === 0 ? (
            <tr>
              <td colSpan={visibleColumns.length} className="py-16">
                <div className="flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <h3 className="text-lg font-semibold">No Records Found</h3>
                    <p className="text-sm">Try adjusting your filters or search criteria</p>
                  </div>
                </div>
              </td>
            </tr>
          ) : (
            groupedData.map((group: GroupedReconAsset) => {
              const isExpanded = expandedGroups.has(group.applicationName);
              return (
                <React.Fragment key={group.applicationName}>
                  <tr 
                    className="border-b border-border bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => toggleGroup(group.applicationName)}
                  >
                    {isExpanded ? (
                      <td colSpan={visibleColumns.length} className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium text-foreground">
                            {group.applicationName}
                          </span>
                          <span className="text-xs text-muted-foreground px-2 py-0.5 bg-background rounded-full border">
                            {group.recordCount} record{group.recordCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </td>
                    ) : (
                      visibleColumns.map((col, colIndex) => (
                        <td 
                          key={String(col.accessorKey)}
                          className={`py-3 px-4 border-r border-border ${colIndex === visibleColumns.length - 1 ? 'border-r-0' : ''} ${colIndex === 0 ? 'sticky left-0 z-20 bg-slate-100' : 'bg-gray-100/60'}`}
                        >
                          {colIndex === 0 ? (
                            <div className="flex items-center gap-3">
                              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="font-medium text-foreground">
                                {group.applicationName}
                              </span>
                              <span className="text-xs text-muted-foreground px-2 py-0.5 bg-background rounded-full border">
                                {group.recordCount} record{group.recordCount !== 1 ? 's' : ''}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                      ))
                    )}
                  </tr>
                  {isExpanded && group.records.map((item: ReconAsset, index: number) => (
                    <ReconTableRow
                      key={`${item.internalId}-${index}`}
                      item={item}
                      visibleColumns={visibleColumns}
                      onItemClick={onItemClick}
                    />
                  ))}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
