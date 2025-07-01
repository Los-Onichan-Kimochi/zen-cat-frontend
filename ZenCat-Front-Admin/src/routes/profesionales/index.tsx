'use client';

import { createFileRoute, useNavigate } from '@tanstack/react-router';
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
import { ProfessionalsTable } from '@/components/professionals/professional-table';
import { useBulkDelete } from '@/hooks/use-bulk-delete';
import { BulkCreateDialog } from '@/components/common/bulk-create-dialog';

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
  const [showUploadDialog, setShowUploadDialog] = useState(false); //carga masiva

  const [showSuccess, setShowSuccess] = useState(false); //carga masiva

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

  const { mutate: deleteProfessional } = useMutation<void, Error, string>({
    mutationFn: (id) => professionalsApi.deleteProfessional(id),
    onSuccess: () => {
      toast.success('Profesional Eliminado', {
        description: 'El profesional ha sido eliminado exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
    },
    onError: (err) => {
      toast.error('Error al Eliminar', {
        description: err.message || 'No se pudo eliminar el profesional.',
      });
    },
  });

  const { handleBulkDelete, isBulkDeleting } = useBulkDelete<Professional>({
    queryKey: ['professionals'],
    deleteFn: (ids: string[]) =>
      professionalsApi.bulkDeleteProfessionals({ professionals: ids }),
    entityName: 'profesional',
    entityNamePlural: 'profesionales',
    getId: (professional) => professional.id,
  });

  const { mutate: bulkCreateProfessionals } = useMutation({
    mutationFn: professionalsApi.bulkCreateProfessionals,
    onSuccess: async () => {
      toast.success('Profesionales Creados', {
        description: 'Los profesionales han sido creados exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      setShowUploadDialog(false);
    },
    onError: (error: Error) => {
      toast.error('Error en Carga Masiva', {
        description: error.message || 'No se pudieron crear los profesionales.',
      });
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

  const handleEdit = (professional: Professional) => {
    setCurrent(professional);
    navigate({ to: '/profesionales/agregar' }); // Cambiar a nuevo ya que editar no existe
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

    const professionalsResult = await refetchProfessionals();

    // Asegurar que pase al menos 1 segundo
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, 1000 - elapsedTime);

    if (remainingTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
    }

    return professionalsResult;
  };

  // handleBulkDelete already provided by the useBulkDelete hook

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
          onAddClick={() => navigate({ to: '/profesionales/agregar' })}
          onBulkUploadClick={() => setShowUploadDialog(true)}
          addButtonText="Agregar"
          bulkUploadButtonText="Carga Masiva"
        />
      </div>

      <ViewToolbar
        onAddClick={() => navigate({ to: '/profesionales/nuevo' })}
        onBulkUploadClick={() => setShowUploadDialog(true)} //activar carga
        addButtonText="Agregar"
        bulkUploadButtonText="Carga Masiva"
      />

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
        />
      )}

      <BulkCreateDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        title="Carga Masiva de Profesionales"
        expectedExcelColumns={[
          'Nombres',
          'Primer apellido',
          'Segundo apellido',
          'Especialidad',
          'Correo electrónico',
          'Número de celular',
          'Tipo',
          'Foto de perfil',
        ]}
        dbFieldNames={[
          'name',
          'first_last_name',
          'second_last_name',
          'specialty',
          'email',
          'phone_number',
          'type',
          'image_url',
        ]}
        onParsedData={async (data) => {
          try {
            const validTypes = ['MEDIC', 'GYM_TRAINER', 'YOGA_TRAINER'];
            const validSpecialties = [
              'Profesor de Yoga',
              'Profesor de Gimnasio',
              'Médico',
            ];

            const transformedData = data.map((item) => ({
              name: item.name?.toString().trim(),
              first_last_name: item.first_last_name?.toString().trim(),
              second_last_name:
                item.second_last_name?.toString().trim() || null,
              specialty: item.specialty?.toString().trim(),
              email: item.email?.toString().trim(),
              phone_number: item.phone_number?.toString().trim(),
              type: item.type?.toString().trim().toUpperCase(),
              image_url: item.image_url?.toString().trim(),
            }));

            const isValid = transformedData.every(
              (item) =>
                item.name &&
                item.first_last_name &&
                item.specialty &&
                validSpecialties.includes(item.specialty) &&
                item.email &&
                item.phone_number &&
                validTypes.includes(item.type) &&
                item.image_url,
            );

            if (!isValid) {
              toast.error(
                'Error: Algunos registros tienen campos inválidos, tipo o especialidad no válidos.',
              );
              console.error('Registros inválidos:', transformedData);
              return;
            }

            console.log(
              'Body final:',
              JSON.stringify({ professionals: transformedData }, null, 2),
            );
            await professionalsApi.bulkCreateProfessionals({
              professionals: transformedData,
            });
            queryClient.invalidateQueries({ queryKey: ['professionals'] });
            setShowUploadDialog(false);
            setShowSuccess(true);
          } catch (error: any) {
            toast.error('Error durante la carga masiva', {
              description:
                error instanceof Error ? error.message : 'Error desconocido',
            });
            console.error('Detalle del error:', error);
          }
        }}
      />

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

      {/* Bulk Create Dialog */}
      <BulkCreateDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        title="Carga Masiva de Profesionales"
        expectedExcelColumns={[
          'Nombre',
          'Primer Apellido',
          'Segundo Apellido',
          'Especialidad',
          'Email',
          'Teléfono',
          'Tipo',
          'URL de Imagen',
        ]}
        dbFieldNames={[
          'name',
          'first_last_name',
          'second_last_name',
          'specialty',
          'email',
          'phone_number',
          'type',
          'image_url',
        ]}
        onParsedData={async (data) => {
          try {
            bulkCreateProfessionals({ professionals: data });
          } catch (error) {
            console.error(error);
          }
        }}
      />
    </div>
  );
}

export default ProfesionalesComponent;
