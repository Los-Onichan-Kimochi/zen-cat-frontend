'use client';

import * as React from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ConfirmDeleteBulkDialog } from '@/components/common/confirm-delete-dialogs';
import { Table, Column } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Trash,
  Filter,
  ChevronDown,
  Download,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { getColumnLabel } from '@/utils/column-labels';

interface DataWithId {
  id: string | number;
  [key: string]: any;
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  onBulkDelete?: (ids: string[]) => void;
  isBulkDeleting: boolean;
  isBulkDeleteEnabled?: boolean;
  showBulkDeleteButton?: boolean;
  filterPlaceholder: string;
  showFilterButton?: boolean;
  onFilterClick?: () => void;
  onExportClick?: () => void;
  showExportButton?: boolean;
  exportFileName?: string;
  showSortButton?: boolean;
  disableConfirmBulkDelete?: boolean;
  hasActiveFilters?: boolean;
  showRefreshButton?: boolean;
  onRefreshClick?: () => void;
  isRefreshing?: boolean;
}

function getColumnDisplayName<TData>(column: Column<TData, unknown>): string {
  const friendlyName = getColumnLabel(column.id);

  if (friendlyName === column.id) {
    return typeof column.columnDef.header === 'string'
      ? column.columnDef.header
      : column.id;
  }

  return friendlyName;
}

