'use client';

import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/components/common/data-table/data-table';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import HeaderDescriptor from '@/components/common/header-descriptor';
import { toast } from "sonner";
import { useState } from 'react';
import { Loader2, UploadCloud,  Plus, Upload} from 'lucide-react';
import '../../index.css';
import { Professional } from '@/types/professional';
import { CreateServicePayload } from '@/types/service';
import { servicesApi } from '@/api/services/services';
import { serviceProfessionalApi } from '@/api/services/service_professionals';

import { 
  ColumnDef, 
  Row, 
  Column, 
  Table, 
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  PaginationState,
} from '@tanstack/react-table';

import { useMatch } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useRouterState } from '@tanstack/react-router';

export const Route = createFileRoute('/servicios/servicio-nuevo')({
  component: AddServicePageComponent,
  
});


export const serviceFormSchema = z.object({
  name: z.string().min(1, { message: "El nombre del servicio es requerido." }),
  is_virtual: z.string({ required_error: "Debe seleccionar si el servicio es virtual o no." }),
  description: z.string().min(1, { message: "La descripción es requerida." }),
  image_url: z.any().optional(),
});

type ServiceFormData = z.infer<typeof serviceFormSchema>;

function AddServicePageComponent() {
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { register, handleSubmit, control, formState: { errors }, watch, reset } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: '',
      is_virtual: '',
      description: '',
    },
  });
  const createServiceMutation = useMutation({
    mutationFn: async (data: CreateServicePayload) => servicesApi.createService(data),
    onSuccess: () => {
      toast.success("Servicio Creado", { description: "El servicio ha sido agregado exitosamente." });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      navigate({ to: '/servicios' });
    },
    onError: (error) => {
      toast.error("Error al crear servicio", { description: error.message || "No se pudo crear el servicio." });
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

  const isVirtual = watch("is_virtual");
  const match = useMatch({ from: '/servicios/servicio-nuevo' });

  const locationState = useRouterState({ select: (s) => s.location.state }) as {
    profesionalesSeleccionados?: any[];
    lugaresSeleccionados?: any[];
  } | null;

  const lugaresIniciales = locationState?.lugaresSeleccionados ?? [];
  const profesionalesIniciales = locationState?.profesionalesSeleccionados ?? [];

  const [lugaresSeleccionados, setLugaresSeleccionados] = useState(lugaresIniciales);
  const [profesionalesSeleccionados, setProfesionalesSeleccionados] = useState(profesionalesIniciales);

  useEffect(() => {
    const draft = localStorage.getItem('draftService');
      if (draft) {
        const values = JSON.parse(draft);
        reset(values); 
        localStorage.removeItem('draftService');
      }

    const storedProfesionales = localStorage.getItem('profesionalesSeleccionados');
      if (storedProfesionales) {
        try {
          console.log('Cargado desde localStorage:', JSON.parse(storedProfesionales));
          setProfesionalesSeleccionados(JSON.parse(storedProfesionales));
          localStorage.removeItem('profesionalesSeleccionados'); // Limpia si solo quieres usarlo 1 vez
        } catch (error) {
          console.error('Error al parsear profesionales guardados', error);
        }
      }
  }, []);

  

  const onSubmit = async (data: ServiceFormData) => {
    let imageUrl = 'https://via.placeholder.com/150';
    if (imageFile) {
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      toast.info("Imagen (simulada)", { description: "Subida de imagen simulada completada." });
    }

    const payload: CreateServicePayload = {
      name: data.name,
      is_virtual: data.is_virtual === 'true',
      description: data.description,
      image_url: imageUrl, 
    };


    try {
    const newService = await servicesApi.createService(payload);

    // 2. Bulk create de ServiceProfessional
      if (profesionalesSeleccionados.length > 0) {
        const bulkPayload = {
          service_professionals: profesionalesSeleccionados.map((prof) => ({
            service_id: newService.id,
            professional_id: prof.id,
          })),
        };
        await serviceProfessionalApi.bulkCreateServiceProfessionals(bulkPayload);
      }

      toast.success("Servicio y profesionales asociados creados correctamente.");
      queryClient.invalidateQueries({ queryKey: ['services'] });
      navigate({ to: '/servicios' });
    } catch (error: any) {
      toast.error("Error al crear servicio o asociar profesionales", { description: error.message });
    }

  };


  const columnsProfesionales = [
    {
      accessorKey: 'name',
      header: 'Nombre',
    },
    {
      accessorKey: 'first_last_name',
      header: 'Primer Apellido',
    },
    {
      accessorKey: 'second_last_name',
      header: 'Segundo Apellido',
    },
    {
      accessorKey: 'specialty',
      header: 'Especialidad',
    },
    {
      accessorKey: 'email',
      header: 'Correo Electrónico',
    },
    {
      accessorKey: 'phone_number',
      header: 'Número de Celular',
    },
  ];

  const columnsLocales = [
  {
      accessorKey: 'name',
      header: 'Nombre',
    },
    {
      accessorKey: 'street',
      header: 'Calle',
    },
    {
      accessorKey: 'number',
      header: 'Número',
    },

    
  ];

  const profesionalesTable = useReactTable({
    data: profesionalesSeleccionados,
    columns: columnsProfesionales,
    getCoreRowModel: getCoreRowModel(),
  });
  
  const localesTable = useReactTable({
    data: lugaresSeleccionados,
    columns: columnsLocales,
    getCoreRowModel: getCoreRowModel(),
  });


  return (
    <div className="p-2 md:p-6 h-full flex flex-col font-montserrat">
      <HeaderDescriptor title="SERVICIOS" subtitle="AGREGAR SERVICIO" />
      <Card className="mt-6 flex-grow">
        <CardHeader>
          <CardTitle>Datos del Servicio</CardTitle>
          <CardDescription>Complete la información para agregar un nuevo servicio.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Columna Izquierda para campos */}
            <div className="grid grid-cols-1 gap-y-6">
              <div>
                <Label htmlFor="name" className="mb-2">Nombre</Label>
                <Input id="name" {...register("name")} placeholder="Ingrese el nombre del servicio" />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <div>
                  <Label className="mb-2 block">¿Es virtual?</Label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="true"
                        {...register("is_virtual", { required: "Debe seleccionar una opción." })}
                      />
                      Sí
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="false"
                        {...register("is_virtual", { required: "Debe seleccionar una opción." })}
                      />
                      No
                    </label>
                  </div>
                  {errors.is_virtual && (
                    <p className="text-red-500 text-sm mt-1">{errors.is_virtual.message}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="description" className="mb-2">Descripción</Label>
                <Input id="second_last_name" {...register("description")} placeholder="Ingrese el segundo apellido" />
              </div>
              
              
            </div>

            {/* Columna Derecha para foto de perfil y botones */}
            <div className="flex flex-col space-y-6">
              <div className="flex flex-col">
                <Label htmlFor="profileImageFile" className="mb-2 self-start">Foto de perfil</Label>
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
                    {...register("image_url")} 
                    onChange={handleImageChange} 
                  />
                </div>
                {errors.image_url && typeof errors.image_url.message === 'string' && (
                  <p className="text-red-500 text-sm mt-1">{errors.image_url.message}</p>
                )}
              </div>
              
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 sm:justify-end pt-4">
                <Button variant="outline" type="button" onClick={() => navigate({ to: '/servicios' })} className="w-full sm:w-auto">Cancelar</Button>
                <Button type="submit" disabled={createServiceMutation.isPending} className="w-full sm:w-auto">
                  {createServiceMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar
                </Button>
              </div>
            </div>
          </CardContent>
        </form>
      </Card>
      {isVirtual === "true" && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Profesionales Asociados</CardTitle>
            <CardDescription>Listado de profesionales disponibles para este servicio virtual.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end space-x-2 py-4">
              <Button
                onClick={() => {
                  
                  const data = watch(); // obtiene valores actuales del form
                  localStorage.setItem('draftService', JSON.stringify(data));
                  localStorage.setItem('profesionalesSeleccionados', JSON.stringify(profesionalesSeleccionados));
                  navigate({ to: '/servicios/agregar-profesionales' });
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Agregar Profesional
              </Button>
            </div>
            <DataTable
              table={profesionalesTable}
              columns={columnsProfesionales}
            />
          </CardContent>
        </Card>
      )}

      {isVirtual === "false" && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Locales Disponibles</CardTitle>
            <CardDescription>Selecciona los locales donde se brindará este servicio presencial.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end space-x-2 py-4">
              <Button
                onClick={() =>
                  navigate({
                    to: '/servicios/agregar-locales',
                    state: { lugaresSeleccionados } as any
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" /> Agregar Lugar
              </Button>
            </div>
            <DataTable
              table={localesTable}
              columns={columnsLocales}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
} 