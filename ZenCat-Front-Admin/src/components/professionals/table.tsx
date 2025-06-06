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
import { Professional } from '@/types/professional';
import { getProfessionalColumns } from './columns';

interface ProfessionalsTableProps {
  data: Professional[];
  onEdit: (professional: Professional) => void;
  onDelete: (professional: Professional) => void;
  onView: (professional: Professional) => void;
  onBulkDelete?: (professionals: Professional[]) => void;
  isBulkDeleting?: boolean;
}

export function ProfessionalsTable({
  data,
  onEdit,
  onDelete,
  onView,
  onBulkDelete,
  isBulkDeleting = false,
}: ProfessionalsTableProps) {
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

  const columns = getProfessionalColumns({ onEdit, onDelete, onView });

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
        filterPlaceholder="Buscar profesionales..."
        showSortButton
        showFilterButton
        showExportButton
        onFilterClick={() => console.log('Filtrar')}
        exportFileName="profesionales"
        // Bulk delete functionality
        showBulkDeleteButton={!!onBulkDelete}
        onBulkDelete={
          onBulkDelete
            ? (ids: string[]) => {
                const professionalsToDelete = data.filter((professional) =>
                  ids.includes(professional.id),
                );
                onBulkDelete(professionalsToDelete);
              }
            : undefined
        }
        isBulkDeleting={isBulkDeleting}
      />
      <div className="flex-1 overflow-hidden rounded-md border">
        <DataTable table={table} columns={columns} />
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
