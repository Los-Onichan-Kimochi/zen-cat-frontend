'use client';

import React, { useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/common/data-table/data-table';
import { DataTableToolbar } from '@/components/common/data-table/data-table-toolbar';
import { DataTablePagination } from '@/components/common/data-table/data-table-pagination';
import { User } from '@/types/user';
import { getUsersColumns } from './columns';
import { UserFiltersModal } from './filters-modal';
import { useUserFilters } from '@/hooks/use-user-filters';

interface UsersTableProps {
  data: User[];
  isLoading: boolean;
  onView: (user: User) => void;
  onDelete: (user: User) => void;
  onViewMemberships: (user: User) => void;
  onBulkDelete: (ids: string[]) => void;
  isBulkDeleting: boolean;
  onRefresh: () => void;
  resetRowSelectionTrigger?: number;
}

export function UsersTable({
  data,
  isLoading,
  onView,
  onDelete,
  onViewMemberships,
  onBulkDelete,
  isBulkDeleting,
  onRefresh,
  resetRowSelectionTrigger,
}: UsersTableProps) {
  const {
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    columnVisibility,
    setColumnVisibility,
    rowSelection,
    setRowSelection,
    globalFilter,
    setGlobalFilter,
    pagination,
    setPagination,
  } = useDataTable();

  const {
    filters,
    isModalOpen,
    hasActiveFilters,
    openModal,
    closeModal,
    applyFilters,
    clearFilters,
    filterUsers,
  } = useUserFilters();

  const columns = getUsersColumns({ onView, onDelete, onViewMemberships });

  // Aplicar filtros a los datos
  const filteredData = useMemo(() => {
    return filterUsers(data);
  }, [data, filterUsers]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
  });

  useEffect(() => {
    table.resetRowSelection();
    setRowSelection({});
  }, [resetRowSelectionTrigger]);

  return (
    <div className="h-full flex flex-col">
      <DataTableToolbar
        table={table}
        onBulkDelete={onBulkDelete}
        isBulkDeleting={isBulkDeleting}
        showBulkDeleteButton
        showExportButton
        showRefreshButton={!!onRefresh}
        filterPlaceholder="Buscar usuarios..."
        exportFileName="usuarios"
        showFilterButton
        onFilterClick={openModal}
        onRefreshClick={onRefresh}
        isRefreshing={isLoading}
        showSortButton
      />
      <div className="flex-1 min-h-0">
        <DataTable table={table} columns={columns} isRefreshing={isLoading} />
      </div>
      <DataTablePagination table={table} />

      {/* Modal de filtros */}
      <UserFiltersModal
        open={isModalOpen}
        onClose={closeModal}
        filters={filters}
        onApplyFilters={closeModal}
        onClearFilters={clearFilters}
        onFiltersChange={applyFilters}
      />
    </div>
  );
}
