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
import { ConfirmDeleteSingleDialog } from '@/components/common/confirm-delete-dialogs';
import { SuccessDialog } from '@/components/common/success-bulk-create-dialog';
import { LocalsTable } from '@/components/locals/table';

export const Route = createFileRoute('/locales/')({
  component: () => (
    <LocalProvider>
      <LocalesComponent />
    </LocalProvider>
  ),
});

function LocalesComponent() {
  const navigate = useNavigate();
  const { setCurrent } = useLocal();
  const queryClient = useQueryClient();

  const [showSuccess, setShowSuccess] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [localToDelete, setLocalToDelete] = useState<Local | null>(null);
  const [resetSelectionTrigger, setResetSelectionTrigger] = useState(0);

  const {
    data: localsData,
    isLoading: isLoadingLocals,
    error: errorLocals,
  } = useQuery<Local[], Error>({
    queryKey: ['locals'],
    queryFn: localsApi.getLocals,
  });

  const deleteLocalMutation = useMutation({
    mutationFn: (id: string) => localsApi.deleteLocal(id),
    onSuccess: (_, id) => {
      toast.success('Local eliminado', { description: `ID ${id}` });
      queryClient.invalidateQueries({ queryKey: ['locals'] });
    },
    onError: (err) => {
      toast.error('Error al eliminar local', { description: err.message });
    },
  });

  const regionCounts = localsData?.reduce(
    (acc, local) => {
      const region = local.region; // Asegúrate de que `region` es el nombre correcto
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

  const bulkDeleteLocalMutation = useMutation({
    mutationFn: (ids: string[]) => 
      localsApi.bulkDeleteLocals({ locals: ids }),
    onSuccess: (_, ids) => {
      toast.success('Locales eliminadas', {
        description: `${ids.length} registros`,
      });
      queryClient.invalidateQueries({ queryKey: ['locals'] });
    },
    onError: (err) => {
      toast.error('Error al eliminar múltiples locales', {
        description: err.message,
      });
    },
  });

  const handleBulkDelete = (ids: string[]) => {
    bulkDeleteLocalMutation.mutate(ids, {
      onSuccess: () => {
        setResetSelectionTrigger((prev) => prev + 1);
      },
    });
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
        onBulkUploadClick={() => console.log('Carga Masiva clickeada')}
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
          isBulkDeleting={bulkDeleteLocalMutation.isPending}
          onEdit={handleEdit}
          onDelete={handleDelete}
          resetRowSelectionTrigger={resetSelectionTrigger}
        />
      )}

      <ConfirmDeleteSingleDialog
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="¿Estás seguro que deseas eliminar esta comunidad?"
        entity="Comunidad"
        itemName={localToDelete?.local_name ?? ''}
        onConfirm={() => {
          if (localToDelete)
            deleteLocalMutation.mutate(localToDelete.id);
        }}
      />

      <SuccessDialog
        open={showSuccess}
        onOpenChange={setShowSuccess}
        title="La carga se realizó exitosamente"
        description="Todas las comunidades se registraron correctamente."
        buttonText="Cerrar"
      />
    </div>
  );
}

export default LocalesComponent;
