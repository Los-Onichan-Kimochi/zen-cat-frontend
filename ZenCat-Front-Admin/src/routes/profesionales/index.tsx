'use client';

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { ProfessionalProvider } from '@/context/ProfesionalesContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import HeaderDescriptor from '@/components/common/header-descriptor';
import HomeCard from '@/components/common/home-card';
import { Users, Loader2, ArrowUpDown, MoreHorizontal, Plus, Upload, Trash } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  ColumnDef,
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
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/common/data-table/data-table';
import { DataTableToolbar } from '@/components/common/data-table/data-table-toolbar';
import { DataTablePagination } from '@/components/common/data-table/data-table-pagination';
import { professionalsApi } from '@/api/professionals/professionals';
import { Professional, ProfessionalSpecialty } from '@/types/professional';
import { useProfessional } from '@/context/ProfesionalesContext';
export const Route = createFileRoute('/profesionales/')({
  component: () => (
    <ProfessionalProvider>
      <ProfesionalesComponent />
    </ProfessionalProvider>
  ),
});

interface CalculatedCounts {
  [ProfessionalSpecialty.YOGA_TEACHER]: number;
  [ProfessionalSpecialty.GYM_TEACHER]: number;
  [ProfessionalSpecialty.DOCTOR]: number;
}

function ProfesionalesComponent() {
  const navigate = useNavigate();
  const { setCurrent } = useProfessional();
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [profToDelete, setProfToDelete] = useState<Professional | null>(null);

  const { data: professionalsData, isLoading: isLoadingProfessionals, error: errorProfessionals } =
    useQuery<Professional[], Error>({
      queryKey: ['professionals'],
      queryFn: professionalsApi.getProfessionals,
    });

  const { mutate: deleteProfessional, isPending: isDeleting } = useMutation<void, Error, string>({
    mutationFn: (id) => professionalsApi.deleteProfessional(id),
    onSuccess: (_, id) => {
      toast.success('Profesional eliminado', { description: `ID ${id}` });
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      setRowSelection({});
    },
    onError: (err) => {
      toast.error('Error al eliminar', { description: err.message });
    },
  });

  const counts = useMemo<CalculatedCounts | null>(() => {
    if (!professionalsData) return null;
    const c: CalculatedCounts = {
      [ProfessionalSpecialty.YOGA_TEACHER]: 0,
      [ProfessionalSpecialty.GYM_TEACHER]: 0,
      [ProfessionalSpecialty.DOCTOR]: 0,
    };
    professionalsData.forEach((p) => {
      switch (p.specialty) {
        case ProfessionalSpecialty.YOGA_TEACHER:
          c[ProfessionalSpecialty.YOGA_TEACHER]++;
          break;
        case ProfessionalSpecialty.GYM_TEACHER:
          c[ProfessionalSpecialty.GYM_TEACHER]++;
          break;
        case ProfessionalSpecialty.DOCTOR:
          c[ProfessionalSpecialty.DOCTOR]++;
          break;
      }
    });
    return c;
  }, [professionalsData]);

  const columns = useMemo<ColumnDef<Professional>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Nombres <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue('name')}</div>,
    },
    {
      id: 'lastNames',
      header: 'Apellidos',
      accessorFn: (row) => `${row.first_last_name} ${row.second_last_name || ''}`,
    },
    { accessorKey: 'specialty', header: 'Especialidad' },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Correo electrónico <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    { accessorKey: 'phone_number', header: 'Número de celular' },
    {
      id: 'actions',
      cell: ({ row }) => {
        const prof = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Button
              className="h-8 w-8 p-0 bg-white text-black border border-black rounded-full flex items-center justify-center hover:bg-red-100 hover:shadow-md transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                localStorage.setItem('currentProfessional', prof.id);
                navigate({ to: `/profesionales/ver` });
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <Button
              className="h-8 w-8 p-0 bg-white text-black border border-black rounded-full flex items-center justify-center hover:bg-red-100 hover:shadow-md transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                setProfToDelete(prof);
                setIsDeleteModalOpen(true);
              }}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ], [deleteProfessional, navigate, setCurrent]);

  const table = useReactTable({
    data: professionalsData || [],
    columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection, globalFilter, pagination },
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
  });

  const btnSizeClasses = "h-11 w-28 px-4";

  if (errorProfessionals) return <p>Error cargando profesionales: {errorProfessionals.message}</p>;

  return (
    <div className="p-6 h-full flex flex-col">
      <HeaderDescriptor title="PROFESIONALES" subtitle="LISTADO DE PROFESIONALES" />

      <div className="flex items-center justify-center space-x-20 mt-2 font-montserrat min-h-[120px]">
        {counts ? (
          <>
            <HomeCard icon={<Users className="w-8 h-8 text-teal-600" />} iconBgColor="bg-teal-100" title="Yoga" description={counts[ProfessionalSpecialty.YOGA_TEACHER]} />
            <HomeCard icon={<Users className="w-8 h-8 text-pink-600" />} iconBgColor="bg-pink-100" title="Gimnasio" description={counts[ProfessionalSpecialty.GYM_TEACHER]} />
            <HomeCard icon={<Users className="w-8 h-8 text-blue-600" />} iconBgColor="bg-blue-100" title="Médicos" description={counts[ProfessionalSpecialty.DOCTOR]} />
          </>
        ) : (
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        )}
      </div>

      <div className="flex justify-end space-x-2 py-4">
        <Link to="/profesionales/nuevo">
          <Button
            size="sm"
            className={`bg-black text-white font-bold rounded-lg flex items-center justify-between shadow hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out ${btnSizeClasses}`}
          >
            <span>Agregar</span>
            <Plus className="w-5 h-5" />
          </Button>
        </Link>

        <Button
          size="sm"
          className={`
            bg-black text-white font-bold rounded-lg
            grid grid-rows-2 grid-cols-[1fr_auto] items-center
            shadow hover:bg-gray-800 hover:scale-105 active:scale-95
            transition-all duration-200 ease-in-out
            ${btnSizeClasses}
          `}
        >
          <span className="row-start-1 col-start-1">Carga</span>
          <span className="row-start-2 col-start-1">Masiva</span>
          <Plus className="row-span-2 col-start-2 justify-self-center w-5 h-5" />
        </Button>
      </div>

      {isLoadingProfessionals ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-gray-500" />
        </div>
      ) : (
        <div className="-mx-4 flex-1 overflow-auto px-4 py-2">
          <DataTableToolbar
            table={table}
            filterPlaceholder="Buscar profesionales..."
            showSortButton
            showFilterButton
            showExportButton
            onFilterClick={() => console.log('Filtrar')}
            onExportClick={() => console.log('Exportar')}
          />
          <div className="flex-1 overflow-hidden rounded-md border">
            <DataTable table={table} columns={columns} />
          </div>
          <DataTablePagination table={table} />
        </div>
      )}

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro que deseas eliminar este profesional?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
              <div className="mt-2 font-medium">Profesional: {profToDelete?.name}</div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="space-x-2">
            <AlertDialogCancel onClick={() => setIsDeleteModalOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={() => {
                  if (profToDelete) deleteProfessional(profToDelete.id);
                  setIsDeleteModalOpen(false);
                }}
              >
                Eliminar
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ProfesionalesComponent;
