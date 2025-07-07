'use client';

import { MembershipPlan } from '@/types/membership-plan';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { getMembershipPlanColumns } from './membership-plan-columns';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/common/data-table/data-table';
import { DataTableToolbar } from '@/components/common/data-table/data-table-toolbar';
import { DataTablePagination } from '@/components/common/data-table/data-table-pagination';
import { MembershipPlanFiltersModal } from './filters-modal';
import { useMembershipPlanFilters } from '@/hooks/use-membership-plan-filters';
import { useEffect, useMemo } from 'react';

interface MembershipPlanTableProps {
  data: MembershipPlan[];
  onBulkDelete: (ids: string[]) => void;
  isBulkDeleting: boolean;
  onDelete: (membershipPlan: MembershipPlan) => void;
  onView: (membershipPlan: MembershipPlan) => void;
  resetRowSelectionTrigger?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function MembershipPlanTable({
  data,
  onBulkDelete,
  isBulkDeleting,
  onDelete,
  onView,
  resetRowSelectionTrigger,
  onRefresh,
  isRefreshing = false,
}: MembershipPlanTableProps) {
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
    activeFiltersCount,
    applyFilters,
    clearFilters,
    openModal,
    closeModal,
    filterMembershipPlans,
  } = useMembershipPlanFilters();

  const columns = getMembershipPlanColumns({ onDelete, onView });

  // Aplicar filtros a los datos
  const filteredData = useMemo(() => {
    return filterMembershipPlans(data);
  }, [data, filterMembershipPlans]);

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
    debugTable: true,
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
        filterPlaceholder="Buscar plan de membresía..."
        exportFileName="planes de membresía"
        showFilterButton
        onFilterClick={openModal}
        onRefreshClick={onRefresh}
        isRefreshing={isRefreshing}
        showSortButton
      />
      <div className="flex-1 min-h-0">
        <DataTable
          table={table}
          columns={columns}
          isRefreshing={isRefreshing}
        />
      </div>
      <DataTablePagination table={table} />

      {/* Modal de filtros */}
      <MembershipPlanFiltersModal
        open={isModalOpen}
        onClose={closeModal}
        filters={filters}
        onApplyFilters={applyFilters}
        onClearFilters={clearFilters}
      />
    </div>
  );
}
