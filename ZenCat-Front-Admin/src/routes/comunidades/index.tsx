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
import { toast } from 'sonner';

export const Route = createFileRoute('/comunidades/')({
  component: ComunidadesComponent,
});

function ComunidadesComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [communityToDelete, setCommunityToDelete] = useState<Community | null>(
    null,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [resetSelectionTrigger, setResetSelectionTrigger] = useState(0);
// modificacion 2 en index desde el useQuery
  const {
    data: communitiesData = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['communities'],
    queryFn: communitiesApi.getCommunities,
  });

  const deleteCommunityMutation = useMutation({
    mutationFn: (id: string) => communitiesApi.deleteCommunity(id),
    onSuccess: (_, id) => {
      toast.success('Comunidad eliminada', { description: `ID ${id}` });
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
    onError: (err) => {
      toast.error('Error al eliminar comunidad', { description: err.message });
    },
  });
  
  const bulkDeleteCommunityMutation = useMutation({
    mutationFn: (ids: string[]) => 
      communitiesApi.bulkDeleteCommunities({ communities: ids }),
    onSuccess: (_, ids) => {
      toast.success('Comunidades eliminadas', {
        description: `${ids.length} registros`,
      });
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
    onError: (err) => {
      toast.error('Error al eliminar múltiples comunidades', {
        description: err.message,
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

  if (error) return <p>Error cargando comunidades: {error.message}</p>;

  return (
    <div className="p-6 h-full font-montserrat">
      <HeaderDescriptor title="COMUNIDADES" subtitle="LISTADO DE COMUNIDADES" />

      <div className="mb-6 flex items-center">
        <HomeCard
          icon={<Locate className="w-8 h-8 text-teal-600" />}
          iconBgColor="bg-teal-100"
          title="Comunidades totales"
          description={communitiesData.length}
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
        />
      )}

      <BulkCreateDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        title="Carga Masiva de Comunidades"
        expectedExcelColumns={['Nombre', 'Propósito', 'Logo']}
        dbFieldNames={['name', 'purpose', 'image_url']}
        //solo para q no se repitan, EN caso de comunidad
        
        existingNames={communitiesData.map((c) => c.name)} //
        validateUniqueNames={true}

        onParsedData={async (data) => {
          try {
            await communitiesApi.bulkCreateCommunities({communities: data});
            queryClient.invalidateQueries({ queryKey: ['communities'] });
            setShowUploadDialog(false);
            setShowSuccess(true);
            //MODELO 1
            //queryClient.invalidateQueries({ queryKey: ['communities'] });
            // MODELO 2
            
            //queryClient.setQueryData(['communities'], (old: Community[] = []) => [
             // ...old,
              //...data,
            //]);
          } catch (error) {
            console.error(error);
            toast.error('Error durante la carga masiva');
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
