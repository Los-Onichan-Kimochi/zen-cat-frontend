'use client';

import {
  ColumnDef,
  flexRender,
  Table as TanStackTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DataTableProps<TData> {
  table: TanStackTable<TData>;
  columns: ColumnDef<TData, any>[];
}

export function DataTable<TData>({ table, columns }: DataTableProps<TData>) {
  return (
    <div className="w-full overflow-auto">
      <Table className="w-full min-w-full">
        <TableHeader className="bg-gray-50/75 sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className={`${(header.column.columnDef.meta as any)?.className ?? ''} break-words whitespace-normal px-3 py-3 text-left text-sm font-medium text-gray-900`}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, index) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className={`border-b border-gray-200 hover:bg-gray-50/50 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/25'
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={`${(cell.column.columnDef.meta as any)?.className ?? ''} break-words whitespace-normal px-3 py-4 text-sm text-gray-900`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-32 text-center text-gray-500">
                {table.getState().globalFilter
                  ? 'No hay resultados que coincidan con tu búsqueda.'
                  : 'No hay resultados.'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
