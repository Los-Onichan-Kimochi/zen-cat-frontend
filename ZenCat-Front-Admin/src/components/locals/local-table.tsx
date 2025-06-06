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
import { Local } from '@/types/local';
import { getLocalColumns } from './local-columns';

interface LocalsTableProps {
  data: Local[];
  onEdit: (local: Local) => void;
  onDelete: (local: Local) => void;
  onView: (local: Local) => void;
  onBulkDelete?: (locals: Local[]) => void;
  isBulkDeleting?: boolean;
}

export function LocalsTable({
  data,
  onEdit,
  onDelete,
  onView,
}: LocalsTableProps) {
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

  const columns = getLocalColumns({ onEdit, onDelete, onView });

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
        filterPlaceholder="Buscar locales..."
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
