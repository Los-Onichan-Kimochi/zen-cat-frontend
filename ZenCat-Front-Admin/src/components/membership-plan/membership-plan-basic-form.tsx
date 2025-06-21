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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { UploadCloud } from 'lucide-react';
import { UseFormRegister, FieldErrors, Controller, useFormContext, Control } from 'react-hook-form';
import { MembershipPlanFormData } from '@/hooks/use-membership-plan-basic-form';
import { MembershipPlanType } from '@/types/membership-plan'

interface MembershipPlanFormProps {
  //register: UseFormRegister<MembershipPlanFormData>;
  //errors: FieldErrors<MembershipPlanFormData>;
  //control: Control<MembershipPlanFormData>;
  mode?: 'add' | 'edit' | 'view';
  description?: string;
}

export function MembershipPlanForm({
  mode = 'add',
  description = "Complete la información para agregar un nuevo plan de membresia.",
}: MembershipPlanFormProps) {
  const { control, watch, getValues} = useFormContext();
  const isView = mode === 'view';
  const has_limit = watch('has_limit');
  const reservation_limit = getValues('reservation_limit');
  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos del plan de membresía</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Columna Izquierda */}
        <div className="grid grid-cols-1 gap-y-6">
          <FormField
                name="type"
                control={control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de plan</FormLabel>
                    <FormControl>
                      <Select
                        disabled={isView}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="has_limit"
                control={control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>¿Tiene límite?</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            value="true"
                            checked={field.value === 'true'}
                            onChange={field.onChange}
                            disabled={isView}
                          />
                          Sí
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            value="false"
                            checked={field.value === 'false'}
                            onChange={field.onChange}
                            disabled={isView}
                          />
                          No
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </div>
          
        {/* Columna Derecha - Logo */}
        <div className="flex flex-col space-y-6">
          <FormField
                name="fee"
                control={control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ingrese el precio"
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                        disabled={isView}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(has_limit === 'true' || (isView && reservation_limit !== null && reservation_limit !== undefined && reservation_limit !== '')) && (
                <FormField
                  name="reservation_limit"
                  control={control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Límite</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ingrese el límite de reservas"
                          value={field.value ?? ''}
                          onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                          disabled={isView}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
        </div>
      </CardContent>
    </Card>
  );
}
