'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { handleImageFileWithBytes } from '@/utils/handleImageFile';

export const communityFormSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es requerido.' }),
  purpose: z.string().min(1, { message: 'El propósito es requerido.' }),
  profileImageFile: z.any().optional(),
});

export type CommunityFormData = z.infer<typeof communityFormSchema>;

export function useCommunityForm() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBytes, setImageBytes] = useState<number[] | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset: formReset,
  } = useForm<CommunityFormData>({
    resolver: zodResolver(communityFormSchema),
    defaultValues: {
      name: '',
      purpose: '',
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleImageFileWithBytes(
      event,
      setImagePreview,
      setImageFile,
      setImageBytes,
    );
  };

  useEffect(() => {
    const draftCommunity = sessionStorage.getItem('draftCommunity');
    if (draftCommunity) {
      const values = JSON.parse(draftCommunity);
      reset(values);
    }
  }, []);

  const reset = (data?: Partial<CommunityFormData>) => {
    formReset(data);
    if (!data) {
      setImageFile(null);
      setImagePreview(null);
      setImageBytes(null);
    }
  };

  return {
    register,
    handleSubmit,
    control,
    errors,
    watch,
    imageFile,
    imagePreview,
    imageBytes,
    setImageFile,
    setImagePreview,
    setImageBytes,
    handleImageChange,
    reset,
  };
}
