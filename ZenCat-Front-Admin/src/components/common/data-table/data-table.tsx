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
  isRefreshing?: boolean;
}

export function DataTable<TData>({ table, columns, isRefreshing = false }: DataTableProps<TData>) {
  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Loading Overlay */}
      {isRefreshing && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-8 h-8 border-3 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-sm text-gray-600 font-medium">Actualizando datos...</p>
          </div>
        </div>
      )}

      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-white border-b-2 border-gray-200 shadow-md z-40 sticky top-0">
        <Table className="w-full min-w-full table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b-0">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={`${(header.column.columnDef.meta as any)?.className ?? ''} break-words whitespace-normal px-3 py-4 text-left text-sm font-semibold text-gray-900 bg-white border-b-0`}
                      style={{ width: `${header.getSize()}px` }}
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
        </Table>
      </div>

      {/* Scrollable Body */}
      <div className={`flex-1 overflow-auto transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
        <Table className="w-full min-w-full table-fixed">
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
                      style={{ width: `${cell.column.getSize()}px` }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-32 text-center text-gray-500"
              >
                {table.getState().globalFilter
                  ? 'No hay resultados que coincidan con tu búsqueda.'
                  : 'No hay resultados.'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        </Table>
      </div>
    </div>
  );
}
