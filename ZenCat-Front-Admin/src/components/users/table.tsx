'use client';
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel } from '@tanstack/react-table';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/common/data-table/data-table';
import { DataTableToolbar } from '@/components/common/data-table/data-table-toolbar';
import { DataTablePagination } from '@/components/common/data-table/data-table-pagination';
import { User } from '@/types/user';
import { getUserColumns } from './columns';

interface UsersTableProps {
  data: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onViewMemberships: (user: User) => void;
}

export function UsersTable({ data, onEdit, onDelete, onViewMemberships }: UsersTableProps) {
  const {
    sorting, setSorting,
    columnFilters, setColumnFilters,
    columnVisibility, setColumnVisibility,
    rowSelection, setRowSelection,
    globalFilter, setGlobalFilter,
    pagination, setPagination,
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

  return (
    <div className="-mx-4 flex-1 overflow-auto px-4 py-2">
      <DataTableToolbar
        table={table}
        filterPlaceholder="Buscar usuarios..."
        showSortButton
        showFilterButton
        showExportButton
        onFilterClick={() => console.log('Filtrar')}
        onExportClick={() => console.log('Exportar')}
      />
      <div className="flex-1 overflow-hidden rounded-md border">
        <DataTable table={table} columns={columns} />
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
