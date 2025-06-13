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

  const columns = getCommunityColumns({ onDelete, onEdit });

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
        filterPlaceholder="Buscar comunidad..."
        exportFileName="comunidades"
        showFilterButton
        onFilterClick={() => {}}
        onRefreshClick={onRefresh}
        isRefreshing={isRefreshing}
        showSortButton
      />
      <div className="flex-1 min-h-0">
        <DataTable table={table} columns={columns} isRefreshing={isRefreshing} />
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
