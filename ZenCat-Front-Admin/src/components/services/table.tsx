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
import { Service } from '@/types/service';
import { getServiceColumns } from './columns';
import { ServiceFiltersModal } from './filters-modal';
import { useServiceFilters } from '@/hooks/use-service-filters';

interface ServicesTableProps {
  data: Service[];
  onDelete: (service: Service) => void;
  onView: (service: Service) => void;
  onBulkDelete?: (services: Service[]) => void;
  isBulkDeleting?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function ServicesTable({
  data,
  onDelete,
  onView,
  onBulkDelete,
  isBulkDeleting = false,
  onRefresh,
  isRefreshing = false,
}: ServicesTableProps) {
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
    filterServices,
  } = useServiceFilters();

  const columns = getServiceColumns({ onDelete, onView });

  // Aplicar filtros a los datos
  const filteredData = useMemo(() => {
    return filterServices(data);
  }, [data, filterServices]);

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
        filterPlaceholder="Buscar servicios..."
        showSortButton
        showFilterButton
        showExportButton
        showRefreshButton={!!onRefresh}
        onFilterClick={openModal}
        onRefreshClick={onRefresh}
        isRefreshing={isRefreshing}
        exportFileName="servicios"
        // Bulk delete functionality
        showBulkDeleteButton={!!onBulkDelete}
        onBulkDelete={
          onBulkDelete
            ? (ids: string[]) => {
                const servicesToDelete = data.filter((service) =>
                  ids.includes(service.id),
                );
                onBulkDelete(servicesToDelete);
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
      <ServiceFiltersModal
        open={isModalOpen}
        onClose={closeModal}
        filters={filters}
        onApplyFilters={applyFilters}
        onClearFilters={clearFilters}
      />
    </div>
  );
}
