import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Pagination } from '@/components/Pagination';
import { LoadingState } from '@/components/LoadingState';
import { useSubAssetsPage } from '@/features/SubAssets/hooks/useSubAssetsPage';
import { SubAssetsHeader } from '@/features/SubAssets/components/SubAssetsHeader';
import { SubAssetsToolbar } from '@/features/SubAssets/components/SubAssetsToolbar';
import { SubAssetsTable } from '@/features/SubAssets/components/table/SubAssetsTable';
import { SubAssetsCardGrid } from '@/features/SubAssets/components/SubAssetsCardGrid';
import { SubAssetsDetailsDialog } from '@/features/SubAssets/components/SubAssetsDetailsDialog';

export default function SubAssetsPage() {
  const {
    data,
    search,
    columns,
    dialogs,
    table,
    pagination,
    view,
    exportToExcel,
    isAdmin,
  } = useSubAssetsPage();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <SubAssetsHeader onExport={exportToExcel} />

        <SubAssetsToolbar
          searchQuery={search.searchQuery}
          onSearchQueryChange={search.setSearchQuery}
          searchColumn={search.searchColumn}
          onSearchColumnChange={search.setSearchColumn}
          openCombobox={search.openCombobox}
          onOpenComboboxChange={search.setOpenCombobox}
          columns={columns.allColumns}
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
          <LoadingState />
        ) : view.view === 'table' ? (
          <SubAssetsTable
            data={pagination.paginatedData}
            visibleColumns={columns.visibleColumns}
            sortConfig={table.sortConfig}
            onSort={table.handleSort}
            columnFilters={table.columnFilters}
            onColumnFiltersChange={table.setColumnFilters}
            allData={data.data}
            onRowClick={dialogs.openDetailsDialog}
          />
        ) : (
          <SubAssetsCardGrid
            data={pagination.paginatedData}
            visibleCardFields={columns.visibleCardFields}
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

        <SubAssetsDetailsDialog
          isOpen={dialogs.isDialogOpen}
          onClose={dialogs.closeDialog}
          selectedItem={dialogs.selectedItem}
          isEditing={dialogs.isEditing}
          editFormData={dialogs.editFormData}
          isSaving={dialogs.isSaving}
          columns={columns.allColumns}
          isAdmin={isAdmin}
          onEdit={dialogs.handleEdit}
          onSave={dialogs.handleSave}
          onCancel={dialogs.handleCancelEdit}
          onEditFormDataChange={dialogs.setEditFormData}
        />
      </div>
    </DashboardLayout>
  );
}
