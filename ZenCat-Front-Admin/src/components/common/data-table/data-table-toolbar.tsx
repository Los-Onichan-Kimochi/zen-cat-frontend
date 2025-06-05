'use client';

import * as React from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ConfirmDeleteBulkDialog } from '@/components/common/confirm-delete-dialogs';
import { Table, Column } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash, Filter, ChevronDown, Download, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

interface DataWithId {
  id: string | number;
  [key: string]: any;
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  onBulkDelete?: (ids: string[]) => void;
  isBulkDeleting: boolean;
  showBulkDeleteButton?: boolean;
  filterPlaceholder: string;
  showFilterButton?: boolean;
  onFilterClick?: () => void;
  showExportButton?: boolean;
  exportFileName?: string;
  showSortButton?: boolean;
}

function getColumnDisplayName<TData>(column: Column<TData, unknown>): string {
  return typeof column.columnDef.header === 'string'
    ? column.columnDef.header
    : column.id;
}

export function DataTableToolbar<TData extends DataWithId>({
  table,
  onBulkDelete,
  isBulkDeleting,
  showBulkDeleteButton = false,
  filterPlaceholder,
  showFilterButton = false,
  onFilterClick,
  showExportButton = false,
  exportFileName = 'data',
  showSortButton = false,
}: DataTableToolbarProps<TData>) {

  const rowsSelected = table.getFilteredSelectedRowModel().rows.length > 0;
  const [filterValue, setFilterValue] = React.useState((table.getState().globalFilter as string) ?? '');

  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = React.useState(false);
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
    const selectedIds = table.getFilteredSelectedRowModel().rows.map(row => row.original.id as string);
    if (selectedIds.length === 0) return;
    setIdsToDelete(selectedIds);
    setIsBulkDeleteModalOpen(true);
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
      .filter((col) => col.getIsVisible() && col.id !== 'select' && col.id !== 'actions');

    const header = visibleColumns.map((col) => col.id);
    const data = rows.map((row) =>
      visibleColumns.reduce((acc, col) => {
        acc[col.id] = row.getValue(col.id);
        return acc;
      }, {} as Record<string, any>)
    );

    const csvRows = [header, ...data.map((row) => header.map((key) => JSON.stringify(row[key] ?? '')))];
    const csvContent = csvRows.map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${fileName}.csv`);
  }

  function exportToXLSX<T>(table: Table<T>, fileName: string) {
    const rows = table.getFilteredRowModel().rows;

    const visibleColumns = table
      .getAllColumns()
      .filter((col) => col.getIsVisible() && col.id !== 'select' && col.id !== 'actions');

    const data = rows.map((row) =>
      visibleColumns.reduce((acc, col) => {
        acc[col.id] = row.getValue(col.id);
        return acc;
      }, {} as Record<string, any>)
    );

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hoja 1");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
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
            className="max-w-sm h-10"
          />
        </div>
        <div className="flex items-center space-x-2 ml-4">
          {showSortButton && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" 
                  className="h-10 zcursor-pointer">
                  <ArrowUpDown className="mr-2 h-4 w-4 opacity-50" />Ordenar por<ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((col) => col.getCanSort() && col.id !== 'select' && col.id !== 'actions')
                  .map((col) => {
                    const dir = col.getIsSorted();
                    return (
                      <DropdownMenuItem
                        key={col.id}
                        onClick={() => col.toggleSorting(dir === 'asc', false)}
                      >
                        <span className="flex-1 pr-2">{getColumnDisplayName(col)}</span>
                        {dir === 'asc' && <ArrowUp className="h-4 w-4" />}
                        {dir === 'desc' && <ArrowDown className="h-4 w-4" />}
                        {!dir && <ArrowUpDown className="h-4 w-4 opacity-50" />}
                      </DropdownMenuItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {showFilterButton && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10">
                  <Filter className="mr-2 h-4 w-4 opacity-50" /> Filtrar
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtros</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onFilterClick}>Opción A</DropdownMenuItem>
                <DropdownMenuItem onClick={onFilterClick}>Opción B</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {showExportButton && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10">
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
              className="h-10 font-bold"
              onClick={handleDeleteSelected}
              disabled={!rowsSelected || isBulkDeleting}
            >
              <Trash className="mr-2 h-4 w-4"/> Eliminar
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