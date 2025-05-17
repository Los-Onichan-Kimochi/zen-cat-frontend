'use client';

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import HeaderDescriptor from '@/components/common/header-descriptor';
import { toast } from 'sonner';
import { LocalProvider } from '@/context/LocalesContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import HomeCard from '@/components/common/home-card';
import { Users, Loader2, MoreHorizontal, ArrowUpDown, Plus, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import { localsApi } from '@/api/locals/locals';
import { Local } from '@/types/local';
import { DataTable } from '@/components/common/data-table/data-table';
import { DataTableToolbar } from '@/components/common/data-table/data-table-toolbar';
import { DataTablePagination } from '@/components/common/data-table/data-table-pagination';
import { 
  ColumnDef, 
  Row, 
  Column, 
  Table, 
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  PaginationState,
} from '@tanstack/react-table';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
export const Route = createFileRoute('/locales/')({
  component: () => (
    <LocalProvider>
      <LocalesComponent />
    </LocalProvider>
  ),
});
function LocalesComponent(){
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { 
    data: localsData,
    isLoading: isLoadingLocals,
    error: errorLocals
  } = useQuery<Local[], Error>({
    queryKey: ['locals'],
    queryFn: localsApi.getLocals,
  });

  const columns = useMemo<ColumnDef<Local>[]>(() => [
      {
        id: "select",
        header: ({ table }: { table: Table<Local> }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }: { row: Row<Local> }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value: boolean | 'indeterminate') => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "local_name",
        header: ({ column }: { column: Column<Local, unknown> }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Nombre del local
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }: { row: Row<Local> }) => <div>{row.getValue("name")}</div>
      },
      //{
      //  id: "lastNames",
      //  header: "Apellidos",
      //  accessorFn: (row: Local) => `${row.first_last_name} ${row.second_last_name || ''}`,
      //},
      {
        accessorKey: "street_name",
        header: "Dirección",
      },
      {
        accessorKey: "building_number",
        header: "Número",
      },
      {
        accessorKey: "reference",
        header: "Referencia",
      },
      {
        accessorKey: "district",
        header: ({ column }: { column: Column<Local, unknown> }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Distrito
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
      },
      {
        accessorKey: "province",
        header: ({ column }: { column: Column<Local, unknown> }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Provincia
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
      },
      {
        accessorKey: "region",
        header: ({ column }: { column: Column<Local, unknown> }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Región
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }: { row: Row<Local> }) => {
          const local = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(local.id)}
                >
                  Copiar ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                <DropdownMenuItem>Editar</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">Eliminar</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ], []);

  const table = useReactTable({
    data: localsData || [],
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
      onGlobalFilterChange: setGlobalFilter,
      onPaginationChange: setPagination,
      onColumnVisibilityChange: setColumnVisibility,
      onRowSelectionChange: setRowSelection,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      manualPagination: false,
      enableRowSelection: true,
      debugTable: true,
   });

   const isLoading = isLoadingLocals;

   if (errorLocals) return <p>Error cargando locales: {errorLocals.message}</p>;

  return (
    <div className="p-6 h-full flex flex-col">
      <HeaderDescriptor title="LOCALES" subtitle="LISTADO DE LOCALES" />
       <div className="flex justify-end space-x-2 py-4">
        <Link to="/locales/nuevo" className="h-10">
          <Button 
            size="sm" 
            className="h-10 bg-gray-800 font-black hover:bg-gray-700 cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4 " /> Agregar
          </Button>
        </Link>
        <Button size="sm" className="h-10 bg-gray-800 font-black hover:bg-gray-700 cursor-pointer" onClick={() => console.log("Carga Masiva clickeada")}>
          <Upload className="mr-2 h-4 w-4" /> Carga Masiva
        </Button>
      </div>

      {isLoadingLocals ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-16 w-16 animate-spin text-gray-500" />
        </div>
      ) : (
        <div className="-mx-4 flex-1 overflow-auto px-4 py-2">
          <DataTableToolbar
            table={table}
            filterPlaceholder="Buscar locales..."
            showSortButton={true}
            showExportButton={true}
            onExportClick={() => console.log("Exportar clickeado")}
            showFilterButton={true}
            onFilterClick={() => console.log("Filtrar por clickeado")}
          />
          <div className="flex-1 overflow-hidden rounded-md border">
            <DataTable table={table} columns={columns} />
          </div>
          <DataTablePagination table={table} />
        </div>
      )}
    </div>
  );
}