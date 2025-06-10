'use client';

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import HeaderDescriptor from '@/components/common/header-descriptor';
import { ViewToolbar } from '@/components/common/view-toolbar';

import { toast } from 'sonner';
import { LocalProvider, useLocal } from '@/context/LocalesContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import HomeCard from '@/components/common/home-card';
import { Loader2, MapPin } from 'lucide-react';
import { useState } from 'react';
import { localsApi } from '@/api/locals/locals';
import { Local } from '@/types/local';
import { Button } from '@/components/ui/button';
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
import { LocalsTable } from '@/components/locals/table';
import { BulkCreateDialog } from '@/components/common/bulk-create-dialog';
import { SuccessDialog } from '@/components/common/success-bulk-create-dialog';

export const Route = createFileRoute('/locales/')({
  component: LocalesPage,
});

function LocalesPage() {
  return (
    <LocalProvider>
      <LocalesComponent />
    </LocalProvider>
  );
}

function LocalesComponent() {
  const navigate = useNavigate();
  const { setCurrent } = useLocal();
  const queryClient = useQueryClient();

  const [showSuccess, setShowSuccess] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [localToDelete, setLocalToDelete] = useState<Local | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [resetSelectionTrigger, setResetSelectionTrigger] = useState(0);

  const {
    data: localsData,
    isLoading: isLoadingLocals,
    error: errorLocals,
    refetch: refetchLocals,
  } = useQuery<Local[], Error>({
    queryKey: ['locals'],
    queryFn: localsApi.getLocals,
  });

  const deleteLocalMutation = useMutation({
    mutationFn: (id: string) => localsApi.deleteLocal(id),
    onSuccess: async (_, id) => {
      toast.success('Local eliminado', { description: `ID ${id}` });
      await refetchLocals();
      queryClient.invalidateQueries({ queryKey: ['locals'] });
    },
    onError: (err) => {
      toast.error('Error al eliminar local', { description: err.message });
    },
  });

  // Hook para bulk delete que maneja automáticamente la actualización
  const { handleBulkDelete, isBulkDeleting } = useBulkDelete<Local>({
    queryKey: ['locals'],
    deleteFn: (ids: string[]) => localsApi.bulkDeleteLocals({ locals: ids }),
    entityName: 'local',
    entityNamePlural: 'locales',
    getId: (local) => local.id,
    onSuccess: () => {
      // Resetear selecciones después del éxito
      setResetSelectionTrigger(prev => prev + 1);
    },
  });

  const { mutate: bulkCreateLocals, isPending: isBulkCreating } = useMutation({
    mutationFn: localsApi.bulkCreateLocals,
    onSuccess: async () => {
      toast.success('Locales creados exitosamente');
      await refetchLocals();
      queryClient.invalidateQueries({ queryKey: ['locals'] });
      setShowUploadDialog(false);
      setShowSuccess(true);
    },
    onError: (error: Error) => {
      toast.error('Error durante la carga masiva', { description: error.message });
    },
  });

  const regionCounts = localsData?.reduce(
    (acc, local) => {
      const region = local.region;
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  let maxRegion = '';
  let maxCount = 0;

  if (regionCounts) {
    for (const [region, count] of Object.entries(regionCounts)) {
      if (count > maxCount) {
        maxRegion = region;
        maxCount = count;
      }
    }
  }

  const handleEdit = (local: Local) => {
    localStorage.setItem('currentLocal', local.id);
    navigate({ to: `/locales/ver` });
  };

  const handleDelete = (local: Local) => {
    setLocalToDelete(local);
    setIsDeleteModalOpen(true);
  };

  const handleView = (local: Local) => {
    localStorage.setItem('currentLocal', local.id);
    navigate({ to: `/locales/ver` });
  };

  if (errorLocals) return <p>Error cargando locales: {errorLocals.message}</p>;

  return (
    <div className="p-6 h-full flex flex-col font-montserrat">
      <HeaderDescriptor title="LOCALES" subtitle="LISTADO DE LOCALES" />
      <div className="mb-6 flex items-center gap-4">
        <HomeCard
          icon={<MapPin className="w-8 h-8 text-teal-600" />}
          iconBgColor="bg-teal-100"
          title="Locales totales"
          description={localsData?.length || 0}
        />
        <HomeCard
          icon={<MapPin className="w-8 h-8 text-blue-600" />}
          iconBgColor="bg-blue-100"
          title="Region con mayor cantidad de locales: "
          description={
            maxRegion ? `${maxRegion} (${maxCount})` : 'No disponible'
          }
        />
      </div>
      <ViewToolbar
        onAddClick={() => navigate({ to: '/locales/agregar' })}
        onBulkUploadClick={() => setShowUploadDialog(true)}
        addButtonText="Agregar"
        bulkUploadButtonText="Carga Masiva"
      />

      {isLoadingLocals ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-16 w-16 animate-spin text-gray-500" />
        </div>
      ) : (
        <LocalsTable
          data={localsData || []}
          onBulkDelete={handleBulkDelete}
          isBulkDeleting={isBulkDeleting}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          resetRowSelectionTrigger={resetSelectionTrigger}
        />
      )}

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Estás seguro que deseas eliminar este local?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
              <div className="mt-2 font-medium">
                Local: {localToDelete?.local_name}
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
                  if (localToDelete) deleteLocalMutation.mutate(localToDelete.id);
                  setIsDeleteModalOpen(false);
                }}
              >
                Eliminar
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BulkCreateDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        title="Carga Masiva de Locales"
        expectedExcelColumns={[
          'Nombre del Local',
          'Nombre de la Calle',
          'Número de Edificio',
          'Distrito',
          'Provincia',
          'Región',
          'Referencia',
          'Capacidad',
          'URL de Imagen'
        ]}
        dbFieldNames={[
          'local_name',
          'street_name',
          'building_number',
          'district',
          'province',
          'region',
          'reference',
          'capacity',
          'image_url'
        ]}
        onParsedData={async (data) => {
          try {
            bulkCreateLocals(data);
          } catch (error) {
            console.error(error);
          }
        }}
      />

      <SuccessDialog
        open={showSuccess}
        onOpenChange={setShowSuccess}
        title="La carga se realizó exitosamente"
        description="Todos los locales se registraron correctamente."
        buttonText="Cerrar"
      />
    </div>
  );
}

export default LocalesComponent;
