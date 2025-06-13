'use client';
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
import { getUserColumns } from './columns';
import { useEffect } from 'react';

interface UsersTableProps {
  data: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onViewMemberships: (user: User) => void;
  onBulkDelete?: (ids: string[]) => void;
  isBulkDeleting?: boolean;
  resetSelection?: number;
}

export function UsersTable({
  data,
  onEdit,
  onDelete,
  onViewMemberships,
  onBulkDelete,
  isBulkDeleting = false,
  resetSelection = 0,
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

  const columns = getUserColumns({ onEdit, onDelete, onViewMemberships });

  const table = useReactTable({
    data,
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
    if (resetSelection > 0) {
      setRowSelection({});
    }
  }, [resetSelection, setRowSelection]);

  return (
    <div className="-mx-4 flex-1 flex flex-col px-4 py-2 h-full">
      <DataTableToolbar
        table={table}
        filterPlaceholder="Buscar usuarios..."
        showSortButton
        showFilterButton
        showExportButton
        showBulkDeleteButton={!!onBulkDelete}
        onFilterClick={() => console.log('Filtrar')}
        onBulkDelete={onBulkDelete}
        isBulkDeleting={isBulkDeleting}
        isBulkDeleteEnabled={true}
      />
      <div className="flex-1 overflow-hidden rounded-md border bg-white">
        <DataTable table={table} columns={columns} />
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
