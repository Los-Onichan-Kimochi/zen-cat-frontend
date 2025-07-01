'use client';

import { MembershipPlan } from '@/types/membership-plan';
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel } from '@tanstack/react-table';
import { getMembershipPlanColumns } from './membership-plan-columns';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/common/data-table/data-table';
import { DataTableToolbar } from '@/components/common/data-table/data-table-toolbar';
import { DataTablePagination } from '@/components/common/data-table/data-table-pagination';
import { useEffect } from 'react';

interface MembershipPlanTableProps {
  data: MembershipPlan[];
  onBulkDelete: (ids: string[]) => void;
  isBulkDeleting: boolean;
  onDelete: (membershipPlan: MembershipPlan) => void;
  resetRowSelectionTrigger?: number;
}

export function MembershipPlanTable({
  data,
  onBulkDelete,
  isBulkDeleting,
  onDelete,
  resetRowSelectionTrigger,
}: MembershipPlanTableProps) {
  const {
    sorting, setSorting,
    columnFilters, setColumnFilters,
    columnVisibility, setColumnVisibility,
    rowSelection, setRowSelection,
    globalFilter, setGlobalFilter,
    pagination, setPagination,
  } = useDataTable();

  const columns = getMembershipPlanColumns({ onDelete });

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
    debugTable: true,
  });

  useEffect(() => {
    table.resetRowSelection();
    setRowSelection({});
  }, [resetRowSelectionTrigger]);

  return (
    <>
      <DataTableToolbar
        table={table}
        onBulkDelete={onBulkDelete}
        isBulkDeleting={isBulkDeleting}
        showBulkDeleteButton
        showExportButton
        filterPlaceholder="Buscar plan de membresía..."
        exportFileName="planes de membresía"
        showFilterButton
        onFilterClick={() => console.log("Filtrar")}
        showSortButton
      />
      <DataTable table={table} columns={columns} />
      <DataTablePagination table={table} />
    </>
  );
}
