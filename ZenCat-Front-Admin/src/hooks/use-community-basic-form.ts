'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { handleImageFile } from '@/utils/handleImageFile';
import { set } from 'date-fns';

export const communityFormSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es requerido.' }),
  purpose: z.string().min(1, { message: 'El propósito es requerido.' }),
  profileImageFile: z.any().optional(),
});

export type CommunityFormData = z.infer<typeof communityFormSchema>;

export function useCommunityForm() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
  } = useForm<CommunityFormData>({
    resolver: zodResolver(communityFormSchema),
    defaultValues: {
      name: '',
      purpose: '',
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleImageFile(event, setImagePreview, setImageFile);
  };

  useEffect(() => {
    const draftCommunity = sessionStorage.getItem('draftCommunity');
    if (draftCommunity) {
      const values = JSON.parse(draftCommunity);
      console.log('Resetean valores?');
      console.log('Values: ', values);
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
  };
}
