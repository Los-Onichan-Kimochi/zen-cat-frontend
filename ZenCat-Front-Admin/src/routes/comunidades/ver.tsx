'use client';

import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { UpdateCommunityPayload } from '@/types/community';
import { communitiesApi } from '@/api/communities/communities';
import { Community } from '@/types/community';
import HeaderDescriptor from '@/components/common/header-descriptor';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';

// Definir esquema de validación con Zod
const communityUpdateSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  purpose: z.string().min(1, "El propósito es requerido."),
  profileImageFile: z.any().optional(),
});

type CommunityUpdateFormData = z.infer<typeof communityUpdateSchema>;

export const Route = createFileRoute('/comunidades/ver')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      id: search.id as string,
    };
  },
  component: SeeCommunityPageComponent,
});

export function SeeCommunityPageComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const search = useSearch({ from: '/comunidades/ver' });
  const communityId = search.id;

  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Si no hay ID, redirigir
  useEffect(() => {
    if (!communityId) {
      navigate({ to: '/comunidades' });
    }
  }, [communityId, navigate]);

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommunityUpdateFormData>({
    resolver: zodResolver(communityUpdateSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      purpose: '',
    },
  });

  const { 
    data: community,
    isLoading,
    error 
  } = useQuery({
    queryKey: ['community', communityId],
    queryFn: () => communitiesApi.getCommunityById(communityId!),
  });

  // Mutación para actualizar comunidad
  const updateMutation = useMutation({
    mutationFn: async (data: UpdateCommunityPayload & { imageFile?: File | null }) => {
      let imageUrl = data.imageFile ? URL.createObjectURL(data.imageFile) : community?.image_url || 'https://via.placeholder.com/150';
      return communitiesApi.updateCommunity(communityId!, {
        name: data.name,
        purpose: data.purpose,
        image_url: imageUrl,
      });
    },
    onSuccess: () => {
      toast.success('Comunidad actualizada exitosamente');
      queryClient.invalidateQueries({queryKey: ['community', communityId]});
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error('Error al actualizar la comunidad', {
        description: error.message || 'No se pudo actualizar.',
      });
    },
  });

  const onSubmit = (data: CommunityUpdateFormData) => {
    updateMutation.mutate({ ...data, imageFile });
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading || !communityId) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin w-12 h-12" />
      </div>
    );
  }

  useEffect(() => {
    if (community) {
      // Llenar los campos del formulario con los datos actuales
      reset({
        name: community.name,
        purpose: community.purpose,
      });

      // Actualizar vista previa de imagen con la URL actual de la comunidad
      setImagePreview(community.image_url || null);
    }
  }, [community, reset]);

  if (error) {
    return <div>Error cargando la comunidad.</div>;
  }

  return (
    <div className="p-2 md:p-6 h-full flex flex-col font-montserrat">
      <HeaderDescriptor title="COMUNIDADES" subtitle="Editar Comunidad" />
      <Card className="mt-6 flex-grow">
        <CardHeader>
          <CardTitle>Datos de la comunidad</CardTitle>
          <CardDescription>Complete la información para editar esta comunidad.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="grid grid-cols-1 gap-y-6">
              <div>
                <Label htmlFor="name" className="mb-2">Nombre</Label>
                <Input id="name" disabled={!isEditing} {...register('name')} 
                  aria-invalid={!!errors.name} aria-describedby="name-error"
                />
                {errors.name && (
                  <p id="name-error" className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="purpose" className="mb-2">Propósito</Label>
                <Textarea
                  id="purpose"
                  {...register("purpose")}
                  disabled={!isEditing}
                  aria-invalid={!!errors.purpose}
                  aria-describedby="purpose-error"
                />
                {errors.purpose && (
                  <p id="purpose-error" className="text-red-600 text-sm mt-1">
                {errors.purpose.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col space-y-6">
              <div>
                <Label htmlFor="profileImageFile">Logo</Label>
                <div className="w-full h-80 border-2 border-dashed rounded-md flex items-center justify-center bg-gray-50 relative overflow-hidden">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Vista previa del logo" className="object-contain h-full w-full"/>
                  ) : (
                    <div className="text-center text-gray-400">
                      <UploadCloud size={48} className="mx-auto mb-1" />
                      <p>Arrastra o selecciona un archivo</p>
                      <p className="text-xs">PNG, JPG, GIF hasta 10MB</p>
                    </div>
                  )}
                  {isEditing && (
                    <Input
                      id="profileImageFile"
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="image/png, image/jpeg, image/gif"
                      {...register("profileImageFile")}
                      onChange={handleImageChange}
                    />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="secondary" type="button" onClick={() => navigate({ to: '/comunidades' })}>
              Volver
            </Button>
            <Button
              type="button"
              variant={isEditing ? 'destructive' : 'default'}
              onClick={() => {
                if (isEditing) {
              handleSubmit(onSubmit)();
                } else {
              setIsEditing(true);
                }
              }}
              disabled={isSubmitting}
            >
              {isEditing ? 'Guardar' : 'Editar'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
