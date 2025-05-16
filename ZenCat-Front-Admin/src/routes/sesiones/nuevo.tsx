'use client';

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { sessionsApi } from '@/api/sessions/sessions';
import { servicesApi } from '@/api/services/services';
import { professionalsApi } from '@/api/professionals/professionals';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import HeaderDescriptor from '@/components/common/header-descriptor';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/sesiones/nuevo')({
  component: NuevaSesionPage,
});

const sessionSchema = z.object({
  service_id: z.string().min(1, 'Servicio requerido'),
  professional_id: z.string().min(1, 'Profesional requerido'),
  title: z.string().min(1, 'Título requerido'),
  date: z.string().min(1, 'Fecha requerida'),
  start_time: z.string().min(1, 'Hora de inicio requerida'),
  end_time: z.string().min(1, 'Hora de fin requerida'),
  available_reservations: z.coerce.number().positive('Debe ser mayor que 0'),
  session_url: z.string().url('URL inválida'),
});

type SessionFormData = z.infer<typeof sessionSchema>;

function NuevaSesionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, control, formState: { errors } } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
  });

  const { data: services = [] } = useQuery(['services'], servicesApi.getServices);
  const { data: professionals = [] } = useQuery(['professionals'], professionalsApi.getProfessionals);

  const createSessionMutation = useMutation({
    mutationFn: sessionsApi.createSession,
    onSuccess: () => {
      toast.success("Sesión creada correctamente");
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      navigate({ to: '/sesiones' });
    },
    onError: () => {
      toast.error("Error al crear la sesión");
    },
  });

  const onSubmit = (data: SessionFormData) => {
    createSessionMutation.mutate(data);
  };

  return (
    <div className="p-6 h-full flex flex-col font-montserrat">
      <HeaderDescriptor title="SESIONES" subtitle="AGREGAR SESIÓN" />
      <Card className="mt-6 flex-grow">
        <CardHeader>
          <CardTitle>Datos de la sesión</CardTitle>
          <CardDescription>Complete la información de la nueva sesión.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <Label>Servicio</Label>
              <Controller
                name="service_id"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un servicio" />
                    </SelectTrigger>
                    
                    <SelectContent>
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>

                  </Select>
                )}
              />
              {errors.service_id && <p className="text-red-500 text-sm">{errors.service_id.message}</p>}
            </div>

            <div>
              <Label>Profesional encargado</Label>
              <Controller
                name="professional_id"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un profesional" />
                    </SelectTrigger>
                    <SelectContent>
                      {professionals.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{`${p.name} ${p.first_last_name}`}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.professional_id && <p className="text-red-500 text-sm">{errors.professional_id.message}</p>}
            </div>

            <div>
              <Label>Título</Label>
              <Input {...register("title")} placeholder="Ej. Clase avanzada" />
              {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
            </div>

            <div>
              <Label>Fecha</Label>
              <Input type="date" {...register("date")} />
              {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
            </div>

            <div>
              <Label>Hora de inicio</Label>
              <Input type="time" {...register("start_time")} />
              {errors.start_time && <p className="text-red-500 text-sm">{errors.start_time.message}</p>}
            </div>

            <div>
              <Label>Hora fin</Label>
              <Input type="time" {...register("end_time")} />
              {errors.end_time && <p className="text-red-500 text-sm">{errors.end_time.message}</p>}
            </div>

            <div>
              <Label>Reservas disponibles</Label>
              <Input type="number" {...register("available_reservations")} />
              {errors.available_reservations && <p className="text-red-500 text-sm">{errors.available_reservations.message}</p>}
            </div>

            <div className="col-span-full">
              <Label>Link de la sesión</Label>
              <Input {...register("session_url")} placeholder="https://..." />
              {errors.session_url && <p className="text-red-500 text-sm">{errors.session_url.message}</p>}
            </div>
          </CardContent>

          <div className="flex justify-end gap-2 p-6">
            <Button variant="outline" type="button" onClick={() => navigate({ to: '/sesiones' })}>Cancelar</Button>
            <Button type="submit" disabled={createSessionMutation.isPending}>
              {createSessionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
