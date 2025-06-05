'use client';

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { localsApi } from '@/api/locals/locals';
import { CreateLocalPayload } from '@/types/local';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import HeaderDescriptor from '@/components/common/header-descriptor';
import { toast } from "sonner";
import { useState } from 'react';
import { Loader2, UploadCloud } from 'lucide-react';
import regions from '@/types/ubigeo_peru_2016_departamentos.json';
import provinces from '@/types/ubigeo_peru_2016_provincias.json';
import districts from '@/types/ubigeo_peru_2016_distritos.json';
import '../../index.css';

export const Route = createFileRoute('/locales/agregar')({
  component: AddLocalPageComponent,
})

const localFromSchema = z.object({
  local_name: z.string().min(1, { message: "El nombre del local es requerido." }),
  street_name: z.string().min(1, { message: "La calle es requerida." }),
  building_number: z.string().min(1, { message: "El número de edificio es requerido." }),
  region: z.string().min(1, { message: "La región debe ser seleccionada." }),
  province: z.string().min(1, { message: "La provincia debe ser seleccionada." }),
  district: z.string().min(1, { message: "El distrito debe ser seleccionado." }),
  reference: z.string().min(1, { message: "La referencia es requerida." }),
  capacity: z.number().min(2, { message: "La capacidad debe ser un numero entero mayor o igual a 2." }),
  image_url: z.any().optional(),
});

type LocalFormData = z.infer<typeof localFromSchema>;

function AddLocalPageComponent(){
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { register, handleSubmit, control, formState: { errors } } = useForm<LocalFormData>({
    resolver: zodResolver(localFromSchema),
    defaultValues: {
        local_name:'',
        street_name: '',
        building_number: '',
        district: '',
        province: '',
        region: '',
        reference: '',
        capacity: 0,
        image_url: '',
    },
  });

    const createLocalMutation = useMutation({
      mutationFn: async (data: CreateLocalPayload) => localsApi.createLocal(data),
      onSuccess: () => {
        toast.success("Local Creado", { description: "El local ha sido agregado exitosamente." });
        queryClient.invalidateQueries({ queryKey: ['locals'] });
        navigate({ to: '/locales' });
      },
      onError: (error) => {
        toast.error("Error al crear local", { description: error.message || "No se pudo crear el local." });
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
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const filteredProvinces = provinces.filter(
    (province) => province.department_id === selectedRegion
  );

  const filteredDistricts = districts.filter(
    (district) => district.province_id === selectedProvince
  );
    const onSubmit = async (data: LocalFormData) => {
      let imageUrl = 'https://via.placeholder.com/150';
      if (imageFile) {
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        toast.info("Imagen (simulada)", { description: "Subida de imagen simulada completada." });
      }
  
      const payload: CreateLocalPayload = {
        local_name: data.local_name,
        street_name: data.street_name,
        building_number: data.building_number,
        district: data.district,
        province: data.province,
        region: data.region,
        reference: data.reference,
        capacity: data.capacity,
        image_url: data.image_url,
      };
      createLocalMutation.mutate(payload);
    };
    return (
        <div className="p-2 md:p-6 h-full flex flex-col font-montserrat">
          <HeaderDescriptor title="LOCALES" subtitle="AGREGAR LOCAL" />
          <Card className="mt-6 flex-grow">
            <CardHeader>
              <CardTitle>Datos del local</CardTitle>
              <CardDescription>Complete la información para agregar un nuevo local.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Columna Izquierda para campos */}
                <div className="grid grid-cols-1 gap-y-6">
                  <div>
                    <Label htmlFor="local_name" className="mb-2">Nombre del Local</Label>
                    <Input id="local_name" {...register("local_name")} placeholder="Ingrese el nombre del local" />
                    {errors.local_name && <p className="text-red-500 text-sm mt-1">{errors.local_name.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="street_name" className="mb-2">Nombre de la Calle</Label>
                    <Input id="street_name" {...register("street_name")} placeholder="Ingrese de la calle o avenida" />
                    {errors.street_name && <p className="text-red-500 text-sm mt-1">{errors.street_name.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="building_number" className="mb-2">Numero del edificio</Label>
                    <Input id="building_number" {...register("building_number")} placeholder="Ingrese el numero del edificio" />
                    {errors.building_number && <p className="text-red-500 text-sm mt-1">{errors.building_number.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="region" className="mb-2">Región</Label>
                    <Controller
                      name="region"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={(value) => {
                            const selected = regions.find((r) => r.id === value);
                            field.onChange(selected?.name);
                            setSelectedRegion(value);
                            setSelectedProvince('');
                            setSelectedDistrict('');
                          }}
                          value={regions.find(r => r.name === field.value)?.id ?? ''}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione una región" />
                          </SelectTrigger>
                          <SelectContent>
                            {regions.map((region) => (
                              <SelectItem key={region.id} value={region.id}>
                                {region.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="province" className="mb-2">Provincia</Label>
                    <Controller
                      name="province"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={(value) => {
                            const selected = filteredProvinces.find((p) => p.id === value);
                            field.onChange(selected?.name);
                            setSelectedProvince(value);
                            setSelectedDistrict('');
                          }}
                          value={filteredProvinces.find(p => p.name === field.value)?.id ?? ''}
                          disabled={!selectedRegion}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione una provincia" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredProvinces.map((province) => (
                              <SelectItem key={province.id} value={province.id}>
                                {province.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.province && <p className="text-red-500 text-sm mt-1">{errors.province.message}</p>}
                  </div>
                    
                  <div>
                    <Label htmlFor="district" className="mb-2">Distrito</Label>
                    <Controller
                      name="district"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={(value) => {
                            const selected = filteredDistricts.find((d) => d.id === value);
                            field.onChange(selected?.name); // ← guardar el name
                          }}
                          value={filteredDistricts.find(d => d.name === field.value)?.id ?? ''}
                          disabled={!selectedProvince}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un distrito" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredDistricts.map((district) => (
                              <SelectItem key={district.id} value={district.id}>
                                {district.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="reference" className="mb-2">Referencia</Label>
                    <Input id="reference" type="tel" {...register("reference")} placeholder="Ingrese la referencia" />
                    {errors.reference && <p className="text-red-500 text-sm mt-1">{errors.reference.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="capacity" className="mb-2">Capacidad</Label>
                    <Input id="capacity" type="number" {...register("capacity", { valueAsNumber: true })} placeholder="Ingrese la capacidad"/>
                    {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity.message}</p>}
                  </div>
                </div>
    
                {/* Columna Derecha para foto de perfil y botones */}
                <div className="flex flex-col space-y-40">
                  <div className="flex flex-col">
                    <Label htmlFor="profileImageFile" className="mb-2 self-start">Foto del local</Label>
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
                        id="image_url" 
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
                    <Button variant="outline" type="button" onClick={() => navigate({ to: '/locales' })} className="w-full sm:w-auto h-12 text-lg px-6">Cancelar</Button>
                    <Button type="submit" disabled={createLocalMutation.isPending} className="w-full sm:w-auto h-12 text-lg px-6">
                      {createLocalMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin " />} Guardar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      );
}
