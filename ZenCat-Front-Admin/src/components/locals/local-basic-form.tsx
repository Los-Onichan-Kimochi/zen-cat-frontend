'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { UploadCloud } from 'lucide-react';
import {
  UseFormRegister,
  FieldErrors,
  Controller,
  Control,
} from 'react-hook-form';
import { LocalFormData } from '@/hooks/use-local-basic-form';
import { useEffect, useState } from 'react';
import { Region, Provincia, Distrito } from '@/types/local';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import rawRegiones from '@/types/ubigeo_peru_2016_departamentos.json';
import rawProvincias from '@/types/ubigeo_peru_2016_provincias.json';
import rawDistritos from '@/types/ubigeo_peru_2016_distritos.json';

const regiones: Region[] = rawRegiones;
const provincias: Provincia[] = rawProvincias;
const distritos: Distrito[] = rawDistritos;

interface LocalFormProps {
  register: UseFormRegister<LocalFormData>;
  errors: FieldErrors<LocalFormData>;
  control: Control<LocalFormData>;
  imagePreview: string | null;
  handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  //handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function LocalForm({
  register,
  errors,
  control,
  imagePreview,
  handleImageChange,
  //handleSubmit,
}: LocalFormProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedProvincia, setSelectedProvincia] = useState<string | null>(
    null,
  );
  const [selectedDistrito, setSelectedDistrito] = useState<string | null>(null);
  const provinciasFiltradas = provincias.filter(
    (prov) => prov.department_id === selectedRegion,
  );
  const distritosFiltrados = distritos.filter(
    (dist) =>
      dist.department_id === selectedRegion &&
      dist.province_id === selectedProvincia,
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos del local</CardTitle>
        <CardDescription>
          Complete la información para agregar un nuevo local.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Columna Izquierda */}
        <div className="grid grid-cols-1 gap-y-6">
          <div>
            <Label htmlFor="local_name" className="mb-2">
              Nombre del local
            </Label>
            <Input
              id="local_name"
              {...register('local_name')}
              placeholder="Ingrese el nombre del local"
            />
            {errors.local_name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.local_name.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="street_name" className="mb-2">
              Nombre de la calle
            </Label>
            <Input
              id="street_name"
              {...register('street_name')}
              placeholder="Ingrese el nombre de la calle"
            />
            {errors.street_name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.street_name.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="building_number" className="mb-2">
              Número de edificio
            </Label>
            <Input
              id="building_number"
              {...register('building_number')}
              placeholder="Ingrese el número de edificio"
            />
            {errors.building_number && (
              <p className="text-red-500 text-sm mt-1">
                {errors.building_number.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="region" className="mb-2">
              Región
            </Label>
            <Controller
              name="region"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    const selected = regiones.find((r) => r.id === value);
                    field.onChange(selected?.name);
                    setSelectedRegion(value);
                    setSelectedProvincia('');
                    setSelectedDistrito('');
                  }}
                  value={regiones.find((r) => r.name === field.value)?.id ?? ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una región" />
                  </SelectTrigger>
                  <SelectContent>
                    {regiones.map((region) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.region && (
              <p className="text-red-500 text-sm mt-1">
                {errors.region.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="province" className="mb-2">
              Provincia
            </Label>
            <Controller
              name="province"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    const selected = provinciasFiltradas.find(
                      (p) => p.id === value,
                    );
                    field.onChange(selected?.name);
                    setSelectedProvincia(value);
                    setSelectedDistrito('');
                  }}
                  value={
                    provinciasFiltradas.find((p) => p.name === field.value)
                      ?.id ?? ''
                  }
                  disabled={!selectedRegion}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una provincia" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinciasFiltradas.map((province) => (
                      <SelectItem key={province.id} value={province.id}>
                        {province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.province && (
              <p className="text-red-500 text-sm mt-1">
                {errors.province.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="district" className="mb-2">
              Distrito
            </Label>
            <Controller
              name="district"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    const selected = distritosFiltrados.find(
                      (d) => d.id === value,
                    );
                    field.onChange(selected?.name); // ← guardar el name
                  }}
                  value={
                    distritosFiltrados.find((d) => d.name === field.value)
                      ?.id ?? ''
                  }
                  disabled={!selectedProvincia}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un distrito" />
                  </SelectTrigger>
                  <SelectContent>
                    {distritosFiltrados.map((district) => (
                      <SelectItem key={district.id} value={district.id}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.district && (
              <p className="text-red-500 text-sm mt-1">
                {errors.district.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="reference" className="mb-2">
              Referencia
            </Label>
            <Input
              id="reference"
              {...register('reference')}
              placeholder="Ingrese la referencia"
            />
            {errors.reference && (
              <p className="text-red-500 text-sm mt-1">
                {errors.reference.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="capacity" className="mb-2">
              Capacidad
            </Label>
            <Input
              id="capacity"
              type="number"
              {...register('capacity', { valueAsNumber: true })}
              placeholder="Ingrese la capacidad"
            />
            {errors.capacity && (
              <p className="text-red-500 text-sm mt-1">
                {errors.capacity.message}
              </p>
            )}
          </div>
        </div>
        {/* Columna Derecha */}
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col">
            <Label htmlFor="profileImageFile" className="mb-2 self-start">
              Imagen Local
            </Label>
            <div className="w-full h-100 border-2 border-dashed rounded-md flex items-center justify-center bg-gray-50 mb-4 relative">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  className="object-contain h-full w-full rounded-md"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <UploadCloud size={48} className="mx-auto" />
                  <p>Arrastra o selecciona un archivo</p>
                  <p className="text-xs">PNG, JPG, GIF hasta 10MB</p>
                </div>
              )}
              <Input
                id="image_url"
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/png, image/jpeg, image/gif"
                {...register('image_url')}
                onChange={handleImageChange}
              />
            </div>
            {errors.image_url &&
              typeof errors.image_url.message === 'string' && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.image_url.message}
                </p>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
