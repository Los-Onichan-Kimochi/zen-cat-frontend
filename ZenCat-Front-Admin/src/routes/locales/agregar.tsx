'use client';

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { LocalFormData, useLocalForm } from '@/hooks/use-local-basic-form';
import { LocalForm } from '@/components/locals/local-basic-form';

import { localsApi } from '@/api/locals/locals';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import HeaderDescriptor from '@/components/common/header-descriptor';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

import { Local, CreateLocalPayload } from '@/types/local';

import { Plus, ChevronLeft } from 'lucide-react';
import { Form, FormProvider, useForm } from 'react-hook-form';
import '../../index.css';
import { fileToBase64 } from '@/utils/imageUtils';

export const Route = createFileRoute('/locales/agregar')({
  component: AddLocalPageComponent,
});

function AddLocalPageComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { form, imageFile, imagePreview, handleImageChange } = useLocalForm();
  //const form = useForm<LocalFormData>({ ... });
  const createLocalMutation = useMutation({
    mutationFn: async (data: CreateLocalPayload) => localsApi.createLocal(data),
    onSuccess: () => {
      toast.success('Local Creado', {
        description: 'El local ha sido agregado exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['locals'] });
      navigate({ to: '/locales' });
    },
    onError: (error) => {
      toast.error('Error al crear local', {
        description: error.message || 'No se pudo crear el local.',
      });
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const payload: CreateLocalPayload = {
        ...data,
        image_url: data.image_url || '',
      };

      if (imageFile) {
        // Asignar el nombre del archivo a image_url
        payload.image_url = imageFile.name;
        // Convertir el archivo a base64 y asignarlo a image_bytes
        const base64Image = await fileToBase64(imageFile);
        payload.image_bytes = base64Image;
      }

      await createLocalMutation.mutateAsync(payload);

      toast.success('Local creado correctamente');
      queryClient.invalidateQueries({ queryKey: ['locals'] });
      navigate({ to: '/locales' });
    } catch (err: any) {
      toast.error('Error al crear local', { description: err.message });
    }
  };
  return (
    <div className="p-2 md:p-6 h-full flex flex-col font-montserrat">
      <HeaderDescriptor title="LOCALES" subtitle="AGREGAR LOCAL" />
      <div className="mb-4">
        <Button
          variant="outline"
          type="button"
          onClick={() => navigate({ to: '/locales' })}
        >
          <ChevronLeft className="w-5 h-5" />
          Volver
        </Button>
      </div>
      <Card className="mt-6 flex-grow">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <LocalForm
              imagePreview={imagePreview}
              handleImageChange={handleImageChange}
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
              <Button
                type="submit"
                disabled={createLocalMutation.isPending}
                className="h-10 w-30 bg-black text-white text-base hover:bg-gray-800"
              >
                Guardar
              </Button>
            </div>
          </form>
        </FormProvider>
      </Card>
    </div>
  );
}
