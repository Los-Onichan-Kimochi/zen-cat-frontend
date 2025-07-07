'use client';

import React, { useMemo } from 'react';
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
import { getRoleColumns } from './columns';
import { RoleFiltersModal } from './filters-modal';
import { useRoleFilters } from '@/hooks/use-role-filters';

interface RoleTableProps {
  data: User[];
  isLoading: boolean;
  onRoleChange: (userId: string, newRole: string) => void;
  isChangingRole: boolean;
  onRefresh: () => void;
}

export function RoleTable({
  data,
  isLoading,
  onRoleChange,
  isChangingRole,
  onRefresh,
}: RoleTableProps) {
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
  } = useRoleFilters();

  const columns = getRoleColumns({ onRoleChange, isChangingRole });

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
    enableRowSelection: false,
  });

  return (
    <div className="-mx-4 flex-1 flex flex-col px-4 py-2 h-full">
      <DataTableToolbar
        table={table}
        filterPlaceholder="Buscar usuarios por email, nombre o rol..."
        showSortButton
        showFilterButton
        showExportButton
        showRefreshButton={!!onRefresh}
        onFilterClick={openModal}
        onRefreshClick={onRefresh}
        isRefreshing={isLoading}
        isBulkDeleting={false}
      />
      <div className="flex-1 overflow-hidden rounded-md border bg-white">
        <DataTable table={table} columns={columns} isRefreshing={isLoading} />
      </div>
      <DataTablePagination table={table} />

      {/* Modal de filtros */}
      <RoleFiltersModal
        open={isModalOpen}
        onClose={closeModal}
        filters={filters}
        onApplyFilters={applyFilters}
        onClearFilters={clearFilters}
      />
    </div>
  );
}
