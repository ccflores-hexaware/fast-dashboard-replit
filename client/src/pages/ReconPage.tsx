import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Pagination } from '@/components/Pagination';
import { LoadingState } from '@/components/LoadingState';
import { useReconPage } from '@/features/Recon/hooks/useReconPage';
import { ReconHeader } from '@/features/Recon/components/ReconHeader';
import { ReconToolbar } from '@/features/Recon/components/ReconToolbar';
import { ReconTable } from '@/features/Recon/components/table/ReconTable';
import { ReconCardGrid } from '@/features/Recon/components/ReconCardGrid';
import { ReconDetailsDialog } from '@/features/Recon/components/ReconDetailsDialog';

export default function ReconPage() {
  const {
    data,
    columns,
    dialogs,
    search,
    table,
    pagination,
    view,
    exportToExcel,
    allColumns,
  } = useReconPage();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ReconHeader onExport={exportToExcel} />

        <ReconToolbar
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

        {view.view === 'table' ? (
          <ReconTable
            data={pagination.paginatedData}
            visibleColumns={columns.visibleColumns}
            sortConfig={table.sortConfig}
            onSort={table.handleSort}
            columnFilters={table.columnFilters}
            getUniqueValues={table.getUniqueValues}
            onFilterChange={table.handleFilterChange}
            onSelectAll={table.handleSelectAll}
            onClearFilter={table.handleClearColumnFilter}
            onItemClick={dialogs.openDetailsDialog}
            isLoading={data.isLoading}
          />
        ) : data.isLoading ? (
          <LoadingState />
        ) : (
          <ReconCardGrid
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
          view={view.view}
        />

        <ReconDetailsDialog
          isOpen={dialogs.isDialogOpen}
          onClose={dialogs.closeDetailsDialog}
          selectedItem={dialogs.selectedItem}
          columns={allColumns}
        />
      </div>
    </DashboardLayout>
  );
}
