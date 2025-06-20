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
import { useLocalForm } from '@/hooks/use-local-basic-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { localsApi } from '@/api/locals/locals';
import { Form, FormProvider, useForm } from 'react-hook-form';
import { LocalForm } from '@/components/locals/local-basic-form';
import { toast } from 'sonner';
const localSearchSchema = z.object({
  id: z.string(),
});

export const Route = createFileRoute('/locales/ver')({
  //validateSearch: localSearchSchema,
  component: SeeLocalPageComponent,
});
//interface LocalFormStatic {
//  imagePreview: string | null;
//  //handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
//}
export function SeeLocalPageComponent() {
  const navigate = useNavigate();
  //const { id } = Route.useSearch(); //as z.infer<typeof localSearchSchema>;
  const id =
    typeof window !== 'undefined' ? localStorage.getItem('currentLocal') : null;
  const queryClient = useQueryClient();
  if (!id) {
    navigate({ to: '/locales' });
  }
  const {
    data: local,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['local', id],
    queryFn: () => localsApi.getLocalById(id!),
  });
  const [isEditing, setIsEditing] = useState(false);

// 1. Siempre inicializa el formulario, aunque local sea undefined
  const localForm = useLocalForm({
    defaultValues: local || {},
  });

  // 2. Cuando llega la data, resetea el formulario
  useEffect(() => {
    if (local) {
      localForm.form.reset(local);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  const updateLocalMutation = useMutation({
    mutationFn: (data: any) => localsApi.updateLocal(id!, data),
    onSuccess: () => {
      toast.success('Local Actualizado', {
        description: 'El local ha sido actualizado exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['locals',id] });
      navigate({ to: '/locales' });
    },
    onError: (error) => {
      toast.error('Error al actualizar local', {
        description: error.message || 'No se pudo actualizar el local.',
      });
    },
  });
  const handleSave = async (data: any) => {
     //console.log('handleSave ejecutado', data);
     //updateLocalMutation.mutate(data);
     setIsEditing(false);
  };
  if (isLoading) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error || !local) {
    return (
      <div className="p-6 h-full">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/locales' })}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>
        <div className="text-center">
          <p className="text-red-600">Error cargando el local</p>
        </div>
      </div>
    );
  }
  return (
        <div className="p-6 h-full flex flex-col font-montserrat">
      <HeaderDescriptor title="LOCALES" subtitle={!isEditing ? "Visualización del local" : "Editar local"} />
      <FormProvider {...localForm.form}>
        <form
          onSubmit={localForm.form.handleSubmit(handleSave)}
          className="mb-4"
        >
          
          <LocalForm
            imagePreview={local.image_url}
            handleImageChange={() => {}}
            isReadOnly={!isEditing}
            description={
              !isEditing 
              ? "Detalles del local seleccionado" 
              : "Edite los datos del local y guarde los cambios"}
          />
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 sm:justify-end pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate({ to: '/locales' })}
              className="h-10 w-30 text-base"
            >
              Cancelar
            </Button>
            {!isEditing ? (
              <Button
                type="button"
                onClick={() => {
                  //console.log('Click en Editar');
                  setIsEditing(true)
                  localStorage.setItem('currentLocal', id? id : '');
                  navigate({ to: `/locales/editar`})
                }}
                className="h-10 w-30 bg-black text-white text-base hover:bg-gray-800"
              >
                Editar
              </Button>
              ) : (
                <Button
                  type="submit"
                  
                  className="h-10 w-30 bg-green-600 text-white text-base hover:bg-green-700"
                  
                >
                  Guardar
                </Button>
              )}
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
/*
<Pencil className="w-4 h-4 mr-2" />
<!--<Save className="w-4 h-4 mr-2" />-->
<Pencil className="w-4 h-4 mr-2" />
<div className="p-6 h-full flex flex-col font-montserrat">
      <HeaderDescriptor title="LOCALES" subtitle="Visualización del local" />
      <Card>
        <CardHeader>
          <CardTitle>Información del Local</CardTitle>
          <CardDescription>Detalles del local seleccionado</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          
          <div className="grid grid-cols-1 gap-y-6">
            <div>
              <Label htmlFor="local_name" className="mb-2">
                Nombre del local
              </Label>
              <p className="border p-2 rounded bg-gray-100">
                {local.local_name}
              </p>
            </div>
            <div>
              <Label htmlFor="street_name" className="mb-2">
                Nombre de la calle
              </Label>
              <p className="border p-2 rounded bg-gray-100">
                {local.street_name}
              </p>
            </div>
            <div>
              <Label htmlFor="building_number" className="mb-2">
                Número de edificio
              </Label>
              <p className="border p-2 rounded bg-gray-100">
                {local.building_number}
              </p>
            </div>
            <div>
              <Label htmlFor="region" className="mb-2">
                Región
              </Label>
              <p className="border p-2 rounded bg-gray-100">{local.region}</p>
            </div>
            <div>
              <Label htmlFor="province" className="mb-2">
                Provincia
              </Label>
              <p className="border p-2 rounded bg-gray-100">{local.province}</p>
            </div>
            <div>
              <Label htmlFor="district" className="mb-2">
                Distrito
              </Label>
              <p className="border p-2 rounded bg-gray-100">{local.district}</p>
            </div>
            <div>
              <Label htmlFor="reference" className="mb-2">
                Referencia
              </Label>
              <p className="border p-2 rounded bg-gray-100">
                {local.reference}
              </p>
            </div>
            <div>
              <Label htmlFor="capacity" className="mb-2">
                Capacidad
              </Label>
              <p className="border p-2 rounded bg-gray-100">{local.capacity}</p>
            </div>
          </div>
          
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col">
              <Label htmlFor="profileImageFile" className="mb-2 self-start">
                Imagen Local
              </Label>
              {local.image_url && false ? (
                <img
                  src={local.image_url}
                  alt="Vista previa del local"
                  className="w-full h-auto max-h-80 object-contain border rounded"
                />
              ) : (
                <div className="w-full h-64 border-2 border-dashed rounded-md flex items-center justify-center bg-gray-50">
                  <div className="text-center text-gray-400">
                    <UploadCloud size={48} className="mx-auto" />
                    <p>No hay imagen disponible</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
*/