'use client';

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useToast } from '@/context/ToastContext';
import { ProfessionalProvider } from '@/context/ProfesionalesContext';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import HeaderDescriptor from '@/components/common/header-descriptor';
import HomeCard from '@/components/common/home-card';
import { ViewToolbar } from '@/components/common/view-toolbar';
import { Users, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
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
import { professionalsApi } from '@/api/professionals/professionals';
import { Professional, ProfessionalSpecialty } from '@/types/professional';
import { useProfessional } from '@/context/ProfesionalesContext';
import { ProfessionalsTable } from '@/components/professionals/table';
import { useBulkDelete } from '@/hooks/use-bulk-delete';

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
  const toast = useToast();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [profToDelete, setProfToDelete] = useState<Professional | null>(null);

  const {
    data: professionalsData,
    isLoading: isLoadingProfessionals,
    error: errorProfessionals,
    refetch: refetchProfessionals,
    isFetching: isFetchingProfessionals,
  } = useQuery<Professional[], Error>({
    queryKey: ['professionals'],
    queryFn: professionalsApi.getProfessionals,
  });

  const { mutate: deleteProfessional, isPending: isDeleting } = useMutation<
    void,
    Error,
    string
  >({
    mutationFn: (id) => professionalsApi.deleteProfessional(id),
    onSuccess: (_, id) => {
      toast.success('Profesional Eliminado', { 
        description: 'El profesional ha sido eliminado exitosamente.' 
      });
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
    },
    onError: (err) => {
      toast.error('Error al Eliminar', { 
        description: err.message || 'No se pudo eliminar el profesional.' 
      });
    },
  });

  const { handleBulkDelete, isBulkDeleting } = useBulkDelete<Professional>({
    queryKey: ['professionals'],
    deleteFn: professionalsApi.bulkDeleteProfessionals,
    entityName: 'profesional',
    entityNamePlural: 'profesionales',
    getId: (professional) => professional.id,
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

  const handleEdit = (professional: Professional) => {
    setCurrent(professional);
    navigate({ to: '/profesionales/editar' });
  };

  const handleView = (professional: Professional) => {
    localStorage.setItem('currentProfessional', professional.id);
    navigate({ to: `/profesionales/ver` });
  };

  const handleDelete = (professional: Professional) => {
    setProfToDelete(professional);
    setIsDeleteModalOpen(true);
  };

  const handleRefresh = async () => {
    const startTime = Date.now();
    
    const [professionalsResult, countsResult] = await Promise.all([
      refetchProfessionals(),
      refetchCounts()
    ]);
    
    // Asegurar que pase al menos 1 segundo
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, 1000 - elapsedTime);
    
    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    }
    
    return { professionalsResult, countsResult };
  };

  // handleBulkDelete already provided by the useBulkDelete hook

  const btnSizeClasses = 'h-11 w-28 px-4';

  if (errorProfessionals)
    return <p>Error cargando profesionales: {errorProfessionals.message}</p>;

  return (
    <div className="p-6 h-screen flex flex-col font-montserrat overflow-hidden">
      <HeaderDescriptor
        title="PROFESIONALES"
        subtitle="LISTADO DE PROFESIONALES"
      />

      {/* Statistics Section */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center space-x-20 mt-2 font-montserrat min-h-[120px]">
          {counts ? (
            <>
              <HomeCard
                icon={<Users className="w-8 h-8 text-teal-600" />}
                iconBgColor="bg-teal-100"
                title="Yoga"
                description={counts[ProfessionalSpecialty.YOGA_TEACHER]}
                descColor="text-teal-600"
                isLoading={isFetchingProfessionals}
              />
              <HomeCard
                icon={<Users className="w-8 h-8 text-pink-600" />}
                iconBgColor="bg-pink-100"
                title="Gimnasio"
                description={counts[ProfessionalSpecialty.GYM_TEACHER]}
                descColor="text-pink-600"
                isLoading={isFetchingProfessionals}
              />
              <HomeCard
                icon={<Users className="w-8 h-8 text-blue-600" />}
                iconBgColor="bg-blue-100"
                title="Médicos"
                description={counts[ProfessionalSpecialty.DOCTOR]}
                descColor="text-blue-600"
                isLoading={isFetchingProfessionals}
              />
            </>
          ) : (
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          )}
        </div>

        <ViewToolbar
          onAddClick={() => navigate({ to: '/profesionales/nuevo' })}
          onBulkUploadClick={() => {}}
          addButtonText="Agregar"
          bulkUploadButtonText="Carga Masiva"
        />
      </div>

      {/* Table Section */}
      <div className="flex-1 flex flex-col min-h-0">
        {isLoadingProfessionals ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-gray-500" />
          </div>
        ) : (
          <ProfessionalsTable
            data={professionalsData || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onBulkDelete={handleBulkDelete}
            isBulkDeleting={isBulkDeleting}
            onRefresh={handleRefresh}
            isRefreshing={isFetchingProfessionals}
          />
        )}
      </div>

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Estás seguro que deseas eliminar este profesional?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
              <div className="mt-2 font-medium">
                Profesional: {profToDelete?.name}
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
