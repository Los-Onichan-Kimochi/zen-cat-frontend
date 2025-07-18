'use client';

import { createFileRoute, Link } from '@tanstack/react-router';
import HeaderDescriptor from '@/components/common/header-descriptor';
import {
  Users,
  Loader2,
  MoreHorizontal,
  ArrowUpDown,
  Plus,
  Upload,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesApi } from '@/api/services/services';
import { professionalsApi } from '@/api/professionals/professionals';
import { serviceProfessionalApi } from '@/api/services/service_professionals';
import { Service, ServiceType } from '@/types/service';
import { Professional } from '@/types/professional';
import { DataTable } from '@/components/common/data-table/data-table';
import { DataTableToolbar } from '@/components/common/data-table/data-table-toolbar';
import { useNavigate } from '@tanstack/react-router';
import { DataTablePagination } from '@/components/common/data-table/data-table-pagination';
import { useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/servicios/agregar-profesionales')({
  component: ProfesionalesComponent,
});

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

  const queryClient = useQueryClient();
  const {
    data: professionalsData,
    isLoading: isLoadingProfessionals,
    error: errorProfessionals,
  } = useQuery<Professional[], Error>({
    queryKey: ['professionals'],
    queryFn: professionalsApi.getProfessionals,
  });

  const navigate = useNavigate();
  const serviceId = localStorage.getItem('currentService');

  const bulkCreateMutation = useMutation({
    mutationFn: serviceProfessionalApi.bulkCreateServiceProfessionals,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['service-professionals', serviceId],
      });
      navigate({ to: '/servicios/servicio-ver' });
    },
    onError: (error: any) => {
      console.error('Error al asociar profesionales:', error);
      alert(
        `Error al asociar profesionales: ${error.message || 'Error desconocido'}`,
      );
      navigate({ to: '/servicios/servicio-ver' });
    },
  });

  const isLoadingCounts = isLoadingProfessionals;
  const modo = localStorage.getItem('modoAgregarProfesional');
  const profesionalesAsociados: string[] = JSON.parse(
    localStorage.getItem('profesionalesAsociados') ?? '[]',
  );

  useEffect(() => {
    const stored = localStorage.getItem('profesionalesSeleccionados');

    if (stored && professionalsData) {
      const restored = JSON.parse(stored) as Professional[];

      const newRowSelection: Record<string, boolean> = {};
      restored.forEach((prof) => {
        newRowSelection[prof.id.toString()] = true;
      });

      setRowSelection(newRowSelection);
    }
  }, [professionalsData]);

  const columns = useMemo<ColumnDef<Professional>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => {
          const profesionalId = row.original.id;

          const yaAsociado = profesionalesAsociados.includes(
            profesionalId.toString(),
          );
          return (
            <Checkbox
              checked={row.getIsSelected() || yaAsociado}
              disabled={yaAsociado && modo === 'editar'}
              onCheckedChange={(v) => {
                if (!yaAsociado) row.toggleSelected(!!v);
              }}
              aria-label="Select row"
            />
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Nombres <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div>{row.getValue('name')}</div>,
      },
      {
        id: 'lastNames',
        header: 'Apellidos',
        accessorFn: (row) =>
          `${row.first_last_name} ${row.second_last_name || ''}`,
      },
      { accessorKey: 'specialty', header: 'Especialidad' },
      {
        accessorKey: 'email',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Correo electrónico <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      { accessorKey: 'phone_number', header: 'Número de celular' },
    ],
    [],
  );

  const table = useReactTable({
    data: professionalsData || [],
    columns,
    getRowId: (row) => row.id.toString(),
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

  const selectedProfessionals = table
    .getSelectedRowModel()
    .rows.map((row) => row.original);

  if (errorProfessionals)
    return <p>Error cargando servicios: {errorProfessionals.message}</p>;

  return (
    <div className="p-6 h-full flex flex-col">
      <HeaderDescriptor
        title="PROFESIONALES"
        subtitle="LISTADO DE PROFESIONALES"
      />

      {isLoadingProfessionals ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-16 w-16 animate-spin text-gray-500" />
        </div>
      ) : (
        <div className="-mx-4 flex-1 overflow-auto px-4 py-2">
          <DataTableToolbar
            table={table}
            filterPlaceholder="Buscar servicios..."
            showSortButton={true}
            showFilterButton={true}
            onFilterClick={() => {}}
            isBulkDeleting={false}
            onBulkDelete={() => {}}
            showBulkDeleteButton={false}
          />
          <div className="flex-1 overflow-hidden rounded-md border">
            <DataTable table={table} columns={columns} />
          </div>
          <DataTablePagination table={table} />
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 sm:justify-end pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                localStorage.removeItem('modoAgregarProfesional');
                localStorage.removeItem('profesionalesAsociados');
                if (modo === 'editar') {
                  navigate({ to: '/servicios/servicio-ver' });
                } else {
                  navigate({ to: '/servicios/servicio-nuevo' });
                }
              }}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={
                isLoadingProfessionals ||
                selectedProfessionals.length === 0 ||
                bulkCreateMutation.isPending
              }
              onClick={() => {
                localStorage.removeItem('modoAgregarProfesional');
                localStorage.removeItem('profesionalesAsociados');
                if (modo === 'editar') {
                  const nuevos = selectedProfessionals.filter(
                    (prof) => !profesionalesAsociados.includes(prof.id),
                  );

                  if (nuevos.length > 0) {
                    if (!serviceId) {
                      alert('No se encontró el ID del servicio');
                      return;
                    }
                    const payload = {
                      service_professionals: nuevos.map((prof) => ({
                        service_id: serviceId,
                        professional_id: prof.id,
                      })),
                    };
                    bulkCreateMutation.mutate(payload);
                  } else {
                    navigate({ to: '/servicios/servicio-ver' });
                  }
                } else {
                  localStorage.setItem(
                    'profesionalesSeleccionados',
                    JSON.stringify(selectedProfessionals),
                  );
                  navigate({ to: '/servicios/servicio-nuevo' });
                }
              }}
              className="w-full sm:w-auto"
            >
              {(isLoadingProfessionals || bulkCreateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}{' '}
              Guardar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
