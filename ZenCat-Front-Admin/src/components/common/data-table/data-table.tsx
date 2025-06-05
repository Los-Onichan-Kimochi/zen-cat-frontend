'use client'

import {
  ColumnDef,
  flexRender,
  Table as TanStackTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


interface DataTableProps<TData> {
  table: TanStackTable<TData> 
  columns: ColumnDef<TData, any>[]
}

export function DataTable<TData>({ 
  table, 
  columns
}: DataTableProps<TData>) {

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table className="table-fixed w-full">
        <TableHeader className="bg-gray-200">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className={`${(header.column.columnDef.meta as any)?.className ?? ""} break-words whitespace-normal`}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className={`${(cell.column.columnDef.meta as any)?.className ?? ""} break-words whitespace-normal`}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                {table.getState().globalFilter ? "No hay resultados que coincidan con tu búsqueda." : "No hay resultados."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
} 