'use client'

import * as React from 'react'
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

/**
 * Generic DataTable Component Props
 * Now expects the fully initialized table instance from the parent.
 * @template TData The type of data for each row in the table.
 */
interface DataTableProps<TData> {
  /**
   * The fully initialized TanStack Table instance created in the parent component.
   * This instance holds the state and logic for sorting, filtering, pagination, etc.
   */
  table: TanStackTable<TData> 
  /**
   * The column definitions array. Still needed here to determine colSpan for empty state.
   */
   columns: ColumnDef<TData, any>[] // Use any for TValue here as it's less relevant now
}

/**
 * A reusable data table component built with TanStack Table V8 and shadcn/ui.
 * This version is primarily presentational and expects the table instance via props.
 * @template TData The type of data for each row.
 */
export function DataTable<TData>({ 
  table, 
  columns // Keep columns prop for colSpan calculation
}: DataTableProps<TData>) {
  // No internal state or useReactTable hook needed here anymore.
  // The table instance is managed by the parent component.

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
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
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {/* Check global filter state directly from the passed table instance */}
                {table.getState().globalFilter ? "No results matching your search." : "No results."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
} 