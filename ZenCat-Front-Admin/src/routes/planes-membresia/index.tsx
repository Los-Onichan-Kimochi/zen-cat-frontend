'use client';

import HeaderDescriptor from '@/components/common/header-descriptor';
import HomeCard from '@/components/common/home-card';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membershipPlansApi } from '@/api/membership-plans/membership-plans';
import { MembershipPlan } from '@/types/membership-plan';
import { ConfirmDeleteSingleDialog } from '@/components/common/confirm-delete-dialogs';
import { BulkCreateDialog } from '@/components/common/bulk-create-dialog';
import { SuccessDialog } from '@/components/common/success-bulk-create-dialog';
import { MembershipPlanTable } from '@/components/membership-plan/membership-plan-table';

import { Locate, Plus, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/context/ToastContext';

export const Route = createFileRoute('/planes-membresia/')({
  component: PlanesMembresiaComponent,
});

function PlanesMembresiaComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<MembershipPlan | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [resetSelectionTrigger, setResetSelectionTrigger] = useState(0);

  const {
    data: membershipPlans = [],
    isLoading,
    error,
    refetch: refetchMembershipPlans,
    isFetching: isFetchingMembershipPlans,
  } = useQuery({
    queryKey: ['membershipPlans'],
    queryFn: membershipPlansApi.getMembershipPlans,
  });

  const deletePlanMutation = useMutation({
    mutationFn: (id: string) => membershipPlansApi.deleteMembershipPlan(id),
    onSuccess: (_, id) => {
      toast.success('Plan Eliminado', { 
        description: 'El plan de membresía ha sido eliminado exitosamente.' 
      });
      queryClient.invalidateQueries({ queryKey: ['membershipPlans'] });
    },
    onError: (err) => {
      toast.error('Error al Eliminar', { 
        description: err.message || 'No se pudo eliminar el plan.' 
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) =>
      membershipPlansApi.bulkDeleteMembershipPlans({ plans: ids }),
    onSuccess: (_, ids) => {
      toast.success('Planes Eliminados', {
        description: `${ids.length} planes eliminados exitosamente.`,
      });
      queryClient.invalidateQueries({ queryKey: ['membershipPlans'] });
    },
    onError: (err) => {
      toast.error('Error al Eliminar Planes', {
        description: err.message || 'No se pudieron eliminar los planes.',
      });
    },
  });

  const handleBulkDelete = (ids: string[]) => {
    bulkDeleteMutation.mutate(ids, {
      onSuccess: () => {
        setResetSelectionTrigger((prev) => prev + 1);
      },
    });
  };

  const handleRefresh = async () => {
    const startTime = Date.now();
    
    const result = await refetchMembershipPlans();
    
    // Asegurar que pase al menos 1 segundo
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, 1000 - elapsedTime);
    
    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    }
    
    return result;
  };

  if (error) return <p>Error cargando planes: {error.message}</p>;

  return (
    <div className="p-6 h-screen flex flex-col font-montserrat overflow-hidden">
      <HeaderDescriptor
        title="PLANES DE MEMBRESÍA"
        subtitle="LISTADO DE PLANES"
      />

      <div className="flex-shrink-0">
        <div className="mb-6 flex items-center">
                     <HomeCard
             icon={<Locate className="w-8 h-8 text-violet-600" />}
             iconBgColor="bg-violet-100"
             title="Planes totales"
             description={membershipPlans.length}
             descColor="text-violet-600"
             isLoading={isFetchingMembershipPlans}
           />
        </div>

        <div className="flex justify-end gap-3 mb-4">
          <Button
            onClick={() => {
              sessionStorage.removeItem('draftMembershipPlan');
              navigate({ to: '/planes-membresia/agregar' });
            }}
            className="h-10 bg-black text-white font-bold hover:bg-gray-800"
          >
            <Plus className="mr-2 h-4 w-4" /> Agregar
          </Button>

          <Button
            size="sm"
            className="h-10 bg-black text-white font-bold hover:bg-gray-800 cursor-pointer"
            onClick={() => setShowUploadDialog(true)}
          >
            <Upload className="mr-2 h-4 w-4" /> Carga Masiva
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin h-10 w-10 text-gray-500" />
          </div>
        ) : (
          <MembershipPlanTable
            data={membershipPlans}
            onBulkDelete={handleBulkDelete}
            isBulkDeleting={bulkDeleteMutation.isPending}
            onDelete={(plan) => {
              setPlanToDelete(plan);
              setIsDeleteModalOpen(true);
            }}
            resetRowSelectionTrigger={resetSelectionTrigger}
            onRefresh={handleRefresh}
            isRefreshing={isFetchingMembershipPlans}
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
            //await communitiesApi.bulkCreateCommunities(data);
            setShowUploadDialog(false);
            setShowSuccess(true);
            queryClient.invalidateQueries({ queryKey: ['communities'] });
          } catch (error) {
            console.error(error);
            toast.error('Error en Carga Masiva', {
              description: 'No se pudieron crear los planes.',
            });
          }
        }}
      />

      <ConfirmDeleteSingleDialog
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="¿Estás seguro que deseas eliminar este plan?"
        entity="Plan"
        itemName={planToDelete?.type ?? ''}
        onConfirm={() => {
          if (planToDelete) deletePlanMutation.mutate(planToDelete.id);
        }}
      />

      <SuccessDialog
        open={showSuccess}
        onOpenChange={setShowSuccess}
        title="La carga se realizó exitosamente"
        description="Todos los planes de membresía se registraron correctamente."
        buttonText="Cerrar"
      />
    </div>
  );
}
