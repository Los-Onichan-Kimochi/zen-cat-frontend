'use client';
import React, { useMemo } from 'react';
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
import { getProfessionalColumns } from './professional-columns';
import { ProfessionalFiltersModal } from './filters-modal';
import { useProfessionalFilters } from '@/hooks/use-professional-filters';

interface ProfessionalsTableProps {
  data: Professional[];
  onEdit: (professional: Professional) => void;
  onDelete: (professional: Professional) => void;
  onView: (professional: Professional) => void;
  onBulkDelete?: (professionals: Professional[]) => void;
  isBulkDeleting?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function ProfessionalsTable({
  data,
  onEdit,
  onDelete,
  onView,
  onBulkDelete,
  isBulkDeleting = false,
  onRefresh,
  isRefreshing = false,
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

  const {
    filters,
    isModalOpen,
    hasActiveFilters,
    openModal,
    closeModal,
    applyFilters,
    clearFilters,
    filterProfessionals,
  } = useProfessionalFilters();

  const columns = getProfessionalColumns({ onEdit, onDelete, onView });

  // Aplicar filtros a los datos
  const filteredData = useMemo(() => {
    return filterProfessionals(data);
  }, [data, filterProfessionals]);

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
  });

  return (
    <div className="-mx-4 flex-1 flex flex-col px-4 py-2 h-full">
      <DataTableToolbar
        table={table}
        filterPlaceholder="Buscar profesionales..."
        showSortButton
        showFilterButton
        showExportButton
        showRefreshButton={!!onRefresh}
        onFilterClick={openModal}
        onRefreshClick={onRefresh}
        isRefreshing={isRefreshing}
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
      <div className="flex-1 overflow-hidden rounded-md border bg-white">
        <DataTable
          table={table}
          columns={columns}
          isRefreshing={isRefreshing}
        />
      </div>
      <DataTablePagination table={table} />

      {/* Modal de filtros */}
      <ProfessionalFiltersModal
        open={isModalOpen}
        onClose={closeModal}
        filters={filters}
        onApplyFilters={applyFilters}
        onClearFilters={clearFilters}
      />
    </div>
  );
}
