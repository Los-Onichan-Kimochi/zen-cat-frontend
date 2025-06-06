'use client';

import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { CommunityForm } from '@/components/community/community-basic-form';
import { CommunityServiceTable } from '@/components/community/community-service-table';
import { CommunityMembershipPlanTable } from '@/components/community/community-membership-plan-table';
import { useCommunityForm } from '@/hooks/use-community-basic-form';

import { communitiesApi } from '@/api/communities/communities';
import { servicesApi } from '@/api/services/services';
import { membershipPlansApi } from '@/api/membership-plans/membership-plans';
import { communityServicesApi } from '@/api/communities/community-services';
import { communityMembershipPlansApi } from '@/api/communities/community-membership-plans';

import HeaderDescriptor from '@/components/common/header-descriptor';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

import { Service } from '@/types/service';
import { MembershipPlan } from '@/types/membership-plan';
import { UpdateCommunityPayload } from '@/types/community';
import { Plus, ChevronLeft } from 'lucide-react';

export const Route = createFileRoute('/comunidades/ver')({
  validateSearch: (search) => ({ id: search.id as string }),
  component: EditCommunityPage,
});

function EditCommunityPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = Route.useSearch();

  const [isEditing, setIsEditing] = useState(false);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedMembershipPlans, setSelectedMembershipPlans] = useState<MembershipPlan[]>([]);

  const {
    data: community,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['community', id],
    queryFn: () => communitiesApi.getCommunityById(id),
  });

  const { data: initialServices } = useQuery<CommunityService[]>({
    queryKey: ['community-services', id],
    queryFn: () => communityServicesApi.getCommunityServices(id),
    enabled: !!id,
  });

  const { data: initialPlans } = useQuery<CommunityMembershipPlan[]>({
    queryKey: ['community-plans', id],
    queryFn: () => communityMembershipPlansApi.getCommunityMembershiPlans(id),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    errors,
    watch,
    imageFile,
    imagePreview,
    setImagePreview,
    handleImageChange,
    reset,
  } = useCommunityForm();

  useEffect(() => {
    if (community) {
      reset({
        name: community.name,
        purpose: community.purpose,
      });
      setImagePreview(community.image_url ?? null);
    }
  }, [community, reset, setImagePreview]);

  useEffect(() => {
    const loadAssociations = async () => {
      if (initialServices) {
        const services = await Promise.all(
          initialServices.map((cs) => servicesApi.getServiceById(cs.service_id))
        );
        setSelectedServices(services);
      }

      if (initialPlans) {
        const plans = await Promise.all(
          initialPlans.map((cp) => membershipPlansApi.getMembershipPlanById(cp.plan_id))
        );
        setSelectedMembershipPlans(plans);
      }
    };

    loadAssociations();
  }, [initialServices, initialPlans]);

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateCommunityPayload) => {
      return communitiesApi.updateCommunity(id, data);
    },
    onSuccess: () => {
      toast.success('Comunidad actualizada correctamente');
      queryClient.invalidateQueries({ queryKey: ['community', id] });
      navigate({ to: '/comunidades' });
    },
    onError: (err: any) => {
      toast.error('Error al actualizar', { description: err.message });
    },
  });

  const onSubmit = async (data: any) => {
    let imageUrl = community?.image_url || 'https://via.placeholder.com/150';
    if (imageFile) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.info('Subida simulada de imagen');
    }

    try {
      await updateMutation.mutateAsync({
        name: data.name,
        purpose: data.purpose,
        image_url: imageUrl,
      });

      await communityServicesApi.updateCommunityServices(id, selectedServices);
      await communityMembershipPlansApi.updateCommunityMembershipPlans(id, selectedMembershipPlans);

    } catch (err: any) {
      toast.error('Error al actualizar asociaciones', { description: err.message });
    }
  };

  if (isLoading) {
    return <p className="p-6">Cargando...</p>;
  }

  if (error || !community) {
    return <p className="p-6 text-red-500">Error cargando la comunidad</p>;
  }

  return (
    <div className="p-6 space-y-6 font-montserrat">
      <HeaderDescriptor title="COMUNIDADES" subtitle="EDITAR COMUNIDAD" />
      <div className="mb-4">
        <Button variant="outline" onClick={() => navigate({ to: '/comunidades' })}>
          <ChevronLeft className="mr-2 h-4 w-4" />
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
            <div>
              <CardTitle>Servicios</CardTitle>
              <CardDescription>Servicios vinculados a esta comunidad</CardDescription>
            </div>
            {isEditing && (
              <Button
                type="button"
                onClick={() => {
                  sessionStorage.setItem('draftCommunity', JSON.stringify(watch()));
                  sessionStorage.setItem('draftSelectedServices', JSON.stringify(selectedServices));
                  sessionStorage.setItem('draftSelectedMembershipPlans', JSON.stringify(selectedMembershipPlans));
                  navigate({ to: '/comunidades/agregar-servicios' });
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Editar
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <CommunityServiceTable
              data={selectedServices}
              onDeleteClick={(service) => setSelectedServices((prev) => prev.filter((s) => s.id !== service.id))}
              onBulkDelete={(ids) => setSelectedServices((prev) => prev.filter((s) => !ids.includes(s.id)))}
              isBulkDeleting={false}
              disableConfirmBulkDelete={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Planes de Membresía</CardTitle>
              <CardDescription>Planes asignados a la comunidad</CardDescription>
            </div>
            {isEditing && (
              <Button
                type="button"
                onClick={() => {
                  sessionStorage.setItem('draftCommunity', JSON.stringify(watch()));
                  sessionStorage.setItem('draftSelectedServices', JSON.stringify(selectedServices));
                  sessionStorage.setItem('draftSelectedMembershipPlans', JSON.stringify(selectedMembershipPlans));
                  navigate({ to: '/comunidades/agregar-planes-membresía' });
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Editar
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <CommunityMembershipPlanTable
              data={selectedMembershipPlans}
              onDeleteClick={(plan) => setSelectedMembershipPlans((prev) => prev.filter((p) => p.id !== plan.id))}
              onBulkDelete={(ids) => setSelectedMembershipPlans((prev) => prev.filter((p) => !ids.includes(p.id)))}
              isBulkDeleting={false}
              disableConfirmBulkDelete={true}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: '/comunidades' })}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (isEditing) {
                handleSubmit(onSubmit)();
              } else {
                setIsEditing(true);
              }
            }}
          >
            {isEditing ? 'Guardar' : 'Editar'}
          </Button>
        </div>
      </form>
    </div>
  );
}
