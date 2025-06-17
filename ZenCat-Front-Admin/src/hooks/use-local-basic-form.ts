'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { handleImageFile } from '@/utils/handleImageFile';

export const localFormSchema = z.object({
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

export type LocalFormData = z.infer<typeof localFormSchema>;

interface UseLocalFormProps {
  defaultValues?: Partial<LocalFormData>;
}

export function useLocalForm(props?: UseLocalFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
  } = useForm<LocalFormData>({
    resolver: zodResolver(localFormSchema),
    defaultValues: {
      local_name: '',
      street_name: '',
      building_number: '',
      region: '',
      province: '',
      district: '',
      reference: '',
      capacity: 0,
      image_url: '',
      ...props?.defaultValues,
    },
  });
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleImageFile(event, setImagePreview, setImageFile);
  };
  useEffect(() => {
    const draftLocal = sessionStorage.getItem('draftLocal');
    if (draftLocal) {
      const values = JSON.parse(draftLocal);
      reset(values);
    }
  }, [reset]);

  return {
    register,
    handleSubmit,
    control,
    errors,
    watch,
    reset,
    imageFile,
    imagePreview,
    handleImageChange,
    setImagePreview,
    setImageFile,
  };
}
