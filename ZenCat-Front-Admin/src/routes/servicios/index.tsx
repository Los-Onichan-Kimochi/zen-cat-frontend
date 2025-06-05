'use client';

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import HeaderDescriptor from '@/components/common/header-descriptor';
import HomeCard from '@/components/common/home-card';
import { ViewToolbar } from '@/components/common/view-toolbar';
import { Users, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesApi } from '@/api/services/services';
import { Service, ServiceType } from '@/types/service';
import { Button } from "@/components/ui/button";
import { ServicesTable } from '@/components/services/table';
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
import { toast } from 'sonner';


export const Route = createFileRoute('/servicios/')({
  component: ServiciosComponent,
});

interface CalculatedCounts {
  [ServiceType.PRESENCIAL_SERVICE]: number;
  [ServiceType.VIRTUAL_SERVICE]: number;
}

function ServiciosComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  const { 
    data: servicesData,
    isLoading: isLoadingServices,
    error: errorServices
  } = useQuery<Service[], Error>({
    queryKey: ['services'],
    queryFn: servicesApi.getServices,
  });

  const { mutate: deleteService, isPending: isDeleting } = useMutation<void, Error, string>({
    mutationFn: (id) => servicesApi.deleteService(id),
    onSuccess: (_, id) => {
      toast.success('Servicio eliminado', { description: `ID ${id}` });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (err) => {
      toast.error('Error al eliminar', { description: err.message });
    },
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

  const isLoading = isLoadingServices;

  if (errorServices) return <p>Error cargando servicios: {errorServices.message}</p>;

  return (
    <div className="p-6 h-full flex flex-col font-montserrat">
      <HeaderDescriptor title="SERVICIOS" subtitle="LISTADO DE SERVICIOS" />
      <div className="flex items-center justify-center space-x-20 mt-2 font-montserrat min-h-[120px]">
        {isLoadingCounts ? (
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        ) : counts ? (
          <>
            <HomeCard
              icon={<Users className="w-8 h-8 text-teal-600"/>}
              iconBgColor="bg-teal-100"
              title="Servicios virtuales"
              description={counts[ServiceType.VIRTUAL_SERVICE]}
            />
            <HomeCard
              icon={<Users className="w-8 h-8 text-pink-600"/>}
              iconBgColor="bg-pink-100"
              title="servicios presenciales"
              description={counts[ServiceType.PRESENCIAL_SERVICE]}
            />
          </>
        ) : (
          <p>No hay datos de servicios para mostrar conteos.</p>
        )}
      </div>
      <ViewToolbar
        onAddClick={() => navigate({ to: '/servicios/servicio-nuevo' })}
        onBulkUploadClick={() => console.log('Carga Masiva clickeada')}
        addButtonText="Agregar"
        bulkUploadButtonText="Carga Masiva"
      />

      {isLoadingServices ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-16 w-16 animate-spin text-gray-500" />
        </div>
      ) : (
        <ServicesTable
          data={servicesData || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      )}

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro que deseas eliminar este servicio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
              <div className="mt-2 font-medium">Servicio: {serviceToDelete?.name}</div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="space-x-2">
            <AlertDialogCancel onClick={() => setIsDeleteModalOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                className="bg-red-400 text-white flex items-center gap-2 hover:bg-red-500 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-red-200 rounded-lg shadow-sm hover:shadow-md focus:shadow-md transition-all duration-200 ease-in-out"
                onClick={() => {
                  if (serviceToDelete) deleteService(serviceToDelete.id);
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