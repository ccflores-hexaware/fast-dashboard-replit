import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Pagination } from '@/components/Pagination';
import { LoadingState } from '@/components/LoadingState';
import { useFASTPage } from '@/features/FAST/hooks/useFASTPage';
import { FASTHeader } from '@/features/FAST/components/FASTHeader';
import { FASTToolbar } from '@/features/FAST/components/FASTToolbar';
import { FASTTable } from '@/features/FAST/components/table/FASTTable';
import { FASTDetailsDialog } from '@/features/FAST/components/FASTDetailsDialog';
import { FASTSubAssetDialog } from '@/features/FAST/components/FASTSubAssetDialog';
import { useUser } from '@/lib/userContext';

export default function FASTPage() {
  const { isAdmin } = useUser();
  const {
    data,
    search,
    columns,
    dialogs,
    table,
    pagination,
    subAssetCounts,
  } = useFASTPage();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <FASTHeader />

        <FASTToolbar
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
        />

        {data.isLoading ? (
          <LoadingState />
        ) : (
          <FASTTable
            data={pagination.paginatedData}
            visibleColumns={columns.visibleColumns}
            sortConfig={table.sortConfig}
            onSort={table.handleSort}
            columnFilters={table.columnFilters}
            onColumnFiltersChange={table.setColumnFilters}
            allData={data.data}
            onRowClick={dialogs.openDetailsDialog}
            isAdmin={isAdmin}
            onEditClick={dialogs.openEditDialog}
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

        <FASTDetailsDialog
          isOpen={dialogs.isDialogOpen}
          onClose={dialogs.closeDialog}
          selectedItem={dialogs.selectedItem}
          isEditing={dialogs.isEditing}
          editFormData={dialogs.editFormData}
          isSaving={dialogs.isSaving}
          assetIdError={dialogs.assetIdError}
          assetIdAvailable={dialogs.assetIdAvailable}
          dateFieldErrors={dialogs.dateFieldErrors}
          columns={columns.allColumns}
          isAdmin={isAdmin}
          subAssetCount={dialogs.selectedItem ? (subAssetCounts[dialogs.selectedItem.id] || 0) : 0}
          onEdit={() => dialogs.openEditDialog()}
          onSave={dialogs.handleSave}
          onCancel={dialogs.closeDialog}
          onEditFormDataChange={(data) => dialogs.setEditFormData(data)}
          onDateFieldErrorsChange={dialogs.setDateFieldErrors}
          onCreateSubAsset={() => dialogs.setIsDuplicateConfirmOpen(true)}
        />

        <FASTSubAssetDialog
          isOpen={dialogs.isDuplicateConfirmOpen}
          onClose={() => dialogs.setIsDuplicateConfirmOpen(false)}
          selectedItem={dialogs.selectedItem}
          isCreating={dialogs.isCreatingSubAsset}
          onCreate={dialogs.handleDuplicate}
        />
      </div>
    </DashboardLayout>
  );
}
