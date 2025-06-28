'use client';

import HeaderDescriptor from '@/components/common/header-descriptor';
import HomeCard from '@/components/common/home-card';
import { ViewToolbar } from '@/components/common/view-toolbar';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communitiesApi } from '@/api/communities/communities';
import { Community } from '@/types/community';
import { ConfirmDeleteSingleDialog } from '@/components/common/confirm-delete-dialogs';
import { BulkCreateDialog } from '@/components/common/bulk-create-dialog';
import { SuccessDialog } from '@/components/common/success-bulk-create-dialog';
import { CommunityTable } from '@/components/community/community-table';

import { Locate, Loader2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export const Route = createFileRoute('/comunidades/')({
  component: ComunidadesComponent,
});

function ComunidadesComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [communityToDelete, setCommunityToDelete] = useState<Community | null>(
    null,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [resetSelectionTrigger, setResetSelectionTrigger] = useState(0);

  const {
    data: communitiesData = [],
    isLoading,
    error,
    refetch: refetchCommunities,
    isFetching: isFetchingCommunities,
  } = useQuery({
    queryKey: ['communities'],
    queryFn: communitiesApi.getCommunities,
  });

  const deleteCommunityMutation = useMutation({
    mutationFn: (id: string) => communitiesApi.deleteCommunity(id),
    onSuccess: (_, id) => {
      toast.success('Comunidad Eliminada', {
        description: 'La comunidad ha sido eliminada exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
    onError: (err) => {
      toast.error('Error al Eliminar', {
        description: err.message || 'No se pudo eliminar la comunidad.',
      });
    },
  });

  const bulkDeleteCommunityMutation = useMutation({
    mutationFn: (ids: string[]) =>
      communitiesApi.bulkDeleteCommunities({ communities: ids }),
    onSuccess: (_, ids) => {
      toast.success('Comunidades Eliminadas', {
        description: `${ids.length} comunidades eliminadas exitosamente.`,
      });
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
    onError: (err) => {
      toast.error('Error al Eliminar Comunidades', {
        description: err.message || 'No se pudieron eliminar las comunidades.',
      });
    },
  });

  const handleBulkDelete = (ids: string[]) => {
    bulkDeleteCommunityMutation.mutate(ids, {
      onSuccess: () => {
        setResetSelectionTrigger((prev) => prev + 1);
      },
    });
  };

  const handleEdit = (community: Community) => {
    navigate({ to: '/comunidades/ver', search: { id: community.id } });
  };

  const handleRefresh = async () => {
    const startTime = Date.now();

    const result = await refetchCommunities();

    // Asegurar que pase al menos 1 segundo
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, 1000 - elapsedTime);

    if (remainingTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
    }

    return result;
  };

  if (error) return <p>Error cargando comunidades: {error.message}</p>;

  return (
    <div className="p-6 h-screen flex flex-col font-montserrat overflow-hidden">
      <HeaderDescriptor title="COMUNIDADES" subtitle="LISTADO DE COMUNIDADES" />

      <div className="flex-shrink-0">
        <div className="mb-6 flex items-center">
          <HomeCard
            icon={<Locate className="w-8 h-8 text-teal-600" />}
            iconBgColor="bg-teal-100"
            title="Comunidades totales"
            description={communitiesData.length}
            descColor="text-teal-600"
            isLoading={isFetchingCommunities}
          />
        </div>

        <ViewToolbar
          onAddClick={() => {
            sessionStorage.removeItem('draftCommunity');
            sessionStorage.removeItem('draftSelectedServices');
            sessionStorage.removeItem('draftSelectedMembershipPlans');
            navigate({ to: '/comunidades/agregar-comunidad' });
          }}
          onBulkUploadClick={() => setShowUploadDialog(true)}
          addButtonText="Agregar"
          bulkUploadButtonText="Carga Masiva"
        />
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin h-10 w-10 text-gray-500" />
          </div>
        ) : (
          <CommunityTable
            data={communitiesData}
            onBulkDelete={handleBulkDelete}
            isBulkDeleting={bulkDeleteCommunityMutation.isPending}
            onEdit={handleEdit}
            onDelete={(com) => {
              setCommunityToDelete(com);
              setIsDeleteModalOpen(true);
            }}
            resetRowSelectionTrigger={resetSelectionTrigger}
            onRefresh={handleRefresh}
            isRefreshing={isFetchingCommunities}
          />
        )}
      </div>

      <BulkCreateDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        title="Carga Masiva de Comunidades"
        expectedExcelColumns={['Nombre', 'Propósito', 'Logo']}
        dbFieldNames={['name', 'purpose', 'image_url']}
        onParsedData={async (data) => {
          try {
            await communitiesApi.bulkCreateCommunities({ communities: data });
            toast.success('Comunidades Creadas', {
              description: `${data.length} comunidades creadas exitosamente.`,
            });
            setShowUploadDialog(false);
            setShowSuccess(true);
            queryClient.invalidateQueries({ queryKey: ['communities'] });
          } catch (error) {
            console.error(error);
            toast.error('Error en Carga Masiva', {
              description: 'No se pudieron crear las comunidades.',
            });
          }
        }}
      />

      <ConfirmDeleteSingleDialog
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="¿Estás seguro que deseas eliminar esta comunidad?"
        entity="Comunidad"
        itemName={communityToDelete?.name ?? ''}
        onConfirm={() => {
          if (communityToDelete)
            deleteCommunityMutation.mutate(communityToDelete.id);
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
