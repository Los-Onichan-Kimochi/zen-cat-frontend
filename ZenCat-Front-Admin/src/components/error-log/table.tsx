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
import { ErrorLog } from '@/types/error-log';
import { getErrorColumns } from './columns';
import { useEffect, useCallback } from 'react';
import { getActionConfig, getEntityConfig } from '@/types/audit';

interface ErrorTableProps {
  data: ErrorLog[];
  onView?: (log: ErrorLog) => void;
  onExport?: () => void;
  onOpenFilters?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  isRefreshing?: boolean;
  resetSelection?: number;
  hasActiveFilters?: boolean;
}

export function ErrorTable({
  data,
  onView,
  onExport,
  onOpenFilters,
  onRefresh,
  isLoading = false,
  isRefreshing = false,
  resetSelection = 0,
  hasActiveFilters = false,
}: ErrorTableProps) {
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

  const columns = getErrorColumns({ onView });

  // Función de filtro global personalizada que incluye búsqueda en badges
  const globalFilterFn = useCallback((row: any, columnIds: string[], filterValue: string) => {
    if (!filterValue) return true;
    
    const searchValue = filterValue.toLowerCase();
    const rowData = row.original;

    // Lista de todas las posibles coincidencias
    const searchableValues = [
      // Campos básicos
      rowData.userEmail,
      rowData.ipAddress,
      rowData.userAgent,
      rowData.entityName,
      rowData.errorMessage,
      
      // Action labels específicos
      'fallo de autenticación',
      'fallo al crear',
      'fallo al actualizar', 
      'fallo al eliminar',
      'inicio de sesión',
      'crear registro',
      'actualizar datos',
      'eliminar registro',
      
      // Entity labels específicos
      'usuario del sistema',
      'comunidad',
      'profesional',
      'local',
      'servicio',
      'sesión',
      'reserva',
      
      // Error descriptions específicos  
      'credenciales incorrectas',
      'error al crear usuario del sistema',
      'error al crear',
      'error al actualizar',
      'error al eliminar',
      'error del sistema',
      'sin autorización',
      'datos inválidos',
      'registro no encontrado'
    ].filter(Boolean);

    // Buscar en todos los valores
    for (const value of searchableValues) {
      if (value && value.toString().toLowerCase().includes(searchValue)) {
        return true;
      }
    }

    // Buscar en fecha formateada
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
  }, []);

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
        filterPlaceholder="Buscar en logs de errores..."
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
        exportFileName="error-logs"
      />
      <div className="flex-1 overflow-hidden rounded-md border bg-white">
        <DataTable table={table} columns={columns} isRefreshing={isRefreshing} />
      </div>
      <DataTablePagination table={table} showRowSelection={false} />
    </div>
  );
}

export default ErrorTable; 