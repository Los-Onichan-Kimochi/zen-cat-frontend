'use client';

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useToast } from '@/context/ToastContext';
import { showImageUpdateProcessing } from '@/utils/image-toast-helpers';
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
import { ConfirmDeleteSingleDialog } from '@/components/common/confirm-delete-dialogs';
import { base64ToImageUrl } from '@/utils/handleImageFile';

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
import { UpdateCommunityPayload, CommunityWithImage } from '@/types/community';
import { Plus, ChevronLeft } from 'lucide-react';

export const Route = createFileRoute('/comunidades/ver')({
  validateSearch: (search) => ({ id: search.id as string }),
  component: EditCommunityPage,
});

function EditCommunityPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { id } = Route.useSearch();

  const [isEditing, setIsEditing] = useState(false);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedMembershipPlans, setSelectedMembershipPlans] = useState<
    MembershipPlan[]
  >([]);

  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [showServiceConfirmDialog, setShowServiceConfirmDialog] =
    useState(false);

  const [planToDelete, setPlanToDelete] = useState<MembershipPlan | null>(null);
  const [showPlanConfirmDialog, setShowPlanConfirmDialog] = useState(false);
  const {
    data: community,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['community', id],
    queryFn: () => communitiesApi.getCommunityById(id),
  });

  // Separate query for community with image when needed
  const {
    data: communityWithImage,
    isLoading: isLoadingImage,
  } = useQuery({
    queryKey: ['community-with-image', id],
    queryFn: () => communitiesApi.getCommunityWithImage(id),
    enabled: !!id, // Load image data whenever we have an ID
  });

  console.log('Comunidad: ', community);
  console.log('Comunidad con imagen: ', communityWithImage);
  const { data: initialServices } = useQuery({
    queryKey: ['community-services', id],
    queryFn: () => communityServicesApi.getCommunityServices(id),
    enabled: !!id,
  });

  const { data: initialPlans } = useQuery({
    queryKey: ['community-plans', id],
    queryFn: () => communityMembershipPlansApi.getCommunityMembershipPlans(id),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    errors,
    watch,
    imageFile,
    imagePreview,
    imageBytes,
    setImageFile,
    setImagePreview,
    setImageBytes,
    handleImageChange,
    reset,
  } = useCommunityForm();

  useEffect(() => {
    if (community && id) {
      console.log('Id: ', id);
      console.log('Comunidad: ', community);
      reset({
        name: community.name,
        purpose: community.purpose,
      });
    }
  }, [community, id]);

  // Effect to handle image display from S3
  useEffect(() => {
    // Only update preview from S3 if no new image has been selected
    if (!imageFile) {
      if (communityWithImage?.image_bytes && communityWithImage.image_bytes.length > 0) {
        try {
          const imageUrl = base64ToImageUrl(communityWithImage.image_bytes);
          setImagePreview(imageUrl);
        } catch (error) {
          console.error('Error al convertir Base64 a URL:', error);
        }
      } else if (community?.image_url && community.image_url !== 'default-community-image.jpg') {
        // Fallback to image_url if no bytes available
        setImagePreview(community.image_url);
      }
    }
  }, [communityWithImage, community, imageFile]);

  useEffect(() => {
    const loadAssociations = async () => {
      if (initialServices) {
        const services = await Promise.all(
          initialServices.map((cs) =>
            servicesApi.getServiceById(cs.service_id),
          ),
        );
        setSelectedServices(services);
      }

      if (initialPlans) {
        const plans = await Promise.all(
          initialPlans.map((cp) =>
            membershipPlansApi.getMembershipPlanById(cp.plan_id),
          ),
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
      toast.success('Comunidad Actualizada', {
        description: 'La comunidad ha sido actualizada correctamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['community', id] });
      queryClient.invalidateQueries({ queryKey: ['community-with-image', id] });
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      setIsEditing(false);
      // Clear selected image after successful update
      setImageFile(null);
      setImageBytes(null);
      // Optionally navigate away or stay on the page
      // navigate({ to: '/comunidades' });
    },
    onError: (err: any) => {
      toast.error('Error al Actualizar', { 
        description: err.message || 'No se pudo actualizar la comunidad.' 
      });
    },
  });

  const onSubmit = async (data: any) => {
    let imageUrl = community?.image_url || 'default-community-image.jpg';
    
    // Generate new filename if image was changed
    if (imageFile) {
      const timestamp = Date.now();
      const fileExtension = imageFile.name.split('.').pop() || 'jpg';
      imageUrl = `community-${timestamp}.${fileExtension}`;
      
      showImageUpdateProcessing(toast);
    }

    try {
      const payload: UpdateCommunityPayload = {
        name: data.name,
        purpose: data.purpose,
        image_url: imageUrl,
      };

      // Add image bytes if a new image was selected
      if (imageBytes && imageBytes.length > 0) {
        payload.image_bytes = imageBytes;
      }

      await updateMutation.mutateAsync(payload);
    } catch (err: any) {
      toast.error('Error al Actualizar Comunidad', {
        description: err.message || 'No se pudo actualizar la comunidad.',
      });
    }
  };

  const deleteServiceMutation = useMutation({
    mutationFn: ({
      communityId,
      serviceId,
    }: {
      communityId: string;
      serviceId: string;
    }) => communityServicesApi.deleteCommunityService(communityId, serviceId),
    onSuccess: (_, service) => {
      toast.success('Servicio Desvinculado', {
        description: 'El servicio ha sido desvinculado exitosamente.',
      });
      setSelectedServices((prev) =>
        prev.filter((s) => s.id !== service.serviceId),
      );
    },
    onError: (err) => {
      toast.error('Error al Desvincular', { 
        description: err.message || 'No se pudo desvincular el servicio.' 
      });
    },
  });

  const bulkDeleteServiceMutation = useMutation({
    mutationFn: (ids: string[]) =>
      communityServicesApi.bulkDeleteCommunityServices({
          community_services: ids,
      }),
    onSuccess: (_, ids) => {
      toast.success('Servicios Desvinculados', {
        description: `${ids.length} servicios desvinculados exitosamente.`,
      });
      setSelectedServices((prev) => prev.filter((s) => !ids.includes(s.id)));
      queryClient.invalidateQueries({ queryKey: ['community-services', id] });
    },
    onError: (err) => {
      toast.error('Error al Desvincular Servicios', { 
        description: err.message || 'No se pudieron desvincular los servicios.' 
      });
    },
  });

  const deleteMembershipPlanMutation = useMutation({
    mutationFn: ({
      communityId,
      planId,
    }: {
      communityId: string;
      planId: string;
    }) =>
      communityMembershipPlansApi.deleteCommunityMembershipPlan(
        communityId,
        planId,
      ),
    onSuccess: (_, plan) => {
      toast.success('Plan Desvinculado', {
        description: 'El plan ha sido desvinculado exitosamente.',
      });
      setSelectedMembershipPlans((prev) =>
        prev.filter((p) => p.id !== plan.planId),
      );
    },
    onError: (err) => {
      toast.error('Error al Desvincular Plan', { 
        description: err.message || 'No se pudo desvincular el plan.' 
      });
    },
  });

  const bulkDeleteMembershipPlanMutation = useMutation({
    mutationFn: (ids: string[]) =>
      communityMembershipPlansApi.bulkDeleteCommunityMembershipPlans({
        community_plans: ids,
      }),
    onSuccess: (_, ids) => {
      toast.success('Planes Desvinculados', {
        description: `${ids.length} planes desvinculados exitosamente.`,
      });
      setSelectedMembershipPlans((prev) =>
        prev.filter((p) => !ids.includes(p.id)),
      );
      queryClient.invalidateQueries({ queryKey: ['community-plans', id] });
    },
    onError: (err) => {
      toast.error('Error al Desvincular Planes', {
        description: err.message || 'No se pudieron desvincular los planes.',
      });
    },
  });

  if (isLoading) {
    return <p className="p-6">Cargando...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-500">Error cargando la comunidad</p>;
  }

  return (
    <div className="p-6 space-y-6 font-montserrat">
      <HeaderDescriptor title="COMUNIDADES" subtitle="EDITAR COMUNIDAD" />
      <div className="mb-4">
        <Button
          variant="outline"
          onClick={() => navigate({ to: '/comunidades' })}
        >
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
          isEditing={isEditing}
        />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Servicios</CardTitle>
              <CardDescription>
                Servicios vinculados a esta comunidad
              </CardDescription>
            </div>
            <Button
              type="button"
              disabled={!isEditing}
              className={isEditing ? '' : 'cursor-not-allowed opacity-70'}
              onClick={() => {
                if (!isEditing) return;
                sessionStorage.setItem(
                  'draftCommunity',
                  JSON.stringify(watch()),
                );
                sessionStorage.setItem(
                  'draftSelectedServices',
                  JSON.stringify(selectedServices),
                );
                sessionStorage.setItem(
                  'draftSelectedMembershipPlans',
                  JSON.stringify(selectedMembershipPlans),
                );
                sessionStorage.setItem('modeAddService', 'editar');
                sessionStorage.setItem('currentCommunity', id);
                navigate({ to: '/comunidades/agregar-servicios' }); //
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Agregar
            </Button>
          </CardHeader>
          <CardContent>
            <CommunityServiceTable
              data={selectedServices}
              onDeleteClick={(service) => {
                setServiceToDelete(service);
                setShowServiceConfirmDialog(true);
              }}
              onBulkDelete={(ids) => bulkDeleteServiceMutation.mutate(ids)}
              isBulkDeleting={bulkDeleteServiceMutation.isPending}
              disableConfirmBulkDelete={false}
              isEditing={isEditing}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Planes de Membresía</CardTitle>
              <CardDescription>Planes asignados a la comunidad</CardDescription>
            </div>
            <Button
              type="button"
              disabled={!isEditing}
              className={isEditing ? '' : 'cursor-not-allowed opacity-70'}
              onClick={() => {
                if (!isEditing) return;
                sessionStorage.setItem(
                  'draftCommunity',
                  JSON.stringify(watch()),
                );
                sessionStorage.setItem(
                  'draftSelectedServices',
                  JSON.stringify(selectedServices),
                );
                sessionStorage.setItem(
                  'draftSelectedMembershipPlans',
                  JSON.stringify(selectedMembershipPlans),
                );
                sessionStorage.setItem('modeAddMembershipPlan', 'editar');
                sessionStorage.setItem('currentCommunity', id);
                navigate({ to: '/comunidades/agregar-planes-membresía' });
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Agregar
            </Button>
          </CardHeader>
          <CardContent>
            <CommunityMembershipPlanTable
              data={selectedMembershipPlans}
              onDeleteClick={(plan) => {
                setPlanToDelete(plan);
                setShowPlanConfirmDialog(true);
              }}
              onBulkDelete={(ids) =>
                bulkDeleteMembershipPlanMutation.mutate(ids)
              }
              isBulkDeleting={bulkDeleteMembershipPlanMutation.isPending}
              disableConfirmBulkDelete={false}
              isEditing={isEditing}
            />
          </CardContent>
        </Card>
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            className="h-10 w-30 text-base"
            onClick={() => {
              if (isEditing) {
                // Reset form and clear selected image
                reset({
                  name: community?.name,
                  purpose: community?.purpose,
                });
                setImageFile(null);
                setImageBytes(null);
                setIsEditing(false);
                // Force reload of S3 image after clearing states
                setTimeout(() => {
                  if (communityWithImage?.image_bytes) {
                    const imageUrl = base64ToImageUrl(communityWithImage.image_bytes);
                    setImagePreview(imageUrl);
                  }
                }, 100);
              } else {
                navigate({ to: '/comunidades' });
              }
            }}
          >
            {isEditing ? 'Cancelar Edición' : 'Cancelar'}
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (isEditing) {
                handleSubmit(onSubmit)();
              } else {
                setIsEditing(true);
                // Clear any previously selected image when entering edit mode
                setImageFile(null);
                setImageBytes(null);
              }
            }}
            className="h-10 w-30 bg-black text-white text-base hover:bg-gray-800"
          >
            {isEditing ? 'Guardar' : 'Editar'}
          </Button>
        </div>
      </form>
      <ConfirmDeleteSingleDialog
        isOpen={showServiceConfirmDialog}
        onOpenChange={setShowServiceConfirmDialog}
        title="¿Estás seguro que deseas eliminar este servicio?"
        entity="Servicio"
        itemName={serviceToDelete?.name ?? ''}
        onConfirm={() => {
          if (serviceToDelete) {
            deleteServiceMutation.mutate({
              communityId: id,
              serviceId: serviceToDelete.id,
            });
          }
        }}
      />

      <ConfirmDeleteSingleDialog
        isOpen={showPlanConfirmDialog}
        onOpenChange={setShowPlanConfirmDialog}
        title="¿Estás seguro que deseas eliminar este plan?"
        entity="Plan de Membresía"
        itemName={planToDelete?.type ?? ''}
        onConfirm={() => {
          if (planToDelete) {
            deleteMembershipPlanMutation.mutate({
              communityId: id,
              planId: planToDelete.id,
            });
          }
        }}
      />
    </div>
  );
}
