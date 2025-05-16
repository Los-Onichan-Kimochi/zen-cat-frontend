'use client';

import { createFileRoute, Link } from '@tanstack/react-router';
import HeaderDescriptor from '@/components/common/header-descriptor';
import HomeCard from '@/components/common/home-card';
import { Users, Loader2, MoreHorizontal, ArrowUpDown, Plus, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { professionalsApi } from '@/api/professionals/professionals';
import { Professional, ProfessionalSpecialty } from '@/types/professional';
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

export const Route = createFileRoute('/profesionales/')({
  component: ProfesionalesComponent,
});

interface CalculatedCounts {
  [ProfessionalSpecialty.YOGA_TEACHER]: number;
  [ProfessionalSpecialty.GYM_TEACHER]: number;
  [ProfessionalSpecialty.DOCTOR]: number;
}

function ProfesionalesComponent() {
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
    data: professionalsData,
    isLoading: isLoadingProfessionals,
    error: errorProfessionals
  } = useQuery<Professional[], Error>({
    queryKey: ['professionals'],
    queryFn: professionalsApi.getProfessionals,
  });

  const counts = useMemo<CalculatedCounts | null>(() => {
    if (!professionalsData) return null;

    const calculatedCounts: CalculatedCounts = {
      [ProfessionalSpecialty.YOGA_TEACHER]: 0,
      [ProfessionalSpecialty.GYM_TEACHER]: 0,
      [ProfessionalSpecialty.DOCTOR]: 0,
    };

    professionalsData.forEach(prof => {
      if (prof.specialty === ProfessionalSpecialty.YOGA_TEACHER) {
        calculatedCounts[ProfessionalSpecialty.YOGA_TEACHER]++;
      } else if (prof.specialty === ProfessionalSpecialty.GYM_TEACHER) {
        calculatedCounts[ProfessionalSpecialty.GYM_TEACHER]++;
      } else if (prof.specialty === ProfessionalSpecialty.DOCTOR) {
        calculatedCounts[ProfessionalSpecialty.DOCTOR]++;
      }
    });
    return calculatedCounts;
  }, [professionalsData]);

  const isLoadingCounts = isLoadingProfessionals;

  const columns = useMemo<ColumnDef<Professional>[]>(() => [
    {
      id: "select",
      header: ({ table }: { table: Table<Professional> }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }: { row: Row<Professional> }) => (
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
      header: ({ column }: { column: Column<Professional, unknown> }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nombres
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }: { row: Row<Professional> }) => <div>{row.getValue("name")}</div>
    },
    {
      id: "lastNames",
      header: "Apellidos",
      accessorFn: (row: Professional) => `${row.first_last_name} ${row.second_last_name || ''}`,
    },
    {
      accessorKey: "specialty",
      header: "Especialidad",
    },
    {
      accessorKey: "email",
      header: ({ column }: { column: Column<Professional, unknown> }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Correo electrónico
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "phone_number",
      header: "Número de celular",
    },
    {
      id: "actions",
      cell: ({ row }: { row: Row<Professional> }) => {
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
    data: professionalsData || [],
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

  const isLoading = isLoadingProfessionals;

  if (errorProfessionals) return <p>Error cargando profesionales: {errorProfessionals.message}</p>;

  return (
    <div className="p-6 h-full flex flex-col">
      <HeaderDescriptor title="PROFESIONALES" subtitle="LISTADO DE PROFESIONALES" />
      <div className="flex items-center justify-center space-x-20 mt-2 font-montserrat min-h-[120px]">
        {isLoadingCounts ? (
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        ) : counts ? (
          <>
            <HomeCard
              icon={<Users className="w-8 h-8 text-teal-600" />}
              iconBgColor="bg-teal-100"
              title="Profesores de yoga"
              description={counts[ProfessionalSpecialty.YOGA_TEACHER]}
            />
            <HomeCard
              icon={<Users className="w-8 h-8 text-pink-600" />}
              iconBgColor="bg-pink-100"
              title="Profesores de gimnasio"
              description={counts[ProfessionalSpecialty.GYM_TEACHER]}
            />
            <HomeCard
              icon={<Users className="w-8 h-8 text-blue-600" />}
              iconBgColor="bg-blue-100"
              title="Médicos"
              description={counts[ProfessionalSpecialty.DOCTOR]}
            />
          </>
        ) : (
          <p>No hay datos de profesionales para mostrar conteos.</p>
        )}
      </div>
      <div className="flex justify-end space-x-2 py-4">
        <Link to="/profesionales/nuevo" className="h-10">
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

      {isLoadingProfessionals ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-16 w-16 animate-spin text-gray-500" />
        </div>
      ) : (
        <div className="-mx-4 flex-1 overflow-auto px-4 py-2">
          <DataTableToolbar
            table={table}
            filterPlaceholder="Buscar profesionales..."
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