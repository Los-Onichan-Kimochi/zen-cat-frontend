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
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { LocalFormData } from '@/hooks/use-local-basic-form';

interface LocalFormProps {
  register: UseFormRegister<LocalFormData>;
  errors: FieldErrors<LocalFormData>;
  imagePreview: string | null;
  handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  //handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function LocalForm({
    register,
    errors,
    imagePreview,
    handleImageChange,
    //handleSubmit,
}: LocalFormProps){
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
                    <Input
                      id="region"
                      {...register('region')}
                      placeholder="Ingrese la región"
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
                    <Input
                      id="province"
                      {...register('province')}
                      placeholder="Ingrese la provincia"
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
                    <Input
                       id="district"
                       {...register('district')}
                       placeholder="Ingrese el distrito"
                    />
                    {errors.district && (
                        <p className="text-red-500 text-sm mt-1">
                         {errors.district.message}
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
    )
}