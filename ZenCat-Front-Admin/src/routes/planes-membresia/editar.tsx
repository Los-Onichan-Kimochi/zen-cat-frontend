'use client';
import HeaderDescriptor from '@/components/common/header-descriptor';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { ArrowLeft, MapPin, Link as LinkIcon, User } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { UploadCloud } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useMembershipPlanForm } from '@/hooks/use-membership-plan-basic-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { membershipPlansApi } from '@/api/membership-plans/membership-plans';
import { Form, FormProvider, useForm } from 'react-hook-form';
import { MembershipPlanForm } from '@/components/membership-plan/membership-plan-basic-form'; 
import { toast } from 'sonner';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const Route = createFileRoute('/planes-membresia/editar')({
  component: EditLocalComponent,
})

function EditLocalComponent() {
  const navigate = useNavigate();
  const id =
    typeof window !== 'undefined' ? localStorage.getItem('currentMembershipPlan') : null;
  const queryClient = useQueryClient();
  if (!id) {
    navigate({ to: '/planes-membresia' });
  }
  const { data: membershipPlan, isLoading, error } = useQuery({
    queryKey: ['membershipPlan', id],
    queryFn: () => membershipPlansApi.getMembershipPlanById(id!),
    enabled: !!id,
  });
  const { form } = useMembershipPlanForm({
    defaultValues: membershipPlan,
  });
  useEffect(() => {
    if (membershipPlan) {
      form.reset(membershipPlan);
    }
  }, [membershipPlan, form]);

  const updateMembershipPlanMutation = useMutation({
    mutationFn: (data: any) =>
      membershipPlansApi.updateMembershipPlan(id!, data),
    onSuccess: () => {
      toast.success('Plan de membresía actualizado correctamente');
      queryClient.invalidateQueries({ queryKey: ['membershipPlan', id]});
      navigate({ to: '/planes-membresia' });
    },
    onError: (error: any) => {
      toast.error('Error al actualizar plan de membresía', { description: error.message });
    },
  });

  const onSubmit = async (data: any) => {
    await updateMembershipPlanMutation.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error || !membershipPlan) {
    return (
      <div className="p-6 h-full">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/planes-membresia' })}
            className="mr-4"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>
        <div className="text-center">
          <p className="text-red-600">Error cargando el plan de membresía</p>
        </div>
      </div>
    );
  }
  return (<div className="p-6 space-y-6 font-montserrat">
      <HeaderDescriptor
        title="PLANES DE MEMBRESÍA"
        subtitle="EDITAR PLAN DE MEMBRESÍA"
      />
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
          <MembershipPlanForm mode="edit" description="Edita los datos del plan de membresía" />
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
              className="h-10 w-30 bg-black text-white text-base hover:bg-gray-800"
              disabled={updateMembershipPlanMutation.isPending}
            >
              Guardar
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
