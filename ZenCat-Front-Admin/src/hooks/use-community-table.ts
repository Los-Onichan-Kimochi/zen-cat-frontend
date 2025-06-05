import { useState } from 'react';
import {
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  PaginationState,
} from '@tanstack/react-table';

export function useCommunityTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  return {
    sorting, setSorting,
    columnFilters, setColumnFilters,
    columnVisibility, setColumnVisibility,
    rowSelection, setRowSelection,
    globalFilter, setGlobalFilter,
    pagination, setPagination,
  };
}
