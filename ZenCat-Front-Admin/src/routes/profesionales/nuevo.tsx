'use client';

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { professionalsApi } from '@/api/professionals/professionals';
import { CreateProfessionalPayload, ProfessionalType, ProfessionalSpecialty } from '@/types/professional';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import HeaderDescriptor from '@/components/common/header-descriptor';
import { toast } from "sonner";
import { useState } from 'react';
import { Loader2, UploadCloud } from 'lucide-react';
import '../../index.css';

export const Route = createFileRoute('/profesionales/nuevo')({
  component: AddProfessionalPageComponent,
});

const professionalFormSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido." }),
  first_last_name: z.string().min(1, { message: "El primer apellido es requerido." }),
  second_last_name: z.string().optional(),
  type: z.nativeEnum(ProfessionalType, { message: "Seleccione un tipo válido." }),
  specialty: z.nativeEnum(ProfessionalSpecialty, { message: "Seleccione una especialidad válida." }),
  email: z.string().email({ message: "Ingrese un correo electrónico válido." }),
  phone_number: z.string().min(7, { message: "El número de celular debe tener al menos 7 dígitos." }),
  profileImageFile: z.any().optional(),
});

type ProfessionalFormData = z.infer<typeof professionalFormSchema>;

function AddProfessionalPageComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { register, handleSubmit, control, formState: { errors } } = useForm<ProfessionalFormData>({
    resolver: zodResolver(professionalFormSchema),
    defaultValues: {
      name: '',
      first_last_name: '',
      second_last_name: '',
      email: '',
      phone_number: '',
    },
  });

  const createProfessionalMutation = useMutation({
    mutationFn: async (data: CreateProfessionalPayload) => professionalsApi.createProfessional(data),
    onSuccess: () => {
      toast.success("Profesional Creado", { description: "El profesional ha sido agregado exitosamente." });
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      navigate({ to: '/profesionales' });
    },
    onError: (error) => {
      toast.error("Error al crear profesional", { description: error.message || "No se pudo crear el profesional." });
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

  const onSubmit = async (data: ProfessionalFormData) => {
    let imageUrl = 'https://via.placeholder.com/150';
    if (imageFile) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.info("Imagen (simulada)", { description: "Subida de imagen simulada completada." });
    }

    const payload: CreateProfessionalPayload = {
      name: data.name,
      first_last_name: data.first_last_name,
      second_last_name: data.second_last_name || '',
      type: data.type,
      specialty: data.specialty,
      email: data.email,
      phone_number: data.phone_number,
      image_url: imageUrl,
    };
    createProfessionalMutation.mutate(payload);
  };

  return (
    <div className="p-2 md:p-6 h-full flex flex-col font-montserrat">
      <HeaderDescriptor title="PROFESIONALES" subtitle="AGREGAR PROFESIONAL" />
      <Card className="mt-6 flex-grow">
        <CardHeader>
          <CardTitle>Datos del profesional</CardTitle>
          <CardDescription>Complete la información para agregar un nuevo profesional.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Columna Izquierda para campos */}
            <div className="grid grid-cols-1 gap-y-6">
              <div>
                <Label htmlFor="name" className="mb-2">Nombres</Label>
                <Input id="name" {...register("name")} placeholder="Ingrese los nombres del profesional" />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="first_last_name" className="mb-2">Primer apellido</Label>
                <Input id="first_last_name" {...register("first_last_name")} placeholder="Ingrese el primer apellido" />
                {errors.first_last_name && <p className="text-red-500 text-sm mt-1">{errors.first_last_name.message}</p>}
              </div>
              <div>
                <Label htmlFor="second_last_name" className="mb-2">Segundo apellido (Opcional)</Label>
                <Input id="second_last_name" {...register("second_last_name")} placeholder="Ingrese el segundo apellido" />
              </div>
              <div>
                <Label htmlFor="type" className="mb-2">Tipo de profesional</Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Seleccione un tipo" /></SelectTrigger>
                      <SelectContent>
                        {Object.values(ProfessionalType).map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}
              </div>
              <div>
                <Label htmlFor="specialty" className="mb-2">Especialidad</Label>
                <Controller
                  name="specialty"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Seleccione una especialidad" /></SelectTrigger>
                      <SelectContent>
                        {Object.values(ProfessionalSpecialty).map((spec) => (
                          <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.specialty && <p className="text-red-500 text-sm mt-1">{errors.specialty.message}</p>}
              </div>
              <div>
                <Label htmlFor="email" className="mb-2">Correo electrónico</Label>
                <Input id="email" type="email" {...register("email")} placeholder="Ingrese el correo electrónico" />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="phone_number" className="mb-2">Número de celular</Label>
                <Input
                  id="phone_number"
                  type="text"
                  inputMode="numeric"          // teclado numérico en celus
                  placeholder="Ingrese el número de celular"
                  {...register("phone_number", {
                    onChange: e => {
                      // Sustituye todo lo que no sea dígito
                      e.target.value = e.target.value.replace(/[^0-9]/g, '');
                    }
                  })}
                />
                {errors.phone_number && <p className="text-red-500 text-sm mt-1">{errors.phone_number.message}</p>}
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
                      <UploadCloud size={48} className="mx-auto" />
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
                <Button variant="outline" type="button" onClick={() => navigate({ to: '/profesionales' })} className="w-full sm:w-auto">Cancelar</Button>
                <Button type="submit" disabled={createProfessionalMutation.isPending} className="w-full sm:w-auto">
                  {createProfessionalMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar
                </Button>
              </div>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
} 