export function DataTableToolbar<TData extends DataWithId>({
  table,
  onBulkDelete,
  isBulkDeleting,
  isBulkDeleteEnabled = true,
  showBulkDeleteButton = false,
  filterPlaceholder,
  showFilterButton = false,
  onFilterClick,
  onExportClick,
  showExportButton = false,
  exportFileName = 'data',
  showSortButton = false,
  disableConfirmBulkDelete = false,
  hasActiveFilters = false,
  showRefreshButton = false,
  onRefreshClick,
  isRefreshing = false,
}: DataTableToolbarProps<TData>) {
  const rowsSelected = table.getFilteredSelectedRowModel().rows.length > 0;
  const [filterValue, setFilterValue] = React.useState(
    (table.getState().globalFilter as string) ?? '',
  );

  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] =
    React.useState(false);
  const [idsToDelete, setIdsToDelete] = React.useState<string[]>([]);

  React.useEffect(() => {
    const initial = (table.getState().globalFilter as string) ?? '';
    if (filterValue !== initial) {
      const timeout = setTimeout(() => table.setGlobalFilter(filterValue), 300);
      return () => clearTimeout(timeout);
    }
  }, [filterValue, table]);

  React.useEffect(() => {
    const external = (table.getState().globalFilter as string) ?? '';
    if (external !== filterValue) setFilterValue(external);
  }, [table.getState().globalFilter]);

  const handleDeleteSelected = () => {
    const selectedIds = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original.id as string);

    if (selectedIds.length === 0) return;

    if (disableConfirmBulkDelete) {
      onBulkDelete?.(selectedIds);
    } else {
      setIdsToDelete(selectedIds);
      setIsBulkDeleteModalOpen(true);
    }
  };

  const handleConfirmBulkDelete = () => {
    if (onBulkDelete) {
      onBulkDelete(idsToDelete);
    }
    setIsBulkDeleteModalOpen(false);
  };

  function exportToCSV<T>(table: Table<T>, fileName: string) {
    const rows = table.getFilteredRowModel().rows;

    const visibleColumns = table
      .getAllColumns()
      .filter(
        (col) =>
          col.getIsVisible() && col.id !== 'select' && col.id !== 'actions',
      );

    const header = visibleColumns.map((col) => col.id);
    const data = rows.map((row) =>
      visibleColumns.reduce(
        (acc, col) => {
          acc[col.id] = row.getValue(col.id);
          return acc;
        },
        {} as Record<string, any>,
      ),
    );

    const csvRows = [
      header,
      ...data.map((row) => header.map((key) => JSON.stringify(row[key] ?? ''))),
    ];
    const csvContent = csvRows.map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${fileName}.csv`);
  }

  function exportToXLSX<T>(table: Table<T>, fileName: string) {
    const rows = table.getFilteredRowModel().rows;

    const visibleColumns = table
      .getAllColumns()
      .filter(
        (col) =>
          col.getIsVisible() && col.id !== 'select' && col.id !== 'actions',
      );

    const data = rows.map((row) =>
      visibleColumns.reduce(
        (acc, col) => {
          acc[col.id] = row.getValue(col.id);
          return acc;
        },
        {} as Record<string, any>,
      ),
    );

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hoja 1');
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `${fileName}.xlsx`);
  }

  return (
    <>
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center flex-1">
          <Input
            placeholder={filterPlaceholder}
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="max-w-sm h-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
          />
        </div>
        <div className="flex items-center space-x-2 ml-4">
          {showRefreshButton && onRefreshClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefreshClick}
              disabled={isRefreshing}
              className={`h-10 border-gray-300 hover:bg-black hover:text-white hover:border-black transition-all duration-200 cursor-pointer hover:shadow-sm active:scale-95 ${
                isRefreshing ? 'bg-blue-50 border-blue-300' : ''
              }`}
            >
              <RefreshCw
                className={`h-4 w-4 transition-transform duration-200 ${isRefreshing ? 'animate-spin' : 'hover:rotate-180'}`}
              />
            </Button>
          )}
          {showSortButton && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 border-gray-300 hover:bg-black hover:text-white hover:border-black transition-all duration-200 cursor-pointer hover:shadow-sm active:scale-95"
                >
                  <ArrowUpDown className="mr-2 h-4 w-4 opacity-50" />
                  Ordenar por
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter(
                    (col) =>
                      col.getCanSort() &&
                      col.id !== 'select' &&
                      col.id !== 'actions' &&
                      col.id !== 'userAgent' &&
                      col.id !== 'ipAddress',
                  )
                  .map((col) => {
                    const dir = col.getIsSorted();
                    return (
                      <DropdownMenuItem
                        key={col.id}
                        onClick={() => col.toggleSorting(dir === 'asc', false)}
                      >
                        <span className="flex-1 pr-2">
                          {getColumnDisplayName(col)}
                        </span>
                        {dir === 'asc' && <ArrowUp className="h-4 w-4" />}
                        {dir === 'desc' && <ArrowDown className="h-4 w-4" />}
                        {!dir && <ArrowUpDown className="h-4 w-4 opacity-50" />}
                      </DropdownMenuItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {showFilterButton && onFilterClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onFilterClick}
              className={`h-10 border-gray-300 hover:bg-black hover:text-white hover:border-black transition-all duration-200 cursor-pointer hover:shadow-sm active:scale-95 ${
                hasActiveFilters ? 'bg-blue-50 border-blue-300' : ''
              }`}
            >
              <Filter className="mr-2 h-4 w-4" />
              <span>Filtrar</span>
              {hasActiveFilters && (
                <Badge
                  variant="secondary"
                  className="ml-2 bg-blue-100 text-blue-800 text-xs"
                >
                  •
                </Badge>
              )}
            </Button>
          )}
          {showFilterButton && !onFilterClick && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 border-gray-300 hover:bg-black hover:text-white hover:border-black transition-all duration-200 cursor-pointer hover:shadow-sm active:scale-95"
                >
                  <Filter className="mr-2 h-4 w-4 opacity-50" /> Filtrar
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtros</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Opción A</DropdownMenuItem>
                <DropdownMenuItem>Opción B</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {showExportButton && onExportClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExportClick}
              className="h-10 border-gray-300 hover:bg-black hover:text-white hover:border-black transition-all duration-200 cursor-pointer hover:shadow-sm active:scale-95"
            >
              <Download className="mr-2 h-4 w-4" />
              <span>Exportar</span>
            </Button>
          )}
          {showExportButton && !onExportClick && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 border-gray-300 hover:bg-black hover:text-white hover:border-black transition-all duration-200 cursor-pointer hover:shadow-sm active:scale-95"
                >
                  <Download className="mr-2 h-4 w-4 opacity-50" /> Exportar
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    exportToCSV(table, exportFileName);
                  }}
                >
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    exportToXLSX(table, exportFileName);
                  }}
                >
                  Excel (.xlsx)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {showBulkDeleteButton && (
            <Button
              variant="destructive"
              size="sm"
              type="button"
              className="h-10 bg-red-500 text-white font-bold hover:bg-black hover:text-white transition-all duration-200 cursor-pointer hover:shadow-md active:scale-95"
              onClick={handleDeleteSelected}
              disabled={!rowsSelected || isBulkDeleting || !isBulkDeleteEnabled}
            >
              <Trash className="mr-2 h-4 w-4" /> Eliminar
            </Button>
          )}
        </div>
      </div>
      <ConfirmDeleteBulkDialog
        isOpen={isBulkDeleteModalOpen}
        onOpenChange={setIsBulkDeleteModalOpen}
        count={idsToDelete.length}
        onConfirm={handleConfirmBulkDelete}
      />
    </>
  );
}
