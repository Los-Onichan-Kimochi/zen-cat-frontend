'use client';

import { MembershipPlan } from '@/types/membership-plan';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { useDataTable } from '@/hooks/use-data-table';
import { getCommunityMembershipPlanColumns } from './community-membership-plan-columns';
import { DataTable } from '@/components/common/data-table/data-table';
import { DataTableToolbar } from '@/components/common/data-table/data-table-toolbar';
import { DataTablePagination } from '@/components/common/data-table/data-table-pagination';

interface CommunityMembershipPlanTableProps {
  data: MembershipPlan[];
  onDeleteClick: (plan: MembershipPlan) => void;
  onBulkDelete: (ids: string[]) => void;
  isBulkDeleting: boolean;
  disableConfirmBulkDelete: boolean;
}

export function CommunityMembershipPlanTable({
  data,
  onDeleteClick,
  onBulkDelete,
  isBulkDeleting,
  disableConfirmBulkDelete = false,
}: CommunityMembershipPlanTableProps) {
  const {
    sorting, setSorting,
    columnFilters, setColumnFilters,
    columnVisibility, setColumnVisibility,
    rowSelection, setRowSelection,
    globalFilter, setGlobalFilter,
    pagination, setPagination,
  } = useDataTable();

  const columns = getCommunityMembershipPlanColumns(onDeleteClick);

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
        showBulkDeleteButton
        showExportButton={false}
        filterPlaceholder="Buscar plan de membresía..."
        exportFileName="planes-membresía"
        showFilterButton
        onFilterClick={() => console.log('Abrir filtros')}
        showSortButton
        disableConfirmBulkDelete={disableConfirmBulkDelete}
      />
      <DataTable table={table} columns={columns} />
      <DataTablePagination table={table} />
    </>
  );
}
