'use client';

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { communitiesApi } from '@/api/communities/communities';
import { CreateCommunityPayload } from '@/types/community';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import HeaderDescriptor from '@/components/common/header-descriptor';
import { toast } from "sonner";
import { useState } from 'react';
import { Loader2, UploadCloud } from 'lucide-react';
import '../../index.css';

export const Route = createFileRoute('/comunidades/nuevo')({
  component: AddCommunityPageComponent,
})

const communityFormSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido." }),
  purpose: z.string().min(1, { message: "El propósito es requerido." }),
  profileImageFile: z.any().optional(),
});

type CommunityFormData = z.infer<typeof communityFormSchema>;

function AddCommunityPageComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<CommunityFormData>({
    resolver: zodResolver(communityFormSchema),
    defaultValues: {
      name: '',
      purpose: '',
    },
  });

  const createCommunityMutation = useMutation({
    mutationFn: async (data: CreateCommunityPayload) => communitiesApi.createCommunity(data),
    onSuccess: () => {
      toast.success("Comunidad Creada", { description: "La comunidad ha sido agregado exitosamente." });
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      navigate({ to: '/comunidades' });
    },
    onError: (error) => {
      toast.error("Error al crear comunidad", { description: error.message || "No se pudo crear la comunidad." });
    },
  });

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

  const onSubmit = async (data: CommunityFormData) => {
    let imageUrl = 'https://via.placeholder.com/150';
    if (imageFile) {
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      toast.info("Imagen (simulada)", { description: "Subida de imagen simulada completada." });
    }

    const payload: CreateCommunityPayload = {
      name: data.name,
      purpose: data.purpose,
      image_url: imageUrl,
    };
    createCommunityMutation.mutate(payload);
  };

  return (
    <div className="p-2 md:p-6 h-full flex flex-col font-montserrat">
      <HeaderDescriptor title="COMUNIDADES" subtitle="AGREGAR COMUNIDAD" />
      <Card className="mt-6 flex-grow">
        <CardHeader>
          <CardTitle>Datos de la comunidad</CardTitle>
          <CardDescription>Complete la información para agregar una nueva comunidad.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Columna Izquierda para campos */}
            <div className="grid grid-cols-1 gap-y-6">
              <div>
                <Label htmlFor="name" className="mb-2">Nombres</Label>
                <Input id="name" {...register("name")} placeholder="Ingrese el nombre de la comunidad" />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="purpose" className="mb-2">Propósito</Label>
                <Textarea
                  id="purpose"
                  {...register("purpose")}
                  placeholder="Ingrese un propósito"
                />
                {errors.purpose && <p className="text-red-500 text-sm mt-1">{errors.purpose.message}</p>}
              </div>
            </div>

            {/* Columna Derecha para el logo y los botones */}
            <div className="flex flex-col space-y-6">
              <div className="flex flex-col">
                <Label htmlFor="logoImageFile" className="mb-2 self-start">Logo</Label>
                <div className="w-full h-100 border-2 border-dashed rounded-md flex items-center justify-center bg-gray-50 mb-4 relative">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Vista previa" className="object-contain h-full w-full rounded-md" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <UploadCloud size={48} className="mx-auto"/>
                      <p>Arrastra o selecciona un archivo</p>
                      <p className="text-xs">PNG, JPG, GIF hasta 10MB</p>
                    </div>
                  )}
                   <Input 
                    id="profileImageFile" 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    accept="image/png, image/jpeg, image/gif"
                    {...register("profileImageFile")} 
                    onChange={handleImageChange} 
                  />
                </div>
                {errors.profileImageFile && typeof errors.profileImageFile.message === 'string' && (
                  <p className="text-red-500 text-sm mt-1">{errors.profileImageFile.message}</p>
                )}
              </div>
              
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 sm:justify-end pt-4">
                <Button variant="outline" type="button" onClick={() => navigate({ to: '/comunidades' })} className="w-full sm:w-auto">Cancelar</Button>
                <Button type="submit" disabled={createCommunityMutation.isPending} className="w-full sm:w-auto">
                  {createCommunityMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar
                </Button>
              </div>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
} 