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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { UploadCloud } from 'lucide-react';
import { UseFormRegister, FieldErrors, Controller, Control } from 'react-hook-form';
import { MembershipPlanFormData } from '@/hooks/use-membership-plan-basic-form';
import { MembershipPlanType } from '@/types/membership-plan'

interface MembershipPlanFormProps {
  register: UseFormRegister<MembershipPlanFormData>;
  errors: FieldErrors<MembershipPlanFormData>;
  control: Control<MembershipPlanFormData>;
  has_limit: string,
  isEditing?: boolean;
}

export function MembershipPlanForm({
  register,
  errors,
  control,
  has_limit,
  isEditing=true,
}: MembershipPlanFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos del plan de membresía</CardTitle>
        <CardDescription>
          Complete la información para agregar un nuevo plan de membresía.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Columna Izquierda */}
        <div className="grid grid-cols-1 gap-y-6">
          <div>
            <Label htmlFor="name" className="mb-2">
              Tipo de plan
            </Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccione un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(MembershipPlanType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && (
              <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
            )}
          </div>
          <div>
            <Label className="mb-2 block">¿Tiene límite?</Label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="true"
                  {...register('has_limit', {
                    required: 'Debe seleccionar una opción.',
                  })}
                />
                Sí
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="false"
                  {...register('has_limit', {
                    required: 'Debe seleccionar una opción.',
                  })}
                />
                No
              </label>
            </div>
            {errors.has_limit && (
              <p className="text-red-500 text-sm mt-1">
                {errors.has_limit.message}
              </p>
            )}
          </div>
        </div>

        {/* Columna Derecha - Logo */}
        <div className="flex flex-col space-y-6">
          <div>
            <Label htmlFor="fee" className="mb-2">
              Precio
            </Label>
            <Input
              id="fee"
              type="number"
              disabled={!isEditing}
              {...register('fee', { valueAsNumber: true })}
              placeholder="Ingrese el precio"
            />
            {errors.fee && (
              <p className="text-red-500 text-sm mt-1">
                {errors.fee.message}
              </p>
            )}
          </div>
          { has_limit === 'true' && (
            <div>
              <Label htmlFor="reservation_limit" className="mb-2">
                Límite
              </Label>
              <Input
                id="reservation_limit"
                type="number"
                disabled={!isEditing}
                {...register('reservation_limit', { valueAsNumber: true })}
                placeholder="Ingrese el límite de reservas"
              />
              {errors.reservation_limit && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.reservation_limit.message}
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
