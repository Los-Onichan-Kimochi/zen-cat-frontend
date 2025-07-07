'use client';

import { Community } from '@/types/community';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { getCommunityColumns } from './community-columns';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/common/data-table/data-table';
import { DataTableToolbar } from '@/components/common/data-table/data-table-toolbar';
import { DataTablePagination } from '@/components/common/data-table/data-table-pagination';
import { CommunityFilters } from './filters';
import { CommunityFiltersModal } from './filters-modal';
import { useCommunityFilters } from '@/hooks/use-community-filters';
import { useEffect } from 'react';

interface CommunityTableProps {
  data: Community[];
  onBulkDelete: (ids: string[]) => void;
  isBulkDeleting: boolean;
  onDelete: (community: Community) => void;
  onEdit: (community: Community) => void;
  resetRowSelectionTrigger?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function CommunityTable({
  data,
  onBulkDelete,
  isBulkDeleting,
  onDelete,
  onEdit,
  resetRowSelectionTrigger,
  onRefresh,
  isRefreshing = false,
}: CommunityTableProps) {
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

  // Hook de filtros de comunidades
  const {
    filters,
    filteredData,
    hasActiveFilters,
    isFiltersModalOpen,
    updateFilters,
    clearFilters,
    openFiltersModal,
    closeFiltersModal,
    applyFilters,
  } = useCommunityFilters(data);

  const columns = getCommunityColumns({ onDelete, onEdit });

  const table = useReactTable({
    data: filteredData, // Usar datos filtrados en lugar de datos originales
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
      <div className="space-y-3">
        {/* Filtros */}
        <CommunityFilters
          filters={filters}
          onOpenFilters={openFiltersModal}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Toolbar */}
        <DataTableToolbar
          table={table}
          onBulkDelete={onBulkDelete}
          isBulkDeleting={isBulkDeleting}
          showBulkDeleteButton
          showExportButton
          showRefreshButton={!!onRefresh}
          filterPlaceholder="Buscar comunidad..."
          exportFileName="comunidades"
          showFilterButton
          onFilterClick={openFiltersModal}
          onRefreshClick={onRefresh}
          isRefreshing={isRefreshing}
          showSortButton
        />
      </div>

      <div className="flex-1 min-h-0 mt-4">
        <DataTable
          table={table}
          columns={columns}
          isRefreshing={isRefreshing}
        />
      </div>
      <DataTablePagination table={table} />

      {/* Modal de filtros */}
      <CommunityFiltersModal
        isOpen={isFiltersModalOpen}
        onClose={closeFiltersModal}
        filters={filters}
        onFiltersChange={updateFilters}
        onClearFilters={clearFilters}
        onApplyFilters={applyFilters}
      />
    </div>
  );
}
