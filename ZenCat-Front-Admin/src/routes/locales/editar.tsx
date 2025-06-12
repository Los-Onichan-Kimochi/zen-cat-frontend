'use client';
import HeaderDescriptor from '@/components/common/header-descriptor';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { sessionsApi } from '@/api/sessions/sessions';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { localsApi } from '@/api/locals/locals';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import rawRegiones from '@/types/ubigeo_peru_2016_departamentos.json';
import rawProvincias from '@/types/ubigeo_peru_2016_provincias.json';
import rawDistritos from '@/types/ubigeo_peru_2016_distritos.json';
import { Region, Provincia, Distrito, UpdateLocalPayload } from '@/types/local';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
const regiones: Region[] = rawRegiones;
const provincias: Provincia[] = rawProvincias;
const distritos: Distrito[] = rawDistritos;

const localFormSchema = z.object({
  local_name: z
    .string()
    .min(1, { message: 'El nombre del local es requerido.' }),
  street_name: z.string().min(1, { message: 'La calle es requerida.' }),
  building_number: z
    .string()
    .min(1, { message: 'El número de edificio es requerido.' }),
  region: z.string().min(1, { message: 'La región debe ser seleccionada.' }),
  province: z
    .string()
    .min(1, { message: 'La provincia debe ser seleccionada.' }),
  district: z
    .string()
    .min(1, { message: 'El distrito debe ser seleccionado.' }),
  reference: z.string().min(1, { message: 'La referencia es requerida.' }),
  capacity: z.number().min(2, {
    message: 'La capacidad debe ser un numero entero mayor o igual a 2.',
  }),
  image_url: z.any().optional(),
});

type LocalFormData = z.infer<typeof localFormSchema>;

export const Route = createFileRoute('/locales/editar')({
  //validateSearch: localSearchSchema,
  component: EditLocalComponent,
});

function EditLocalComponent() {
  const navigate = useNavigate();
  const id =
    typeof window !== 'undefined' ? localStorage.getItem('currentLocal') : null;
  if (!id) {
    navigate({ to: '/locales' });
  }
  const queryClient = useQueryClient();
  const {
    data: local,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['local', id],
    queryFn: () => localsApi.getLocalById(id!),
    enabled: !!id,
  });

  const form = useForm<LocalFormData>({
    resolver: zodResolver(localFormSchema),
    defaultValues: {
      local_name: local?.local_name || '',
      street_name: local?.street_name || '',
      building_number: local?.building_number || '',
      region: local?.region || '',
      province: local?.province || '',
      district: local?.district || '',
      reference: local?.reference || '',
      capacity: local?.capacity || 0,
      image_url: local?.image_url || null,
    },
  });
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
  } = form;
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedDistrito, setSelectedDistrito] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const department = regiones.find(
    (region) => region.name === form.watch('region'),
  );
  const provincia = provincias.find(
    (prov) => prov.name === form.watch('province'),
  );
  const provinciasFiltradas = provincias.filter(
    (prov) => prov.department_id === department?.id,
  );
  const distritosFiltrados = distritos.filter(
    (dist) =>
      dist.department_id === department?.id &&
      dist.province_id === provincia?.id,
  );
  const updateMutation = useMutation({
    mutationFn: async (
      data: UpdateLocalPayload & { imageFile?: File | null },
    ) => {
      let imageUrl = data.imageFile
        ? URL.createObjectURL(data.imageFile)
        : local?.image_url || 'https://via.placeholder.com/150';
      return localsApi.updateLocal(id!, {
        local_name: data.local_name,
        street_name: data.street_name,
        building_number: data.building_number,
        region: data.region,
        province: data.province,
        district: data.district,
        reference: data.reference,
        capacity: data.capacity,
        image_url: imageUrl,
      });
    },
    onSuccess: () => {
      toast.success('Local actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['local', id] });
      setIsEditing(false);
      navigate({ to: '/locales' });
    },
    onError: (error: any) => {
      toast.error('Error al actualizar la comunidad', {
        description: error.message || 'No se pudo actualizar.',
      });
    },
  });
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
      <HeaderDescriptor title="LOCALES" subtitle="Editar el local" />
      <Card>
        <CardHeader>
          <CardTitle>Campos del Local</CardTitle>
          <CardDescription>Detalles del local para editar</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className="space-y-2"
              onSubmit={form.handleSubmit((data) => {
                updateMutation.mutate({ ...data, imageFile });
              })}
            >
              <FormField
                name="local_name"
                control={control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Local</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="street_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la calle</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="building_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de edificio</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <FormField
                  control={control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione una región" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {regiones.map((region) => (
                            <SelectItem value={region.name}>
                              {region.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        disabled={!form.getValues('region')}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione una provincia" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {provinciasFiltradas.map((region) => (
                            <SelectItem value={region.name}>
                              {region.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        disabled={!form.getValues('province')}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un distrito" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {distritosFiltrados.map((region) => (
                            <SelectItem key={region.name} value={region.name}>
                              {region.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referencia</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidad</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
