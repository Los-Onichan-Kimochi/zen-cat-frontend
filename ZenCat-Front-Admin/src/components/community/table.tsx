'use client';

import { Community } from '@/types/community';
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel } from '@tanstack/react-table';
import { getCommunityColumns } from './columns';
import { useCommunityTable } from '@/hooks/use-community-table';
import { DataTable } from '@/components/common/data-table/data-table';
import { DataTableToolbar } from '@/components/common/data-table/data-table-toolbar';
import { DataTablePagination } from '@/components/common/data-table/data-table-pagination';
import { useEffect } from 'react';

interface CommunityTableProps {
  data: Community[];
  onBulkDelete: (ids: string[]) => void;
  isBulkDeleting: boolean;
  onDeleteClick: (community: Community) => void;
  resetRowSelectionTrigger?: number;
}

export function CommunityTable({
  data,
  onBulkDelete,
  isBulkDeleting,
  onDeleteClick,
  resetRowSelectionTrigger,
}: CommunityTableProps) {
  const {
    sorting, setSorting,
    columnFilters, setColumnFilters,
    columnVisibility, setColumnVisibility,
    rowSelection, setRowSelection,
    globalFilter, setGlobalFilter,
    pagination, setPagination,
  } = useCommunityTable();

  const columns = getCommunityColumns({ onDeleteClick });

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
    <>
      <DataTableToolbar
        table={table}
        onBulkDelete={onBulkDelete}
        isBulkDeleting={isBulkDeleting}
        showBulkDeleteButton
        showExportButton
        filterPlaceholder="Buscar comunidad..."
        exportFileName="comunidades"
        showFilterButton
        onFilterClick={() => console.log("Filtrar")}
        showSortButton
      />
      <DataTable table={table} columns={columns} />
      <DataTablePagination table={table} />
    </>
  );
}
