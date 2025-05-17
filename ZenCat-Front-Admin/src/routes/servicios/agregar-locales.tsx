'use client';

import { createFileRoute, Link } from '@tanstack/react-router';
import HeaderDescriptor from '@/components/common/header-descriptor';
import HomeCard from '@/components/common/home-card';
import { Users, Loader2, MoreHorizontal, ArrowUpDown, Plus, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { servicesApi } from '@/api/services/services';
import { Service, ServiceType } from '@/types/service';
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


export const Route = createFileRoute('/servicios/agregar-locales')({
  component: ServiciosComponent,
});

interface CalculatedCounts {
  [ServiceType.PRESENCIAL_SERVICE]: number;
  [ServiceType.VIRTUAL_SERVICE]: number;
}

function ServiciosComponent() {
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
    data: servicesData,
    isLoading: isLoadingServices,
    error: errorServices
  } = useQuery<Service[], Error>({
    queryKey: ['services'],
    queryFn: servicesApi.getServices,
  });

  const counts = useMemo<CalculatedCounts | null>(() => {
    if (!servicesData) return null;

    const calculatedCounts: CalculatedCounts = {
      [ServiceType.PRESENCIAL_SERVICE]: 0,
      [ServiceType.VIRTUAL_SERVICE]: 0,
    };

    servicesData.forEach(serv => {
      if (serv.is_virtual === true) {
        calculatedCounts[ServiceType.VIRTUAL_SERVICE]++;
      } else if (serv.is_virtual === false) {
        calculatedCounts[ServiceType.PRESENCIAL_SERVICE]++;
      }
    });
    return calculatedCounts;
  }, [servicesData]);

  const isLoadingCounts = isLoadingServices;

  const columns = useMemo<ColumnDef<Service>[]>(() => [
    {
      id: "select",
      header: ({ table }: { table: Table<Service> }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }: { row: Row<Service> }) => (
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
      accessorKey: "name",
      header: ({ column }: { column: Column<Service, unknown> }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nombre
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }: { row: Row<Service> }) => <div>{row.getValue("name")}</div>
    },
    {
      id: "is_virtual",
      header: "¿Es virtual?",
      accessorFn: (row: Service) => row.is_virtual ? "Sí" : "No",
    },
    {
      
      id: "description",
      header: "Descripción",
      accessorFn: (row: Service) => row.description,
    },
    {
      id: "actions",
      cell: ({ row }: { row: Row<Service> }) => {
        const professional = row.original;
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
                onClick={() => navigator.clipboard.writeText(professional.id)}
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
    data: servicesData || [],
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

  const isLoading = isLoadingServices;

  if (errorServices) return <p>Error cargando servicios: {errorServices.message}</p>;

  return (
    <div className="p-6 h-full flex flex-col">
      <HeaderDescriptor title="SERVICIOS" subtitle="LISTADO DE SERVICIOS" />
      <div className="flex justify-end space-x-2 py-4">
        <Link to="/servicios/servicio-nuevo" className="h-10">
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

      {isLoadingServices ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-16 w-16 animate-spin text-gray-500" />
        </div>
      ) : (
        <div className="-mx-4 flex-1 overflow-auto px-4 py-2">
          <DataTableToolbar
            table={table}
            filterPlaceholder="Buscar servicios..."
            showSortButton={true}
            showExportButton={true}
            onExportClick={() => console.log("Exportar clickeado")}
            showFilterButton={true}
            onFilterClick={() => console.log("Filtrar por clickeado")}
            enableDeleteButton={false}
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