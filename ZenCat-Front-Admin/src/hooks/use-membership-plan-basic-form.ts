'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';

export const membershipPlanFormSchema = z.object({
  type: z.string().min(1, { message: 'El tipo de plan es obligatorio.' }),
  fee: z.number().min(10, { message: 'El precio debe ser un número mayor o igual a 10' }),
  has_limit: z.string({
    required_error: 'Debe seleccionar si tiene límite o no.',
  }),
  reservation_limit: z.number().nullable().optional(), 
}).superRefine((data, ctx) => {
  if (data.has_limit === 'true' && (data.reservation_limit === null || data.reservation_limit === undefined)) {
    ctx.addIssue({
      path: ['reservation_limit'],
      code: z.ZodIssueCode.custom,
      message: 'Debe especificar un límite de reservas.',
    });
  }

  if (data.has_limit === 'false' && data.reservation_limit != null) {
    ctx.addIssue({
      path: ['reservation_limit'],
      code: z.ZodIssueCode.custom,
      message: 'No debe establecer un límite si no se ha activado la opción de límite.',
    });
  }
})

export type MembershipPlanFormData = z.infer<typeof membershipPlanFormSchema>;
interface UserMembershipPlanFormProps {
  defaultValues?: Partial<MembershipPlanFormData>;
}
export function useMembershipPlanForm(props?: UserMembershipPlanFormProps) {
  /*
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
  } = useForm<MembershipPlanFormData>({
    resolver: zodResolver(membershipPlanFormSchema),
    defaultValues: {
      type: '',
    },
  });
  */
  const form = useForm<MembershipPlanFormData>({
    resolver: zodResolver(membershipPlanFormSchema),
    defaultValues: {
      type: '',
      fee: 10,
      has_limit: 'false',
      reservation_limit: null,
      ...props?.defaultValues, // Permite pasar valores por defecto desde el componente
    },
  });
  useEffect(() => {
    const draftMembershipPlan = sessionStorage.getItem('draftMembershipPlan');
    if (draftMembershipPlan) {
      const values = JSON.parse(draftMembershipPlan);
      form.reset(values);
    }
  }, [form]);

  return {
    form,
  };
}
