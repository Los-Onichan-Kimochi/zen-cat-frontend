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
import { useQuery } from '@tanstack/react-query';
import { servicesApi } from '@/api/services/services';
import { serviceLocalApi } from '@/api/services/service_locals';
import { serviceProfessionalApi } from '@/api/services/service_professionals';
import { Service, ServiceType } from '@/types/service';
import { Local } from '@/types/local';
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
import { localsApi } from '@/api/locals/locals';

export const Route = createFileRoute('/servicios/agregar-locales')({
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

  const {
    data: localsData,
    isLoading: isLoadingLocals,
    error: errorLocals,
  } = useQuery<Local[], Error>({
    queryKey: ['locals'],
    queryFn: localsApi.getLocals,
  });

  const navigate = useNavigate();

  const isLoadingCounts = isLoadingLocals;
  const modo = localStorage.getItem('modoAgregarLocal');
  const localesAsociados: string[] = JSON.parse(localStorage.getItem('localesAsociados') ?? '[]');
  
  useEffect(() => {
    const stored = localStorage.getItem('localesSeleccionados');
    
    if (stored && localsData) {
      const restored = JSON.parse(stored) as Local[];

      const newRowSelection: Record<string, boolean> = {};
      restored.forEach((loc) => {
        newRowSelection[loc.id.toString()] = true;
      });
      
      

      setRowSelection(newRowSelection);
    }
  }, [localsData]);

  const columns = useMemo<ColumnDef<Local>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => {
        const localId = row.original.id;
        
        const yaAsociado = localesAsociados.includes(localId.toString());
        return (
        <Checkbox
          checked={row.getIsSelected()|| yaAsociado}
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
      accessorKey: 'local_name',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Nombre de Local <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue('local_name')}</div>,
    },
    {
      id: 'Dirección',
      header: 'Dirección',
      accessorFn: (row) => `${row.street_name ?? ''} ${row.building_number ?? ''}`,
      cell: ({ row }) => (
        <div>
          {row.original.street_name} {row.original.building_number}
        </div>
      ),
    },
    { accessorKey: 'district', header: 'Distrito' },
    {
      accessorKey: 'province',
      header: ({ column }) => (
        <Button 
            variant="ghost" 
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Provincia <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    { 
      accessorKey: 'capacity', 
      header: 'Capacidad' ,
      cell: ({ row }) => `${row.original.capacity} personas`,
    },
  ], []);

  const table = useReactTable({
    data: localsData || [],
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

  const isLoading = isLoadingLocals;

  const selectedLocals = table
    .getSelectedRowModel()
    .rows.map((row) => row.original);

  if (errorLocals)
    return <p>Error cargando servicios: {errorLocals.message}</p>;

  return (
    <div className="p-6 h-full flex flex-col">
      <HeaderDescriptor
        title="LOCALES"
        subtitle="LISTADO DE LOCALES"
      />

      {isLoadingLocals ? (
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
            enableDeleteButton={false}
          />
          <div className="flex-1 overflow-hidden rounded-md border">
            <DataTable table={table} columns={columns} />
          </div>
          <DataTablePagination table={table} />
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 sm:justify-end pt-4">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() =>{
                localStorage.removeItem('modoAgregarLocal');
                localStorage.removeItem('localesAsociados');
                if (modo === 'editar') {
                  navigate({ to: '/servicios/servicio-ver' });
                } else {
                  navigate({ to: '/servicios/servicio-nuevo' });
                }
              }} className="w-full sm:w-auto"
              >
                Cancelar
                </Button>
            <Button
              type="button"
              disabled={
                isLoadingLocals || selectedLocals.length === 0}
              onClick={async() => {
                localStorage.removeItem('modoAgregarLocal');
                localStorage.removeItem('localesAsociados');
                if(modo === 'editar') {
                  // 1. Obtener IDs ya asociados y los seleccionados

                  const nuevos = selectedLocals.filter(
                    loc => !localesAsociados.includes(loc.id)
                  );

                  // 2. Llamar a la API solo con los nuevos
                  if (nuevos.length > 0) {
                    const serviceId = localStorage.getItem('currentService'); // o como tengas el id del servicio
                    if (!serviceId) {
                      // Puedes mostrar un toast de error o retornar
                      alert('No se encontró el ID del servicio');
                      return;
                    }
                    await serviceLocalApi.bulkCreateServiceLocals({
                        service_locals: nuevos.map(loc => ({
                        service_id: serviceId,
                        local_id: loc.id,
                      })),
                    });
                  }
                  navigate({ to: '/servicios/servicio-ver' });
                }
                 else {
                  // 1. Guardar los seleccionados en el localStorage
                  localStorage.setItem('localesSeleccionados', JSON.stringify(selectedLocals));
                  navigate({ to: '/servicios/servicio-nuevo' });
                }
              }}
              className="w-full sm:w-auto"
            >
              {isLoadingLocals && (
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
