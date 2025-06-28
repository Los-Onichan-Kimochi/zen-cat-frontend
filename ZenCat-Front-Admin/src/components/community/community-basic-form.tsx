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
import { ImageUpload } from '@/components/common/image-upload';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { CommunityFormData } from '@/hooks/use-community-basic-form';

interface CommunityFormProps {
  register: UseFormRegister<CommunityFormData>;
  errors: FieldErrors<CommunityFormData>;
  imagePreview: string | null;
  handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove?: () => void;
  isEditing?: boolean;
}

export function CommunityForm({
  register,
  errors,
  imagePreview,
  handleImageChange,
  onImageRemove,
  isEditing = true,
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
          <ImageUpload
            imagePreview={imagePreview}
            onImageChange={handleImageChange}
            label="Logo"
            disabled={!isEditing}
            inputProps={{ ...register('profileImageFile') }}
            errorMessage={
              errors.profileImageFile &&
              typeof errors.profileImageFile.message === 'string'
                ? errors.profileImageFile.message
                : undefined
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
