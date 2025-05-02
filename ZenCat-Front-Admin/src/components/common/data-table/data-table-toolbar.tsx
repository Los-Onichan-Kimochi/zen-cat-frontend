'use client'

import * as React from 'react'
import { Table, Column } from '@tanstack/react-table'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Trash2, Filter, ChevronDown, Download, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DataWithId {
  id: string | number;
  [key: string]: any;
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  filterPlaceholder: string
  showFilterButton?: boolean
  onFilterClick?: () => void
  showExportButton?: boolean
  onExportClick?: () => void
  showSortButton?: boolean
}

function getColumnDisplayName<TData>(column: Column<TData, unknown>): string {
  if (typeof column.columnDef.header === 'string') {
    return column.columnDef.header;
  }
  return column.id;
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

  const isFiltered = table.getState().globalFilter?.length > 0
  const rowsSelected = table.getFilteredSelectedRowModel().rows.length > 0

  const [filterValue, setFilterValue] = React.useState(
    (table.getState().globalFilter as string) ?? ''
  )

  React.useEffect(() => {
    const initialValue = (table.getState().globalFilter as string) ?? ''
    if (filterValue !== initialValue) {
      const timeout = setTimeout(() => {
        table.setGlobalFilter(filterValue)
      }, 300)

      return () => clearTimeout(timeout)
    }
  }, [filterValue, table.setGlobalFilter])

  React.useEffect(() => {
    const externalFilter = (table.getState().globalFilter as string) ?? '';
    if (externalFilter !== filterValue) {
         setFilterValue(externalFilter);
      }
  }, [table.getState().globalFilter]);

  const handleDeleteSelected = () => {
    const selectedIds = table
      .getFilteredSelectedRowModel()
      .rows.filter(row => row.original && typeof row.original.id !== 'undefined')
      .map(row => row.original.id);
    
    if (selectedIds.length > 0) {
        console.log("Deleting rows with IDs:", selectedIds);
        // TODO: Implement actual delete logic (e.g., API call)
    } else {
        console.log("Delete clicked, but no rows selected or no valid IDs found.");
    }
    table.resetRowSelection(); 
  };

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center flex-1">
        <Input
          placeholder={filterPlaceholder}
          value={filterValue}
          onChange={(event) => setFilterValue(event.target.value)}
          className="max-w-sm h-10"
        />
      </div>

      <div className="flex items-center space-x-2 ml-4">
         {showSortButton && (
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10">
                Ordenar por
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ordenar por Columna</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    column.getCanSort() &&
                    column.id !== 'select' &&
                    column.id !== 'actions'
                )
                .map((column) => {
                  const sortDirection = column.getIsSorted();
                  return (
                    <DropdownMenuItem
                      key={column.id}
                      onClick={() => column.toggleSorting(sortDirection === 'asc', false)} 
                    >
                      <span className="flex-1 pr-2">{getColumnDisplayName(column)}</span>
                      {sortDirection === 'asc' && <ArrowUp className="h-4 w-4 text-muted-foreground" />}
                      {sortDirection === 'desc' && <ArrowDown className="h-4 w-4 text-muted-foreground" />}
                      {!sortDirection && <ArrowUpDown className="h-4 w-4 text-muted-foreground opacity-50" />}
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
                <Filter className="mr-2 h-4 w-4 opacity-50" /> Filtrar por
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filtrar por...</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Opción A</DropdownMenuItem>
              <DropdownMenuItem>Opción B</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {showExportButton && (
          <Button variant="outline" size="sm" className="h-10" onClick={onExportClick}>
             <Download className="mr-2 h-4 w-4 opacity-50"/> Exportar
          </Button>
        )}
       
        <Button
          variant="destructive"
          size="sm"
          className="h-10"
          onClick={handleDeleteSelected}
          disabled={!rowsSelected} 
        >
          <Trash2 className="mr-2 h-4 w-4" /> Eliminar
        </Button>
      </div>
    </div>
  )
} 