'use client';

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import HeaderDescriptor from '@/components/common/header-descriptor';
import HomeCard from '@/components/common/home-card';
import { ViewToolbar } from '@/components/common/view-toolbar';

import {
  Users,
  Loader2,
  MoreHorizontal,
  ArrowUpDown,
  Plus,
  Upload,
  Trash,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ServicesTable } from '@/components/services/table';
import { useBulkDelete } from '@/hooks/use-bulk-delete';
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
import { useToast } from '@/context/ToastContext';

export const Route = createFileRoute('/servicios/')({
  component: ServiciosComponent,
});

interface CalculatedCounts {
  [ServiceType.PRESENCIAL_SERVICE]: number;
  [ServiceType.VIRTUAL_SERVICE]: number;
}

function ServiciosComponent() {
  const navigate = useNavigate();
  const toast = useToast();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const queryClient = useQueryClient();

  const {
    data: servicesData,
    isLoading: isLoadingServices,
    error: errorServices,
    refetch: refetchServices,
    isFetching: isFetchingServices,
  } = useQuery<Service[], Error>({
    queryKey: ['services'],
    queryFn: servicesApi.getServices,
  });

  const { mutate: deleteService, isPending: isDeleting } = useMutation<
    void,
    Error,
    string
  >({
    mutationFn: (id) => servicesApi.deleteService(id),
    onSuccess: (_, id) => {
      toast.success('Servicio Eliminado', { 
        description: 'El servicio ha sido eliminado exitosamente.' 
      });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setRowSelection({});
    },
    onError: (err) => {
      toast.error('Error al Eliminar', { 
        description: err.message || 'No se pudo eliminar el servicio.' 
      });
    },
  });

  const { handleBulkDelete, isBulkDeleting } = useBulkDelete<Service>({
    queryKey: ['services'],
    deleteFn: (ids: string[]) => servicesApi.bulkDeleteServices(ids),
    entityName: 'servicio',
    entityNamePlural: 'servicios',
    getId: (service) => service.id,
  });

  const counts = useMemo<CalculatedCounts | null>(() => {
    if (!servicesData) return null;

    const calculatedCounts: CalculatedCounts = {
      [ServiceType.PRESENCIAL_SERVICE]: 0,
      [ServiceType.VIRTUAL_SERVICE]: 0,
    };

    servicesData.forEach((serv) => {
      if (serv.is_virtual === true) {
        calculatedCounts[ServiceType.VIRTUAL_SERVICE]++;
      } else if (serv.is_virtual === false) {
        calculatedCounts[ServiceType.PRESENCIAL_SERVICE]++;
      }
    });
    return calculatedCounts;
  }, [servicesData]);

  const isLoadingCounts = isLoadingServices;

  const handleEdit = (service: Service) => {
    navigate({ to: '/servicios/servicio-editar', search: { id: service.id } });
  };

  const handleView = (service: Service) => {
    localStorage.setItem('currentService', service.id);
    navigate({ to: `/servicios/servicio-ver` });
  };

  const handleDelete = (service: Service) => {
    setServiceToDelete(service);
    setIsDeleteModalOpen(true);
  };

  const handleRefresh = async () => {
    const startTime = Date.now();
    
    const [servicesResult, countsResult] = await Promise.all([
      refetchServices(),
      refetchCounts()
    ]);
    
    // Asegurar que pase al menos 1 segundo
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, 1000 - elapsedTime);
    
    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    }
    
    return { servicesResult, countsResult };
  };

  const columns = useMemo<ColumnDef<Service>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }: { table: Table<Service> }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value: boolean | 'indeterminate') =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }: { row: Row<Service> }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value: boolean | 'indeterminate') =>
              row.toggleSelected(!!value)
            }
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'name',
        header: ({ column }: { column: Column<Service, unknown> }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            >
              Nombre
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }: { row: Row<Service> }) => (
          <div>{row.getValue('name')}</div>
        ),
      },
      {
        id: 'is_virtual',
        header: '¿Es virtual?',
        accessorFn: (row: Service) => (row.is_virtual ? 'Sí' : 'No'),
      },
      {
        id: 'description',
        header: 'Descripción',
        accessorFn: (row: Service) => row.description,
      },
      {
        id: 'actions',
        cell: ({ row }: { row: Row<Service> }) => {
          const serv = row.original;
          return (
            <div className="flex items-center space-x-2">
              <Button
                className="h-8 w-8 p-0 bg-white text-black border border-black rounded-full flex items-center justify-center hover:bg-red-100 hover:shadow-md transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  localStorage.setItem('currentService', serv.id);
                  navigate({ to: `/servicios/servicio-ver` });
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              <Button
                className="h-8 w-8 p-0 bg-white text-black border border-black rounded-full flex items-center justify-center hover:bg-red-100 hover:shadow-md transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  setServiceToDelete(serv);
                  setIsDeleteModalOpen(true);
                }}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [],
  );

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

  if (errorServices)
    return <p>Error cargando servicios: {errorServices.message}</p>;

  return (
    <div className="p-6 h-screen flex flex-col font-montserrat overflow-hidden">
      <HeaderDescriptor title="SERVICIOS" subtitle="LISTADO DE SERVICIOS" />
      
      {/* Statistics Section */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center space-x-20 mt-2 font-montserrat min-h-[120px]">
          {isLoadingCounts ? (
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          ) : counts ? (
            <>
              <HomeCard
                icon={<Users className="w-8 h-8 text-teal-600" />}
                iconBgColor="bg-teal-100"
                title="Servicios virtuales"
                description={counts[ServiceType.VIRTUAL_SERVICE]}
                descColor="text-teal-600"
                isLoading={isFetchingServices}
              />
              <HomeCard
                icon={<Users className="w-8 h-8 text-pink-600" />}
                iconBgColor="bg-pink-100"
                title="servicios presenciales"
                description={counts[ServiceType.PRESENCIAL_SERVICE]}
                descColor="text-pink-600"
                isLoading={isFetchingServices}
              />
            </>
          ) : (
            <p>No hay datos de servicios para mostrar conteos.</p>
          )}
        </div>
        
        <ViewToolbar
          onAddClick={() => navigate({ to: '/servicios/servicio-nuevo' })}
          onBulkUploadClick={() => {}}
          addButtonText="Agregar"
          bulkUploadButtonText="Carga Masiva"
        />
      </div>

      {/* Table Section */}
      <div className="flex-1 flex flex-col min-h-0">
        {isLoadingServices ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-gray-500" />
          </div>
        ) : (
                  <ServicesTable
          data={servicesData || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onBulkDelete={handleBulkDelete}
          isBulkDeleting={isBulkDeleting}
          onRefresh={handleRefresh}
          isRefreshing={isFetchingServices}
        />
        )}
      </div>
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Estás seguro que deseas eliminar este servicio?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
              <div className="mt-2 font-medium">
                Servicio: {serviceToDelete?.name}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="space-x-2">
            <AlertDialogCancel onClick={() => setIsDeleteModalOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={() => {
                  if (serviceToDelete) {
                    if (serviceToDelete) deleteService(serviceToDelete.id);
                  }
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
