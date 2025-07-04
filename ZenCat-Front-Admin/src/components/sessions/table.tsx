'use client';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { useNavigate } from '@tanstack/react-router';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/common/data-table/data-table';
import { DataTableToolbar } from '@/components/common/data-table/data-table-toolbar';
import { DataTablePagination } from '@/components/common/data-table/data-table-pagination';
import { Session } from '@/types/session';
import { getSessionColumns } from './columns';

interface SessionsTableProps {
  data: Session[];
  onEdit: (session: Session) => void;
  onDelete: (session: Session) => void;
  onView: (session: Session) => void;
  onBulkDelete?: (sessions: Session[]) => void;
  isBulkDeleting?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function SessionsTable({
  data,
  onEdit,
  onDelete,
  onView,
  onBulkDelete,
  isBulkDeleting = false,
  onRefresh,
  isRefreshing = false,
}: SessionsTableProps) {
  const navigate = useNavigate();
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

  const columns = getSessionColumns({
    onEdit,
    onDelete,
    onView,
    onNavigateToReservations: (sessionId: string) => {
      navigate({
        to: '/sesiones/reservas/$sessionId',
        params: { sessionId },
      });
    },
  });

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
  });

  const selectedSessions = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original);

  return (
    <div className="flex-1 flex flex-col h-full">
      <DataTableToolbar
        table={table}
        filterPlaceholder="Buscar sesiones..."
        showSortButton
        showFilterButton
        showExportButton
        showRefreshButton={!!onRefresh}
        onFilterClick={() => {}}
        onRefreshClick={onRefresh}
        isRefreshing={isRefreshing}
        exportFileName="sesiones"
        // Bulk delete functionality
        showBulkDeleteButton={!!onBulkDelete}
        onBulkDelete={
          onBulkDelete
            ? (ids: string[]) => {
                const sessionsToDelete = data.filter((session) =>
                  ids.includes(session.id),
                );
                onBulkDelete(sessionsToDelete);
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
    </div>
  );
}
