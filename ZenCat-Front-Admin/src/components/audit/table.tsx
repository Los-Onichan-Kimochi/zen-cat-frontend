'use client';
import { useMemo, useCallback, useEffect, memo } from 'react';
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

export const AuditTable = memo(function AuditTable({
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

  const columns = useMemo(() => {
    return getAuditColumns({ onView });
  }, [onView]);

  const globalFilterFn = useCallback(
    (row: any, columnIds: string[], filterValue: string) => {
      if (!filterValue) return true;

      const searchValue = filterValue.toLowerCase();
      const rowData = row.original;

      const searchableValues = [
        rowData.userEmail,
        rowData.ipAddress,
        rowData.userAgent,
        rowData.entityName,
        rowData.errorMessage,

        'inicio de sesión',
        'crear registro',
        'actualizar datos',
        'eliminar registro',
        'creación masiva',
        'eliminación masiva',
        'registro de usuario',
        'suscripción',
        'cancelar suscripción',
        'nueva reserva',
        'cancelar reserva',
        'actualizar perfil',

        'usuario del sistema',
        'comunidad',
        'profesional',
        'local',
        'sede',
        'plan de membresía',
        'servicio',
        'sesión',
        'clase',
        'reserva',
        'membresía',
        'proceso de registro',
        'plan de comunidad',
        'servicio comunitario',
        'asignación servicio-local',
        'asignación servicio-profesional',
      ].filter(Boolean);

      for (const value of searchableValues) {
        if (value && value.toString().toLowerCase().includes(searchValue)) {
          return true;
        }
      }

      if (rowData.createdAt) {
        try {
          const date = new Date(rowData.createdAt);
          const dateStr = date.toLocaleDateString('es-ES');
          const timeStr = date.toLocaleTimeString('es-ES');
          if (dateStr.includes(searchValue) || timeStr.includes(searchValue)) {
            return true;
          }
        } catch (error) {
          // Ignorar errores de fecha
        }
      }

      return false;
    },
    [],
  );

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
    globalFilterFn,
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
        filterPlaceholder="Buscar en auditoría..."
        showSortButton
        showFilterButton={!!onOpenFilters}
        showExportButton={true}
        showRefreshButton={!!onRefresh}
        onFilterClick={onOpenFilters}
        onExportClick={onExport}
        onRefreshClick={onRefresh}
        isRefreshing={isRefreshing}
        isBulkDeleteEnabled={false}
        isBulkDeleting={false}
        hasActiveFilters={hasActiveFilters}
        exportFileName="audit-logs"
      />
      <div className="flex-1 overflow-hidden rounded-md border bg-white">
        <DataTable
          table={table}
          columns={columns}
          isRefreshing={isRefreshing}
        />
      </div>
      <DataTablePagination table={table} showRowSelection={false} />
    </div>
  );
});
