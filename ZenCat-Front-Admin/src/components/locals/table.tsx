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
import { getLocalColumns } from './columns';
import { useEffect } from 'react';

interface LocalsTableProps {
  data: Local[];
  onBulkDelete: (ids: string[]) => void;
  isBulkDeleting: boolean;
  onEdit: (local: Local) => void;
  onDelete: (local: Local) => void;
  resetRowSelectionTrigger?: number;
}

export function LocalsTable({
  data,
  onBulkDelete,
  isBulkDeleting,
  onEdit,
  onDelete,
  resetRowSelectionTrigger,
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

  const columns = getLocalColumns({ onEdit, onDelete });

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
    table.resetRowSelection();
    setRowSelection({});
  }, [resetRowSelectionTrigger]);

  return (
    <div className="-mx-4 flex-1 overflow-auto px-4 py-2">
      <DataTableToolbar
        table={table}
        onBulkDelete={onBulkDelete}
        isBulkDeleting={isBulkDeleting}
        showBulkDeleteButton
        showExportButton
        filterPlaceholder="Buscar local..."
        exportFileName="locales"
        showFilterButton
        onFilterClick={() => console.log('Filtrar')}
        showSortButton
      />
      <div className="flex-1 overflow-hidden rounded-md border">
        <DataTable table={table} columns={columns} />
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
