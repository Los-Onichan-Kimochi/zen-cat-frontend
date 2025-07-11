'use client';

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import HeaderDescriptor from '@/components/common/header-descriptor';
import { Loader2, ChevronLeft } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { servicesApi } from '@/api/services/services';
import { Service } from '@/types/service';
import { communityServicesApi } from '@/api/communities/community-services';
import { DataTable } from '@/components/common/data-table/data-table';
import { DataTableToolbar } from '@/components/common/data-table/data-table-toolbar';
import { DataTablePagination } from '@/components/common/data-table/data-table-pagination';
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

export const Route = createFileRoute('/comunidades/agregar-servicios')({
  component: AddCommunityServicePageComponent,
});

function AddCommunityServicePageComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const mode = sessionStorage.getItem('modeAddService');
  const servicesAsociated: string[] = JSON.parse(
    sessionStorage.getItem('draftSelectedServices') ?? '[]',
  ).map((service: Service) => service.id);
  const currentCommunityId = sessionStorage.getItem('currentCommunity'); // guardado previamente

  const redirectPath =
    mode === 'editar' ? '/comunidades/ver' : '/comunidades/agregar-comunidad';

  const {
    data: servicesData,
    isLoading: isLoadingServices,
    error: errorServices,
  } = useQuery<Service[], Error>({
    queryKey: ['services'],
    queryFn: servicesApi.getServices,
  });

  // Handler para el botón Cancelar
  const handleCancel = () => {
    if (mode === 'editar' && currentCommunityId) {
      navigate({ to: redirectPath, search: { id: currentCommunityId } });
    } else {
      navigate({ to: redirectPath });
    }
  };

  const handleGuardar = async () => {
    const selectedServices = table
      .getSelectedRowModel()
      .rows.map((row) => row.original);

    if (mode === 'editar') {
      const newServices = selectedServices.filter(
        (service) => !servicesAsociated.includes(service.id),
      );

      if (newServices.length > 0) {
        if (!currentCommunityId) {
          alert('Falta el ID de la comunidad');
          return;
        }

        const payload = newServices.map((s) => ({
          community_id: currentCommunityId,
          service_id: s.id,
        }));

        try {
          await communityServicesApi.bulkCreateCommunityServices({
            community_services: payload,
          });
          await queryClient.invalidateQueries({
            queryKey: ['community-services', currentCommunityId],
          });
        } catch (error) {
          console.error('Error al guardar nuevos servicios:', error);
          return;
        }
      }

      sessionStorage.removeItem('modeAddService');
      sessionStorage.removeItem('draftSelectedServices');

      navigate({ to: redirectPath, search: { id: currentCommunityId } });
    } else {
      sessionStorage.setItem(
        'draftSelectedServices',
        JSON.stringify(selectedServices),
      );
      navigate({ to: redirectPath });
    }
  };

  useEffect(() => {
    const stored = sessionStorage.getItem('draftSelectedServices');
    if (stored && servicesData) {
      const restored = JSON.parse(stored) as Service[];
      const newRowSelection: Record<string, boolean> = {};
      restored.forEach((serv) => {
        newRowSelection[serv.id.toString()] = true;
      });
      setRowSelection(newRowSelection);
    }
  }, [servicesData]);

  //Define the columns of the table
  const columns = useMemo<ColumnDef<Service>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => {
          const serviceId = row.original.id;

          const asociated = servicesAsociated.includes(serviceId.toString());
          return (
            <Checkbox
              checked={row.getIsSelected() || asociated}
              disabled={asociated && mode === 'editar'}
              onCheckedChange={(v) => {
                if (!asociated) row.toggleSelected(!!v);
              }}
              aria-label="Select row"
            />
          );
        },
        enableSorting: false,
        enableHiding: false,
        meta: { className: 'w-[36px] px-3' },
      },
      {
        accessorKey: 'name',
        header: 'Nombre',
      },
      {
        accessorKey: 'is_virtual',
        header: '¿Es virtual?',
        cell: ({ row }) => (row.original.is_virtual ? 'Sí' : 'No'),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: servicesData || [],
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

  if (errorServices)
    return <p>Error cargando servicios: {errorServices.message}</p>;

  return (
    <div className="p-6 h-full font-montserrat">
      <HeaderDescriptor title="COMUNIDADES" subtitle="AGREGAR SERVICIOS" />

      <div className="mb-4">
        <Button variant="outline" size="default" onClick={handleCancel}>
          <ChevronLeft className="w-5 h-5" />
          Volver
        </Button>
      </div>
      <div className="mt-0 flex-grow flex flex-col">
        {isLoadingServices ? (
          <div className="flex-grow flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
          </div>
        ) : (
          <div className="flex-grow flex flex-col">
            <DataTableToolbar
              table={table}
              isBulkDeleting={false}
              showBulkDeleteButton={false}
              filterPlaceholder="Buscar registro o celda..."
              showExportButton={false}
              exportFileName="comunidades"
              showFilterButton={true}
              onFilterClick={() => {}}
              showSortButton={true}
            />
            <div className="flex-grow">
              <DataTable table={table} columns={columns} />
            </div>
            <DataTablePagination table={table} />
          </div>
        )}
      </div>
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 sm:justify-end pt-4">
        <Button
          variant="outline"
          type="button"
          className="h-10 w-30 text-base"
          onClick={handleCancel}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleGuardar}
          className="h-10 w-30 bg-black text-white text-base hover:bg-gray-800"
        >
          Guardar
        </Button>
      </div>
    </div>
  );
}
