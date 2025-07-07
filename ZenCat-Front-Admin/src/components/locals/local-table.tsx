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
import { LocalFiltersModal } from './filters-modal';
import { useLocalFilters } from '@/hooks/use-local-filters';
import { useEffect, useMemo } from 'react';

interface LocalsTableProps {
  data: Local[];
  onBulkDelete: (locals: Local[]) => void;
  isBulkDeleting: boolean;
  onEdit: (local: Local) => void;
  onDelete: (local: Local) => void;
  onView: (local: Local) => void;
  resetRowSelectionTrigger?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function LocalsTable({
  data,
  onBulkDelete,
  isBulkDeleting,
  onEdit,
  onDelete,
  onView,
  resetRowSelectionTrigger,
  onRefresh,
  isRefreshing = false,
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

  const {
    filters,
    isModalOpen,
    hasActiveFilters,
    activeFiltersCount,
    applyFilters,
    clearFilters,
    openModal,
    closeModal,
    filterLocals,
  } = useLocalFilters();

  const columns = getLocalColumns({ onEdit, onDelete, onView });

  // Aplicar filtros a los datos
  const filteredData = useMemo(() => {
    return filterLocals(data);
  }, [data, filterLocals]);

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

  useEffect(() => {
    table.resetRowSelection();
    setRowSelection({});
  }, [resetRowSelectionTrigger]);

  return (
    <div className="-mx-4 flex-1 flex flex-col px-4 py-2 h-full">
      <DataTableToolbar
        table={table}
        filterPlaceholder="Buscar local..."
        showSortButton
        showFilterButton
        showExportButton
        showRefreshButton={!!onRefresh}
        onFilterClick={openModal}
        onRefreshClick={onRefresh}
        isRefreshing={isRefreshing}
        exportFileName="locales"
        // Bulk delete functionality
        showBulkDeleteButton={!!onBulkDelete}
        onBulkDelete={
          onBulkDelete
            ? (ids: string[]) => {
                const localsToDelete = filteredData.filter((local) =>
                  ids.includes(local.id),
                );
                onBulkDelete(localsToDelete);
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
      <LocalFiltersModal
        open={isModalOpen}
        onClose={closeModal}
        filters={filters}
        onApplyFilters={applyFilters}
        onClearFilters={clearFilters}
      />
    </div>
  );
}
