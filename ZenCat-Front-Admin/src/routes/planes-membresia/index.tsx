'use client';

import HeaderDescriptor from '@/components/common/header-descriptor';
import HomeCard from '@/components/common/home-card';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membershipPlansApi } from '@/api/membership-plans/membership-plans';
import { MembershipPlan } from '@/types/membership-plan';
import { MembershipPlanType } from '@/types/membership-plan';
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
        description: 'El plan de membresía ha sido eliminado exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['membershipPlans'] });
    },
    onError: (err) => {
      toast.error('Error al Eliminar', {
        description: err.message || 'No se pudo eliminar el plan.',
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
  const handleView = (membershipPlan: MembershipPlan) => {
    localStorage.setItem('currentMembershipPlan', membershipPlan.id);
    navigate({
      to: `/planes-membresia/ver`,
      search: { id: membershipPlan.id },
    });
  };
  const handleRefresh = async () => {
    const startTime = Date.now();

    const result = await refetchMembershipPlans();

    // Asegurar que pase al menos 1 segundo
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, 1000 - elapsedTime);

    if (remainingTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
    }

    return result;
  };
  const totalSinLimite = membershipPlans.filter(
    (plan) =>
      plan.reservation_limit === null || plan.reservation_limit === undefined,
  ).length;

  const totalConLimite = membershipPlans.filter(
    (plan) =>
      plan.reservation_limit !== null && plan.reservation_limit !== undefined,
  ).length;
  //validar tipos de membresias
   const tiposValidos = Object.values(MembershipPlanType).join(', ');

  if (error) return <p>Error cargando planes: {error.message}</p>;

  return (
    <div className="p-6 h-screen flex flex-col font-montserrat overflow-hidden">
      <HeaderDescriptor
        title="PLANES DE MEMBRESÍA"
        subtitle="LISTADO DE PLANES"
      />

      <div className="flex-shrink-0">
        <div className="mb-6 gap-4 flex items-center">
          <HomeCard
            icon={<Locate className="w-8 h-8 text-violet-600" />}
            iconBgColor="bg-violet-100"
            title="Planes totales"
            description={membershipPlans.length}
            descColor="text-violet-600"
            isLoading={isFetchingMembershipPlans}
          />
          <HomeCard
            icon={<Locate className="w-8 h-8 text-green-600" />}
            iconBgColor="bg-green-100"
            title="Planes sin límite"
            description={totalSinLimite}
            descColor="text-green-600"
            isLoading={isFetchingMembershipPlans}
          />
          <HomeCard
            icon={<Locate className="w-8 h-8 text-orange-600" />}
            iconBgColor="bg-orange-100"
            title="Planes con límite"
            description={totalConLimite}
            descColor="text-orange-600"
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
            onView={handleView}
            resetRowSelectionTrigger={resetSelectionTrigger}
            onRefresh={handleRefresh}
            isRefreshing={isFetchingMembershipPlans}
          />
        )}
      </div>

      <BulkCreateDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        title="Carga Masiva de Planes de Membresía"
        expectedExcelColumns={['Tipo', 'Tarifa', '¿Tiene Límite?', 'Límite de Reservas']}
        dbFieldNames={['type', 'fee', 'has_limit', 'reservation_limit']}
        onParsedData={async (data, setError) => {
          try {
            const validTypes = Object.values(MembershipPlanType); // ['Mensual', 'Anual']

            const errors: string[] = [];

            const plans = data.map((row, index) => {
              const fee = Number(row.fee);
              const type = row.type?.toString().trim();
              const hasLimitStr = row.has_limit?.toString().toLowerCase();
              const limit = row.reservation_limit;

              const hasLimit = hasLimitStr === 'sí' || hasLimitStr === 'si';

              if (!validTypes.includes(type)) {
                errors.push(`Fila ${index + 2}: tipo inválido "${type}".`);
              }

              if (isNaN(fee) || fee <= 0) {
                errors.push(`Fila ${index + 2}: tarifa inválida "${row.fee}".`);
              }

              if (hasLimit && (isNaN(Number(limit)) || Number(limit) <= 0)) {
                errors.push(`Fila ${index + 2}: límite inválido "${limit}".`);
              }

              return {
                type,
                fee,
                reservation_limit: hasLimit ? Number(limit) : null,
              };
            });

            if (errors.length > 0) {
              setError?.(errors.join('\n'));
              return false;
            }

            await membershipPlansApi.bulkCreateMembershipPlans({ plans });
            setShowUploadDialog(false);
            setShowSuccess(true);
            queryClient.invalidateQueries({ queryKey: ['membershipPlans'] });
            return true;
          } catch (err) {
            console.error(err);
            setError?.('Ocurrió un error inesperado procesando los datos.');
            return false;
          }
        }}
      >
        <div className="px-1 pt-1 text-sm text-muted-foreground space-y-1">
          <p className="text-xs text-gray-500 mt-2">
            El archivo debe contener las siguientes columnas (en este orden): <br />
            <strong>Tipo, Tarifa, ¿Tiene Límite?, Límite de Reservas</strong><br />
            Tipos válidos: <strong>{tiposValidos}</strong><br />
            <a
              href="/plantillas/plantilla-carga-membresias.xlsx"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              Descargar plantilla de ejemplo
            </a>
          </p>
        </div>


      </BulkCreateDialog>



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
