import React from 'react';
import { Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Pagination } from '@/components/Pagination';
import { useCMDBPage } from '@/features/CMDB/hooks/useCMDBPage';
import { CMDBHeader } from '@/features/CMDB/components/CMDBHeader';
import { CMDBToolbar } from '@/features/CMDB/components/CMDBToolbar';
import { CMDBTable } from '@/features/CMDB/components/table/CMDBTable';
import { CMDBCardGrid } from '@/features/CMDB/components/CMDBCardGrid';
import { CMDBDetailsDialog } from '@/features/CMDB/components/CMDBDetailsDialog';
import { CMDBHistorySnapshotDialog } from '@/features/CMDB/components/CMDBHistorySnapshotDialog';

export default function CMDBPage() {
  const {
    data,
    history,
    columns,
    dialogs,
    search,
    table,
    pagination,
    view,
    exportToExcel,
    allColumns,
  } = useCMDBPage();

  const handleDialogTabChange = (tab: string) => {
    dialogs.setDialogTab(tab as 'details' | 'history');
    if (tab === 'history' && dialogs.selectedItem && 
        (!history.dialogHistoryData || history.dialogHistoryData.assetId !== dialogs.selectedItem.id)) {
      history.fetchDialogHistory(dialogs.selectedItem.id);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <CMDBHeader onExport={exportToExcel} />

        <CMDBToolbar
          searchQuery={search.searchQuery}
          onSearchQueryChange={search.setSearchQuery}
          searchColumn={search.searchColumn}
          onSearchColumnChange={search.setSearchColumn}
          openCombobox={search.openCombobox}
          onOpenComboboxChange={search.setOpenCombobox}
          columns={allColumns}
          columnVisibility={columns.columnVisibility}
          onColumnVisibilityChange={columns.setColumnVisibility}
          columnSearchQuery={columns.columnSearchQuery}
          onColumnSearchQueryChange={columns.setColumnSearchQuery}
          visibleColumnCount={columns.visibleColumnCount}
          onApplyPreset={columns.applyPreset}
          view={view.view}
          onViewChange={view.setView}
        />

        {data.isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading assets...</p>
            </div>
          </div>
        ) : view.view === 'table' ? (
          <CMDBTable
            data={pagination.paginatedData}
            visibleColumns={columns.visibleColumns}
            sortConfig={table.sortConfig}
            onSort={table.handleSort}
            columnFilters={table.columnFilters}
            getUniqueValues={table.getUniqueValues}
            onFilterChange={table.handleFilterChange}
            onSelectAll={table.handleSelectAll}
            onClearFilter={table.handleClearColumnFilter}
            expandedRows={history.expandedRows}
            onToggleRowExpansion={history.toggleRowExpansion}
            historyCache={history.historyCache}
            historyLoading={history.historyLoading}
            historyPage={history.historyPage}
            onHistoryPageChange={history.setHistoryPageForAsset}
            onItemClick={dialogs.openDetailsDialog}
            onHistoryItemClick={dialogs.openHistorySnapshotDialog}
          />
        ) : (
          <CMDBCardGrid
            data={pagination.paginatedData}
            fields={columns.visibleCardFields}
            onItemClick={dialogs.openDetailsDialog}
          />
        )}

        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={pagination.setCurrentPage}
          onPageSizeChange={pagination.setPageSize}
        />

        <CMDBDetailsDialog
          isOpen={dialogs.isDialogOpen}
          onClose={dialogs.closeDetailsDialog}
          selectedItem={dialogs.selectedItem}
          columns={allColumns}
          dialogTab={dialogs.dialogTab}
          onTabChange={handleDialogTabChange}
          dialogHistoryData={history.dialogHistoryData}
          dialogHistoryLoading={history.dialogHistoryLoading}
          dialogHistoryPage={history.dialogHistoryPage}
          onDialogHistoryPageChange={history.setDialogHistoryPage}
          onHistoryRecordClick={dialogs.openHistorySnapshotDialog}
        />

        <CMDBHistorySnapshotDialog
          isOpen={dialogs.isHistoryDialogOpen}
          onClose={dialogs.closeHistorySnapshotDialog}
          selectedHistoryItem={dialogs.selectedHistoryItem}
          columns={allColumns}
        />
      </div>
    </DashboardLayout>
  );
}
