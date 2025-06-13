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
import { AuditLog, AuditLogFilters } from '@/types/audit';
import { getAuditColumns } from './columns';
import { useEffect } from 'react';

interface AuditTableProps {
  data: AuditLog[];
  onView?: (log: AuditLog) => void;
  onExport?: () => void;
  onOpenFilters?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  isRefreshing?: boolean;
  resetSelection?: number;
  hasActiveFilters?: boolean;
}

export function AuditTable({
  data,
  onView,
  onExport,
  onOpenFilters,
  onRefresh,
  isLoading = false,
  isRefreshing = false,
  resetSelection = 0,
  hasActiveFilters = false,
}: AuditTableProps) {
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

  const columns = getAuditColumns({ onView });

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
    enableRowSelection: false,
  });

  useEffect(() => {
    if (resetSelection > 0) {
      setRowSelection({});
    }
  }, [resetSelection, setRowSelection]);

  return (
    <div className="-mx-4 flex-1 flex flex-col px-4 py-2 h-full">
      <DataTableToolbar
        table={table}
        filterPlaceholder="Buscar en logs de auditoría..."
        showSortButton
        showFilterButton={!!onOpenFilters}
        showExportButton={!!onExport}
        showRefreshButton={!!onRefresh}
        onFilterClick={onOpenFilters}
        onExportClick={onExport}
        onRefreshClick={onRefresh}
        isRefreshing={isRefreshing}
        isBulkDeleteEnabled={false}
        hasActiveFilters={hasActiveFilters}
      />
      <div className="flex-1 overflow-hidden rounded-md border bg-white">
        <DataTable table={table} columns={columns} isRefreshing={isRefreshing} />
      </div>
      <DataTablePagination table={table} />
    </div>
  );
} 