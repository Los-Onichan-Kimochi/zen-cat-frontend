'use client';

import { createFileRoute } from '@tanstack/react-router';
import HeaderDescriptor from '@/components/common/header-descriptor';
import HomeCard from '@/components/common/home-card';
import { Users, Loader2, MoreHorizontal, ArrowUpDown, Plus, Upload } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { professionalsApi, ProfessionalCounts } from '@/api/professionals/professionals';
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

export const Route = createFileRoute('/profesionales')({
  component: ProfesionalesComponent,
});

function ProfesionalesComponent() {
  const [counts, setCounts] = useState<ProfessionalCounts | null>(null);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [loadingProfessionals, setLoadingProfessionals] = useState(true);
  
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoadingCounts(true);
        const fetchedCounts = await professionalsApi.getProfessionalCounts();
        setCounts(fetchedCounts);
      } catch (error) {
        console.error("Error fetching professional counts:", error);
      } finally {
        setLoadingCounts(false);
      }
    };
    fetchCounts();
  }, []);

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        setLoadingProfessionals(true);
        const fetchedProfessionals = await professionalsApi.getProfessionals();
        setProfessionals(fetchedProfessionals);
      } catch (error) {
        console.error("Error fetching professionals:", error);
      } finally {
        setLoadingProfessionals(false);
      }
    };
    fetchProfessionals();
  }, []);

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
      accessorFn: (row: Professional) => `${row.firstLastName} ${row.secondLastName}`,
    },
    {
      accessorKey: "speciality",
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
      accessorKey: "phone",
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
    data: professionals,
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

  const isLoading = loadingCounts || loadingProfessionals;

  return (
    <div className="p-6 h-full flex flex-col">
      <HeaderDescriptor title="PROFESIONALES" subtitle="LISTADO DE PROFESIONALES" />
      <div className="flex items-center justify-center space-x-20 mt-2 font-montserrat min-h-[120px]">
        {loadingCounts ? (
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        ) : counts ? (
          <>
            <HomeCard
              icon={<Users className="w-8 h-8 text-teal-600"/>}
              iconBgColor="bg-teal-100"
              title="Profesores de yoga"
              description={counts[ProfessionalSpecialty.YOGA_TEACHER]}
            />
            <HomeCard
              icon={<Users className="w-8 h-8 text-pink-600"/>}
              iconBgColor="bg-pink-100"
              title="Profesores de gimnasio"
              description={counts[ProfessionalSpecialty.GYM_TEACHER]}
            />
            <HomeCard
              icon={<Users className="w-8 h-8 text-blue-600"/>}
              iconBgColor="bg-blue-100"
              title="Médicos"
              description={counts[ProfessionalSpecialty.DOCTOR]}
            />
          </>
        ) : (
          <p>No se pudieron cargar los datos.</p>
        )}
      </div>
      <div className="flex justify-end space-x-2 py-4">
        <Button size="sm" className="h-10 bg-gray-800 hover:bg-gray-700" onClick={() => console.log("Add clicked")}>
          <Plus className="mr-2 h-4 w-4" /> Agregar
        </Button>
        <Button size="sm" className="h-10 bg-gray-800 hover:bg-gray-700" onClick={() => console.log("Bulk upload clicked")}>
          <Upload className="mr-2 h-4 w-4" /> Carga Masiva
        </Button>
      </div>
      <div className="mt-0 flex-grow flex flex-col">
        {isLoading ? (
          <div className="flex-grow flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
          </div>
        ) : (
          <div className="flex-grow flex flex-col">
            <DataTableToolbar
              table={table}
              filterPlaceholder="Buscar registro o celda..."
              showExportButton={true}
              onExportClick={() => console.log("No hay chance de exportar XD")}
              showFilterButton={true}
              onFilterClick={() => console.log("No hay chance de filtrar XD")}
              showSortButton={true}
            />
            <div className="flex-grow">
              <DataTable 
                table={table} 
                columns={columns}
              />
            </div>
            <DataTablePagination table={table} />
          </div>
        )}
      </div>
    </div>
  );
} 