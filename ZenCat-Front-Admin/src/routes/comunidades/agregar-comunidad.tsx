'use client';

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useCommunityForm } from '@/hooks/use-community-basic-form';
import { CommunityForm } from '@/components/community/community-basic-form';
import { CommunityServiceTable } from '@/components/community/community-service-table';
import { CommunityMembershipPlanTable } from '@/components/community/community-membership-plan-table';

import { communityServicesApi } from '@/api/communities/community-services';
import { communityMembershipPlansApi } from '@/api/communities/community-membership-plans';
import { communitiesApi } from '@/api/communities/communities';

import { Button } from '@/components/ui/button';
import HeaderDescriptor from '@/components/common/header-descriptor';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

import { Service } from '@/types/service';
import { MembershipPlan } from '@/types/membership-plan';
import { CreateCommunityPayload } from '@/types/community';

import { useEffect, useState } from 'react';
import { Plus, ChevronLeft } from 'lucide-react';

export const Route = createFileRoute('/comunidades/agregar-comunidad')({
  component: AddCommunityPage,
});

function AddCommunityPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    errors,
    imageFile,
    imagePreview,
    watch,
    reset,
    handleImageChange,
  } = useCommunityForm();

  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedMembershipPlans, setSelectedMembershipPlans] = useState<MembershipPlan[]>([]);

  useEffect(() => {
    const draft = sessionStorage.getItem('draftCommunity');
    const storedServices = sessionStorage.getItem('draftSelectedServices');
    const storedPlans = sessionStorage.getItem('draftSelectedMembershipPlans');
    
    if (draft) reset(JSON.parse(draft));
    if (storedServices) setSelectedServices(JSON.parse(storedServices));
    if (storedPlans) setSelectedMembershipPlans(JSON.parse(storedPlans));
  }, [reset]);

  const createCommunityMutation = useMutation({
    mutationFn: (data: CreateCommunityPayload) =>
      communitiesApi.createCommunity(data),
    onError: (error) =>
      toast.error('Error al crear comunidad', { description: error.message }),
  });

  const onSubmit = async (data: any) => {
    let imageUrl = 'https://via.placeholder.com/150';
    if (imageFile) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.info('Subida simulada de imagen completada');
    }

    try {
      const newCommunity = await createCommunityMutation.mutateAsync({
        name: data.name,
        purpose: data.purpose,
        image_url: imageUrl,
      });

      if (selectedServices.length > 0) {
        const payload = selectedServices.map((s) => ({
          community_id: newCommunity.id,
          service_id: s.id,
        }));
        await communityServicesApi.bulkCreateCommunityServices(payload);
      }

      if (selectedMembershipPlans.length > 0) {
         const payload = selectedMembershipPlans.map((p) => ({
          community_id: newCommunity.id,
          plan_id: p.id,
        }));
         await communityMembershipPlansApi.bulkCreateCommunityMembershipPlans({community_plans : payload});
      }

      toast.success('Comunidad creada correctamente');
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      navigate({ to: '/comunidades' });
    } catch (err: any) {
      toast.error('Error al asociar servicios o planes', { description: err.message });
    }
  };

  return (
    <div className="p-6 space-y-6 font-montserrat">
      <HeaderDescriptor title="COMUNIDADES" subtitle="AGREGAR COMUNIDAD" />
      <div className="mb-4">
        <Button
          variant="outline"
          type="button"
          onClick={() => navigate({ to: '/comunidades' })}
        >
          <ChevronLeft className="w-5 h-5" />
          Volver
        </Button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <CommunityForm
          register={register}
          errors={errors}
          imagePreview={imagePreview}
          handleImageChange={handleImageChange}
        />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <CardTitle>Servicios</CardTitle>
              <CardDescription>
                Seleccione los servicios que brindará la comunidad
              </CardDescription>
            </div>
            <Button
              size="sm"
              className="h-10 bg-black text-white font-bold hover:bg-gray-800"
              onClick={() => {
                sessionStorage.setItem('draftCommunity', JSON.stringify(watch()));
                sessionStorage.setItem('draftSelectedServices', JSON.stringify(selectedServices));
                sessionStorage.setItem('draftSelectedMembershipPlans', JSON.stringify(selectedMembershipPlans));
                navigate({ to: '/comunidades/agregar-servicios' });
              }}
              type="button"
            >
              <Plus className="mr-2 h-4 w-4" /> Agregar
            </Button>
          </CardHeader>
          <CardContent>
            <CommunityServiceTable
              data={selectedServices}
              onDeleteClick={(service) =>
                setSelectedServices((prev) =>
                  prev.filter((s) => s.id !== service.id),
                )
              }
              onBulkDelete={(ids) =>
                setSelectedServices((prev) =>
                  prev.filter((s) => !ids.includes(s.id)),
                )
              }
              isBulkDeleting={false}
              disableConfirmBulkDelete={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <CardTitle>Planes de Membresía</CardTitle>
              <CardDescription>Seleccione los planes de membresía disponibles</CardDescription>
            </div>
            <Button
              size="sm"
              className="h-10 bg-black text-white font-bold hover:bg-gray-800"
              onClick={() => {
                sessionStorage.setItem('draftCommunity', JSON.stringify(watch()));
                sessionStorage.setItem('draftSelectedServices', JSON.stringify(selectedServices));
                sessionStorage.setItem('draftSelectedMembershipPlans', JSON.stringify(selectedMembershipPlans));
                navigate({ to: '/comunidades/agregar-planes-membresía' });
              }}
              type="button"
            >
              <Plus className="mr-2 h-4 w-4" /> Agregar
            </Button>
          </CardHeader>
          <CardContent>
            <CommunityMembershipPlanTable
              data={selectedMembershipPlans}
              onDeleteClick={(plan) =>
                setSelectedMembershipPlans((prev) => prev.filter((p) => p.id !== plan.id))
              }
              onBulkDelete={(ids) =>
                setSelectedMembershipPlans((prev) => prev.filter((p) => !ids.includes(p.id)))
              }
              isBulkDeleting={false}
              disableConfirmBulkDelete={true}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 sm:justify-end pt-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => navigate({ to: '/comunidades' })}
            className="h-10 w-30 text-base"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={createCommunityMutation.isPending}
            className="h-10 w-30 bg-black text-white text-base hover:bg-gray-800"
          >
            Guardar
          </Button>
        </div>
      </form>
    </div>
  );
}
