import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useMembershipPlanForm } from '@/hooks/use-membership-plan-basic-form';
import { MembershipPlanForm } from '@/components/membership-plan/membership-plan-basic-form';
import { membershipPlansApi } from '@/api/membership-plans/membership-plans';

import { Button } from '@/components/ui/button';
import HeaderDescriptor from '@/components/common/header-descriptor';
import { CreateMembershipPlanPayload } from '@/types/membership-plan';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Plus, ChevronLeft } from 'lucide-react';
import { FormProvider } from 'react-hook-form';

export const Route = createFileRoute('/planes-membresia/agregar')({
  component: AddMembershipPlanPage,
})

function AddMembershipPlanPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {form} = useMembershipPlanForm();

  //const has_limit = watch('has_limit');

  const createMembershipPlanMutation = useMutation({
    mutationFn: (data: CreateMembershipPlanPayload) =>
      membershipPlansApi.createMembershipPlan(data),
    onError: (error) =>
      toast.error('Error al crear plan de membresía', { description: error.message }),
  });

  const onSubmit = async (data: any) => {

    try {
      const newMembershipPlan = await createMembershipPlanMutation.mutateAsync({
        type: data.type,
        fee: data.fee,
        reservation_limit: data.reservation_limit,
      });

      toast.success('Plan de membresía creado correctamente');
      queryClient.invalidateQueries({ queryKey: ['membershipPlans'] });
      navigate({ to: '/planes-membresia' });
    } catch (err: any) {
      toast.error('Error al crear plan de membresía', { description: err.message });
    }
  };

  return (
    <div className="p-6 space-y-6 font-montserrat">
      <HeaderDescriptor title="PLANES DE MEMBRESÍA" subtitle="AGREGAR PLAN DE MEMBRESÍA" />
      <div className="mb-4">
        <Button
          variant="outline"
          type="button"
          onClick={() => navigate({ to: '/planes-membresia' })}
        >
          <ChevronLeft className="w-5 h-5" />
          Volver
        </Button>
      </div>
      
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <MembershipPlanForm mode='add'/>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 sm:justify-end pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate({ to: '/planes-membresia' })}
                className="h-10 w-30 text-base"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMembershipPlanMutation.isPending}
                className="h-10 w-30 bg-black text-white text-base hover:bg-gray-800"
              >
                Guardar
              </Button>
            </div>
          </form>
        </FormProvider>
      
 
    </div>
  );
}
