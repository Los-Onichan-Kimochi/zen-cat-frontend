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
import { CommunityFormData } from '@/hooks/use-community-basic-form';

interface CommunityFormProps {
  register: UseFormRegister<CommunityFormData>;
  errors: FieldErrors<CommunityFormData>;
  imagePreview: string | null;
  handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isEditing?: boolean;
}

export function CommunityForm({
  register,
  errors,
  imagePreview,
  handleImageChange,
  isEditing=true,
}: CommunityFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos de la comunidad</CardTitle>
        <CardDescription>
          Complete la información para agregar una nueva comunidad.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Columna Izquierda */}
        <div className="grid grid-cols-1 gap-y-6">
          <div>
            <Label htmlFor="name" className="mb-2">
              Nombres
            </Label>
            <Input
              id="name"
              disabled={!isEditing}
              {...register('name')}
              placeholder="Ingrese el nombre de la comunidad"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="purpose" className="mb-2">
              Propósito
            </Label>
            <Textarea
              id="purpose"
              disabled={!isEditing}
              {...register('purpose')}
              placeholder="Ingrese un propósito"
            />
            {errors.purpose && (
              <p className="text-red-500 text-sm mt-1">
                {errors.purpose.message}
              </p>
            )}
          </div>
        </div>

        {/* Columna Derecha - Logo */}
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col">
            <Label htmlFor="profileImageFile" className="mb-2 self-start">
              Logo
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
                id="profileImageFile"
                type="file"
                disabled={!isEditing}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/png, image/jpeg, image/gif"
                {...register('profileImageFile')}
                onChange={handleImageChange}
              />
            </div>
            {errors.profileImageFile &&
              typeof errors.profileImageFile.message === 'string' && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.profileImageFile.message}
                </p>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
