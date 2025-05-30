'use client';

import * as React from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
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
import { professionalsApi } from '@/api/professionals/professionals';

interface DataWithId {
  id: string | number;
  [key: string]: any;
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  filterPlaceholder: string;
  showFilterButton?: boolean;
  onFilterClick?: () => void;
  showExportButton?: boolean;
  onExportClick?: () => void;
  showSortButton?: boolean;
}

function getColumnDisplayName<TData>(column: Column<TData, unknown>): string {
  return typeof column.columnDef.header === 'string'
    ? column.columnDef.header
    : column.id;
}

export function DataTableToolbar<TData extends DataWithId>({
  table,
  filterPlaceholder,
  showFilterButton = false,
  onFilterClick,
  showExportButton = false,
  onExportClick,
  showSortButton = false,
}: DataTableToolbarProps<TData>) {
  const queryClient = useQueryClient();

  const { mutate: deleteProfessional, isPending: isDeleting } = useMutation<void, Error, string>({
    mutationFn: (id) => professionalsApi.deleteProfessional(id),
    onSuccess: (_, id) => {
      toast.success('Profesional eliminado', { description: `ID ${id}` });
      queryClient.invalidateQueries({ queryKey: ['professionals'] });

    },
    onError: (err) => {
      toast.error('Error al eliminar', { description: err.message });
    },
  });

  const rowsSelected = table.getFilteredSelectedRowModel().rows.length > 0;
  const [filterValue, setFilterValue] = React.useState((table.getState().globalFilter as string) ?? '');

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
      .rows
      .map((row) => row.original.id as string);

    if (selectedIds.length === 0) return;
    if (!window.confirm(`¿Eliminar ${selectedIds.length} profesional(es)?`)) return;
    selectedIds.forEach((id) => deleteProfessional(id));
    table.resetRowSelection();
  };

  return (
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
              <Button variant="outline" size="sm" className="h-10">
                Ordenar por<ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuSeparator />
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
                <Filter className="mr-2 h-4 w-4 opacity-50" /> Filtrar por<ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filtrar por...</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onFilterClick}>Opción A</DropdownMenuItem>
              <DropdownMenuItem onClick={onFilterClick}>Opción B</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {showExportButton && (
          <Button variant="outline" size="sm" className="h-10" onClick={onExportClick}>
            <Download className="mr-2 h-4 w-4 opacity-50" /> Exportar
          </Button>
        )}
        <Button
          variant="destructive"
          size="sm"
          className="h-10 font-black"
          onClick={handleDeleteSelected}
          disabled={!rowsSelected || isDeleting}
        >
          <Trash className="mr-2 h-4 w-4" /> Eliminar
        </Button>
      </div>
    </div>
  );
}
