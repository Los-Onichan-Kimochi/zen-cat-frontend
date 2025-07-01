'use client';

import { Service } from '@/types/service';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { useDataTable } from '@/hooks/use-data-table';
import { getCommunityServiceColumns } from './community-service-columns';
import { DataTable } from '@/components/common/data-table/data-table';
import { DataTableToolbar } from '@/components/common/data-table/data-table-toolbar';
import { DataTablePagination } from '@/components/common/data-table/data-table-pagination';

interface CommunityServiceTableProps {
  data: Service[];
  onDeleteClick: (service: Service) => void;
  onBulkDelete: (ids: string[]) => void;
  isBulkDeleting: boolean;
  disableConfirmBulkDelete: boolean;
  isEditing?: boolean;
}

export function CommunityServiceTable({
  data,
  onDeleteClick,
  onBulkDelete,
  isBulkDeleting,
  disableConfirmBulkDelete = false,
  isEditing=true,
}: CommunityServiceTableProps) {
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

  const columns = getCommunityServiceColumns(isEditing, onDeleteClick);

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
    manualPagination: false,
    enableRowSelection: true,
    debugTable: true,
  });

  return (
    <>
      <DataTableToolbar
        table={table}
        onBulkDelete={(ids: string[]) => onBulkDelete(ids)}
        isBulkDeleting={isBulkDeleting}
        isBulkDeleteEnabled={!isEditing}
        showBulkDeleteButton
        showExportButton={false}
        filterPlaceholder="Buscar servicio..."
        exportFileName="servicios"
        showFilterButton
        onFilterClick={() => {}}
        showSortButton
        disableConfirmBulkDelete={disableConfirmBulkDelete}
      />
      <DataTable table={table} columns={columns} />
      <DataTablePagination table={table} />
    </>
  );
}
