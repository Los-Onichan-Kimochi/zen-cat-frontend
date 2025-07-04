import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/context/ToastContext';
import { format } from 'date-fns';
import React from 'react';
import {
  ArrowLeft,
  Save,
  AlertTriangle,
  Clock,
  Users,
  MapPin,
  Link as LinkIcon,
  User,
  Calendar as CalendarIcon,
  Calendar,
  Loader2,
  Building,
  BookOpen,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { sessionsApi } from '@/api/sessions/sessions';
import { professionalsApi } from '@/api/professionals/professionals';
import { localsApi } from '@/api/locals/locals';
import { communitiesApi } from '@/api/communities/communities';
import { communityServicesApi } from '@/api/communities/community-services';
import { CreateSessionPayload } from '@/types/session';
import {
  useSessionConflicts,
  useDayAvailability,
  useMonthlyAvailability,
} from '@/hooks/use-session-conflicts';
import { TimeSlotDisplay } from '@/components/sessions/time-slot-display';
import { SimpleTimePickerModal } from '@/components/sessions/simple-time-picker-modal';
import { serviceProfessionalApi } from '@/api/services/service_professionals';
import { serviceLocalApi } from '@/api/services/service_locals';

const sessionSchema = z
  .object({
    title: z
      .string()
      .min(1, 'El título es requerido')
      .max(200, 'El título no puede exceder 200 caracteres'),
    date: z.date({ required_error: 'La fecha es requerida' }),
    start_time: z.string().min(1, 'La hora de inicio es requerida'),
    end_time: z.string().min(1, 'La hora de fin es requerida'),
    capacity: z
      .number()
      .min(1, 'La capacidad debe ser al menos 1')
      .max(1000, 'La capacidad no puede exceder 1000'),
    community_id: z.string().min(1, 'Debe seleccionar una comunidad'),
    service_id: z.string().min(1, 'Debe seleccionar un servicio'),
    community_service_id: z.string(),
    professional_id: z.string().min(1, 'Debe seleccionar un profesional'),
    is_virtual: z.boolean(),
    local_id: z.string().optional(),
    session_link: z
      .string()
      .url('Debe ser una URL válida')
      .optional()
      .or(z.literal('')),
  })
  .refine(
    (data) => {
      // Validate that if it's not virtual, it must have a local_id
      if (!data.is_virtual && !data.local_id) {
        return false;
      }
      return true;
    },
    {
      message: 'Para sesiones presenciales debe seleccionar un local',
      path: ['local_id'],
    },
  )
  .refine(
    (data) => {
      // Validar que la hora de fin sea después de la hora de inicio
      if (data.start_time && data.end_time) {
        return data.end_time > data.start_time;
      }
      return true;
    },
    {
      message: 'La hora de fin debe ser posterior a la hora de inicio',
      path: ['end_time'],
    },
  )
  .refine(
    (data) => {
      // Validar duración mínima de 30 minutos
      if (data.start_time && data.end_time) {
        const start = new Date(`2000-01-01T${data.start_time}`);
        const end = new Date(`2000-01-01T${data.end_time}`);
        const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
        return diffMinutes >= 30;
      }
      return true;
    },
    {
      message: 'La sesión debe durar al menos 30 minutos',
      path: ['end_time'],
    },
  );

type SessionFormData = z.infer<typeof sessionSchema>;

export const Route = createFileRoute('/sesiones/agregar')({
  component: AddSessionComponent,
});

function AddSessionComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const form = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      title: '',
      capacity: 10,
      is_virtual: false,
      session_link: '',
    },
  });

  const { watch, setValue } = form;
  const watchedValues = watch();

  // Estado para el mes actual del calendario
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  // Obtener comunidades
  const { data: communities, isLoading: isLoadingCommunities } = useQuery({
    queryKey: ['communities'],
    queryFn: communitiesApi.getCommunities,
  });

  // Obtener servicios por comunidad
  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ['services', watchedValues.community_id],
    queryFn: () => communityServicesApi.getServicesByCommunityId(watchedValues.community_id),
    enabled: !!watchedValues.community_id,
  });

  // Obtener profesionales filtrados por servicio y comunidad
  const { data: professionals, isLoading: isLoadingProfessionals } = useQuery({
    queryKey: ['professionals', watchedValues.service_id, watchedValues.is_virtual],
    queryFn: () => serviceProfessionalApi.fetchFilteredProfessionals(
      watchedValues.service_id,
      watchedValues.is_virtual || false
    ),
    enabled: !!watchedValues.service_id,
    // Refetch cuando cambia el tipo de servicio (virtual/presencial)
    refetchOnWindowFocus: false,
  });

  // Obtener locales filtrados por servicio y comunidad
  const { data: serviceLocals, isLoading: isLoadingLocals } = useQuery({
    queryKey: ['serviceLocals', watchedValues.service_id, watchedValues.community_id],
    queryFn: () => serviceLocalApi.fetchServiceLocals({ serviceId: watchedValues.service_id}),
    enabled: !!watchedValues.service_id && !!watchedValues.community_id && !watchedValues.is_virtual,
  });

  // Obtener los detalles completos de los locales a partir de los IDs - uno por uno
  const { data: locals, isLoading: isLoadingLocalDetails } = useQuery({
    queryKey: ['locals', serviceLocals],
    queryFn: async () => {
      if (!serviceLocals || serviceLocals.length === 0) return [];
      
      // Obtener los IDs de locales de las asociaciones servicio-local
      const localIds = serviceLocals.map(sl => sl.local_id);
      
      // Obtener cada local individualmente para garantizar compatibilidad
      const localsList: any[] = [];
      for (const localId of localIds) {
        try {
          const local = await localsApi.getLocalById(localId);
          if (local) {
            localsList.push(local);
          }
        } catch (error) {
          console.error(`Error al obtener local ${localId}`);
        }
      }
      return localsList;
    },
    enabled: !!serviceLocals && serviceLocals.length > 0,
  });
  
  // Get selected service details
  const selectedService = services?.find(service => service.id === watchedValues.service_id);
  
  // Fetch community service association when service and community are selected
  React.useEffect(() => {
    if (watchedValues.service_id && watchedValues.community_id) {
      // Fetch the specific community-service association
      communityServicesApi.getCommunityServices(watchedValues.community_id, watchedValues.service_id)
        .then(communityServices => {
          if (communityServices && communityServices.length > 0) {
            const communityServiceId = communityServices[0].id;
            setValue('community_service_id', communityServiceId);
          } else {
            console.error('No community service association found');
          }
        })
        .catch(error => {
          console.error('Error fetching community service association:', error);
        });
    }
  }, [watchedValues.service_id, watchedValues.community_id, setValue]);

  // Update is_virtual when service changes
  React.useEffect(() => {
    if (selectedService) {
      const previousVirtualValue = watchedValues.is_virtual;
      const newVirtualValue = selectedService.is_virtual;
      
      // Update virtual status
      setValue('is_virtual', newVirtualValue);
      
      // Clear incompatible values
      if (newVirtualValue) {
        setValue('local_id', undefined);
        // Para servicios virtuales, permitir seleccionar profesional directamente
      } else {
        setValue('session_link', '');
      }
      
      // Reset professional selection if switching between virtual/non-virtual
      // to ensure proper filtering of MEDIC professionals
      if (previousVirtualValue !== newVirtualValue) {
        setValue('professional_id', '');
      }
    }
  }, [selectedService, setValue, watchedValues.is_virtual]);
  
  // Monitorea cambios en los datos relacionados con la selección de servicio
  React.useEffect(() => {
    // Este efecto se utiliza para mantener sincronizados todos los datos
    // relacionados con la selección de servicio, comunidad y profesionales
    // No es necesario realizar acciones adicionales aquí, solo mantener las dependencias
  }, [communities, services, professionals, serviceLocals, locals, selectedService, watchedValues.is_virtual, watchedValues.community_service_id]);

  // Verificar conflictos
  const conflictCheck = {
    date: watchedValues.date ? format(watchedValues.date, 'yyyy-MM-dd') : '',
    startTime: watchedValues.start_time || '',
    endTime: watchedValues.end_time || '',
    professionalId: watchedValues.professional_id,
    localId: !watchedValues.is_virtual ? watchedValues.local_id : undefined,
  };

  const {
    hasConflict,
    conflicts,
    isLoading: isCheckingConflicts,
  } = useSessionConflicts(conflictCheck);

  // Obtener disponibilidad del día
  const availability = useDayAvailability(
    watchedValues.date ? format(watchedValues.date, 'yyyy-MM-dd') : '',
    watchedValues.professional_id,
    !watchedValues.is_virtual ? watchedValues.local_id : undefined,
  );

  // Obtener días ocupados del mes
  const { occupiedDates } = useMonthlyAvailability(
    currentMonth,
    watchedValues.professional_id,
    !watchedValues.is_virtual ? watchedValues.local_id : undefined,
  );

  // Mutación para crear sesión
  const { mutate: createSession, isPending: isCreating } = useMutation({
    mutationFn: (data: CreateSessionPayload) => {
      return sessionsApi.createSession(data);
    },
    onSuccess: (result) => {
      toast.success('Sesión Creada', {
        description: 'La sesión ha sido creada exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      navigate({ to: '/sesiones' });
    },
    onError: (error) => {
      console.error('Error creating session:', error);
      toast.error('Error al Crear Sesión', {
        description: error.message || 'No se pudo crear la sesión.',
      });
    },
  });

  const onSubmit = (data: SessionFormData) => {
    if (hasConflict) {
      toast.error('Conflicto de Horario', {
        description:
          'Existen conflictos de horario que deben resolverse primero.',
      });
      return;
    }

    // Crear fechas en zona horaria local (Lima, Perú)
    if (!data.date) {
      toast.error('Fecha Requerida', {
        description: 'Debe seleccionar una fecha para la sesión.',
      });
      return;
    }

    const dateString = format(data.date, 'yyyy-MM-dd');
    const localStartTime = `${dateString}T${data.start_time}:00`;
    const localEndTime = `${dateString}T${data.end_time}:00`;
    const localDate = `${dateString}T00:00:00`;

    const payload: CreateSessionPayload = {
      title: data.title,
      date: localDate,
      start_time: localStartTime,
      end_time: localEndTime,
      capacity: data.capacity,
      professional_id: data.professional_id,
      local_id: data.is_virtual ? null : data.local_id || null,
      session_link:
        data.is_virtual && data.session_link ? data.session_link : null,
      community_service_id: data.community_service_id,
    };

    if (!data.community_service_id) {
      toast.error('Datos Incompletos', {
        description: 'No se pudo obtener la asociación entre comunidad y servicio.',
      });
      return;
    }

    createSession(payload);
  };

  return (
    <div className="p-6 h-full">
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={() => navigate({ to: '/sesiones' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario principal */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  Agregar Nueva Sesión
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Paso 1: Información básica */}
                  <div className="space-y-4 border-b pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <span className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                        1
                      </span>
                      Información Básica
                    </h3>
                    <div>
                      <Label htmlFor="title">Título de la sesión *</Label>
                      <Input
                        id="title"
                        {...form.register('title')}
                        placeholder="Ej: Sesión de yoga matutina"
                      />
                      {form.formState.errors.title && (
                        <p className="text-red-500 text-sm mt-1">
                          {form.formState.errors.title.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Fecha *</Label>
                        <DatePicker
                          date={watchedValues.date}
                          onDateChange={(date) => {
                            if (date) {
                              setValue('date', date);
                              setCurrentMonth(date);
                            }
                          }}
                          onMonthChange={setCurrentMonth}
                          disabled={(date) => date < new Date()}
                          placeholder="Seleccionar fecha"
                          occupiedDates={occupiedDates}
                        />
                        {form.formState.errors.date && (
                          <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.date.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="capacity">Capacidad *</Label>
                        <Input
                          id="capacity"
                          type="number"
                          min="1"
                          max="1000"
                          {...form.register('capacity', {
                            valueAsNumber: true,
                          })}
                        />
                        {form.formState.errors.capacity && (
                          <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.capacity.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Paso 2: Comunidad */}
                  <div className="space-y-4 border-b pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <span className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                        2
                      </span>
                      Comunidad
                    </h3>
                    <div>
                      <Label>Comunidad *</Label>
                      <Select
                        value={watchedValues.community_id}
                        onValueChange={(value) => {
                          setValue('community_id', value);
                          setValue('service_id', '');
                          setValue('professional_id', '');
                          setValue('local_id', '');
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar comunidad" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingCommunities ? (
                            <SelectItem value="loading" disabled>
                              Cargando...
                            </SelectItem>
                          ) : communities?.length === 0 ? (
                            <SelectItem value="none" disabled>
                              No hay comunidades disponibles
                            </SelectItem>
                          ) : (
                            communities?.map((community) => (
                              <SelectItem key={community.id} value={community.id}>
                                {community.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.community_id && (
                        <p className="text-red-500 text-sm mt-1">
                          {form.formState.errors.community_id.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Paso 3: Servicio */}
                  <div className="space-y-4 border-b pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <span
                        className={`rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2 ${
                          watchedValues.community_id
                            ? 'bg-black text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        3
                      </span>
                      Servicio
                    </h3>
                    <div>
                      <Label>Servicio *</Label>
                      <Select
                        value={watchedValues.service_id}
                        onValueChange={(value) => {
                          setValue('service_id', value);
                          setValue('professional_id', '');
                          setValue('local_id', '');
                          setValue('community_service_id', ''); // Clear community_service_id on service change
                        }}
                        disabled={!watchedValues.community_id}
                      >
                        <SelectTrigger
                          className={`transition-colors ${
                            !watchedValues.community_id
                              ? 'bg-gray-100 cursor-not-allowed'
                              : 'border-blue-300 bg-blue-50'
                          }`}
                        >
                          <SelectValue
                            placeholder={
                              !watchedValues.community_id
                                ? 'Primero seleccione una comunidad'
                                : 'Seleccionar servicio'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {!watchedValues.community_id ? (
                            <SelectItem value="none" disabled>
                              Seleccione una comunidad primero
                            </SelectItem>
                          ) : isLoadingServices ? (
                            <SelectItem value="loading" disabled>
                              Cargando...
                            </SelectItem>
                          ) : services?.length === 0 ? (
                            <SelectItem value="none" disabled>
                              No hay servicios disponibles en esta comunidad
                            </SelectItem>
                          ) : (
                            services?.map((service) => (
                              <SelectItem
                                key={service.id}
                                value={service.id}
                              >
                                {service.name} {service.is_virtual ? "(Virtual)" : "(Presencial)"}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.service_id && (
                        <p className="text-red-500 text-sm mt-1">
                          {form.formState.errors.service_id.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Paso 4: Local (solo para servicios presenciales) */}
                  {watchedValues.service_id && !watchedValues.is_virtual && (
                    <div className="space-y-4 border-b pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <span
                          className={`rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2 ${
                            watchedValues.service_id
                              ? 'bg-black text-white'
                              : 'bg-gray-300 text-gray-600'
                          }`}
                        >
                          4
                        </span>
                        Local
                      </h3>
                      <div>
                        <Label>Local *</Label>
                        <Select
                          value={watchedValues.local_id}
                          onValueChange={(value) => setValue('local_id', value)}
                          disabled={!watchedValues.service_id || watchedValues.is_virtual}
                        >
                          <SelectTrigger
                            className={`transition-colors ${
                              !watchedValues.service_id || watchedValues.is_virtual
                                ? 'bg-gray-100 cursor-not-allowed'
                                : 'border-blue-300 bg-blue-50 hover:bg-blue-100'
                            }`}
                          >
                            <SelectValue
                              placeholder={!watchedValues.service_id
                                ? 'Primero seleccione un servicio'
                                : 'Seleccionar local'
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {!watchedValues.service_id ? (
                              <SelectItem value="none" disabled>
                                Seleccione un servicio primero
                              </SelectItem>
                            ) : isLoadingLocals || isLoadingLocalDetails ? (
                              <SelectItem value="loading" disabled>
                                Cargando...
                              </SelectItem>
                            ) : locals?.length === 0 ? (
                              <SelectItem value="none" disabled>
                                No hay locales disponibles para este servicio
                              </SelectItem>
                            ) : (
                              locals?.map((local) => (
                                <SelectItem key={local.id} value={local.id}>
                                  {local.local_name} - {local.street_name}{' '}
                                  {local.building_number}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {form.formState.errors.local_id && (
                          <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.local_id.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Paso 4/5: Profesional */}
                  <div className="space-y-4 border-b pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <span
                        className={`rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2 ${
                          watchedValues.service_id && (watchedValues.is_virtual || watchedValues.local_id)
                            ? 'bg-black text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        {watchedValues.is_virtual ? '4' : '5'}
                      </span>
                      Profesional
                    </h3>
                    <div>
                      <Label>Profesional *</Label>
                      <Select
                        value={watchedValues.professional_id}
                        onValueChange={(value) => {
                          setValue('professional_id', value)
                        }}
                        disabled={
                          !watchedValues.service_id ||
                          (!watchedValues.is_virtual && !watchedValues.local_id)
                        }
                      >
                        <SelectTrigger
                          className={`transition-colors ${
                            !watchedValues.service_id || (!watchedValues.is_virtual && !watchedValues.local_id)
                              ? 'bg-gray-100 cursor-not-allowed'
                              : 'border-blue-300 bg-blue-50'
                          }`}
                        >
                          <SelectValue
                            placeholder={
                              !watchedValues.service_id
                                ? 'Primero seleccione un servicio'
                                : !watchedValues.is_virtual && !watchedValues.local_id
                                ? 'Primero seleccione un local'
                                : 'Seleccionar profesional'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {!watchedValues.service_id ? (
                            <SelectItem value="none" disabled>
                              Seleccione un servicio primero
                            </SelectItem>
                          ) : !watchedValues.is_virtual && !watchedValues.local_id ? (
                            <SelectItem value="none" disabled>
                              Seleccione un local primero
                            </SelectItem>
                          ) : isLoadingProfessionals ? (
                            <SelectItem value="loading" disabled>
                              Cargando...
                            </SelectItem>
                          ) : professionals?.length === 0 ? (
                            <SelectItem value="none" disabled>
                              No hay profesionales disponibles para este servicio
                            </SelectItem>
                          ) : (
                            professionals?.map((professional) => (
                              <SelectItem
                                key={professional.id}
                                value={professional.id}
                              >
                                {professional.name}{' '}
                                {professional.first_last_name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.professional_id && (
                        <p className="text-red-500 text-sm mt-1">
                          {form.formState.errors.professional_id.message}
                        </p>
                      )}
                      {watchedValues.service_id && !watchedValues.is_virtual && (
                        <p className="text-blue-600 text-sm mt-1 italic">
                          <AlertTriangle className="inline h-3 w-3 mr-1" />
                          Nota: Profesionales de tipo Médico solo están disponibles para servicios virtuales
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Paso 5: Enlace (solo para servicios virtuales) */}
                  {watchedValues.is_virtual && (
                    <div className="space-y-4 border-b pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <span className={`rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2 ${
                            watchedValues.professional_id
                              ? 'bg-black text-white'
                              : 'bg-gray-300 text-gray-600'
                          }`}
                        >
                          5
                        </span>
                        Enlace Virtual
                      </h3>
                      <div>
                        <Label htmlFor="session_link">Enlace de la sesión</Label>
                        <Input
                          id="session_link"
                          type="url"
                          {...form.register('session_link')}
                          placeholder="https://meet.google.com/..."
                          disabled={!watchedValues.professional_id}
                          className={!watchedValues.professional_id ? 'bg-gray-100 cursor-not-allowed' : ''}
                        />
                        {form.formState.errors.session_link && (
                          <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.session_link.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Último paso: Horario */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <span className="rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                        6
                      </span>
                      Horario de la Sesión
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Horario *</Label>
                        <SimpleTimePickerModal
                          selectedRange={
                            watchedValues.start_time && watchedValues.end_time
                              ? {
                                  start: watchedValues.start_time,
                                  end: watchedValues.end_time,
                                }
                              : undefined
                          }
                          onRangeSelect={(range) => {
                            form.setValue('start_time', range.start);
                            form.setValue('end_time', range.end);
                            form.trigger(['start_time', 'end_time']);
                          }}
                          occupiedSlots={availability.busySlots}
                          disabled={
                            !watchedValues.date ||
                            !watchedValues.professional_id ||
                            (!watchedValues.is_virtual && !watchedValues.local_id)
                          }
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Hora de inicio */}
                        <div>
                          <Label htmlFor="start_time">Hora de inicio *</Label>
                          <Input
                            id="start_time"
                            type="time"
                            {...form.register('start_time')}
                            disabled={
                              !watchedValues.date ||
                              !watchedValues.professional_id ||
                              (!watchedValues.is_virtual && !watchedValues.local_id)
                            }
                            className={
                              !watchedValues.date ||
                              !watchedValues.professional_id ||
                              (!watchedValues.is_virtual && !watchedValues.local_id)
                                ? 'bg-gray-100 cursor-not-allowed'
                                : ''
                            }
                          />
                          {form.formState.errors.start_time && (
                            <p className="text-red-500 text-sm mt-1">
                              {form.formState.errors.start_time.message}
                            </p>
                          )}
                        </div>
                        
                        {/* Hora de fin */}
                        <div>
                          <Label htmlFor="end_time">Hora de fin *</Label>
                          <Input
                            id="end_time"
                            type="time"
                            {...form.register('end_time')}
                            disabled={
                              !watchedValues.date ||
                              !watchedValues.professional_id ||
                              (!watchedValues.is_virtual && !watchedValues.local_id)
                            }
                            className={
                              !watchedValues.date ||
                              !watchedValues.professional_id ||
                              (!watchedValues.is_virtual && !watchedValues.local_id)
                                ? 'bg-gray-100 cursor-not-allowed'
                                : ''
                            }
                          />
                          {form.formState.errors.end_time && (
                            <p className="text-red-500 text-sm mt-1">
                              {form.formState.errors.end_time.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Alertas de conflictos */}
                    {hasConflict && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800">
                          Existen conflictos de horario:
                        </p>
                        <div className="space-y-2 mt-2">
                          {conflicts.professional.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-red-700 mb-1">
                                Conflicto de profesional:
                              </p>
                              {conflicts.professional.map((session) => (
                                <div
                                  key={session.id}
                                  className="text-sm text-red-600 bg-red-100 p-2 rounded"
                                >
                                  {session.title} -{' '}
                                  {format(new Date(session.start_time), 'HH:mm')} a{' '}
                                  {format(new Date(session.end_time), 'HH:mm')}
                                </div>
                              ))}
                            </div>
                          )}
                          {conflicts.local.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-red-700 mb-1">
                                Conflicto de local:
                              </p>
                              {conflicts.local.map((session) => (
                                <div
                                  key={session.id}
                                  className="text-sm text-red-600 bg-red-100 p-2 rounded"
                                >
                                  {session.title} -{' '}
                                  {format(new Date(session.start_time), 'HH:mm')} a{' '}
                                  {format(new Date(session.end_time), 'HH:mm')}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    
                  </div>

                  {/* Botones */}
                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate({ to: '/sesiones' })}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isCreating || hasConflict}
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Crear Sesión
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Panel lateral de información */}
          <div className="hidden lg:block">
            <div className="space-y-6">
              {/* Disponibilidad del día */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Disponibilidad
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TimeSlotDisplay
                    date={
                      watchedValues.date
                        ? format(watchedValues.date, 'yyyy-MM-dd')
                        : ''
                    }
                    professionalId={watchedValues.professional_id}
                    localId={
                      !watchedValues.is_virtual
                        ? watchedValues.local_id
                        : undefined
                    }
                  />
                </CardContent>
              </Card>

              {/* Community & Service Information */}
              {watchedValues.community_id && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Building className="mr-2 h-4 w-4" />
                      Comunidad Seleccionada
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingCommunities ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        <span>Cargando información...</span>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium">
                          {
                            communities?.find(
                              (c) => c.id === watchedValues.community_id
                            )?.name
                          }
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          {services?.length || 0} servicios disponibles
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Service Details */}
              {watchedValues.service_id && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Servicio Seleccionado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingServices ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        <span>Cargando información...</span>
                      </div>
                    ) : selectedService ? (
                      <div>
                        <p className="font-medium">
                          {selectedService.name}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-sm">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              selectedService.is_virtual
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {selectedService.is_virtual ? 'Virtual' : 'Presencial'}
                          </span>
                        </div>
                        {selectedService.description && (
                          <p className="text-sm text-gray-600 mt-2">
                            {selectedService.description}
                          </p>
                        )}
                        
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              )}

              {/* Alertas de conflictos */}
              {hasConflict && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center text-red-700">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Conflictos Detectados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {conflicts.professional.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-red-700 mb-2">
                            Conflicto de profesional:
                          </p>
                          {conflicts.professional.map((session) => (
                            <div
                              key={session.id}
                              className="text-sm text-red-600 bg-red-100 p-2 rounded"
                            >
                              {session.title} -{' '}
                              {format(new Date(session.start_time), 'HH:mm')} a{' '}
                              {format(new Date(session.end_time), 'HH:mm')}
                            </div>
                          ))}
                        </div>
                      )}
                      {conflicts.local.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-red-700 mb-2">
                            Conflicto de local:
                          </p>
                          {conflicts.local.map((session) => (
                            <div
                              key={session.id}
                              className="text-sm text-red-600 bg-red-100 p-2 rounded"
                            >
                              {session.title} -{' '}
                              {format(new Date(session.start_time), 'HH:mm')} a{' '}
                              {format(new Date(session.end_time), 'HH:mm')}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Información de ayuda */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Consejos</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 space-y-2">
                  <p>• La duración mínima de una sesión es 30 minutos</p>
                  <p>• No puede haber sesiones simultáneas del mismo profesional</p>
                  <p>• Un local no puede tener sesiones superpuestas</p>
                  <p>• Las fechas pasadas no están disponibles</p>
                  <p>• Para servicios virtuales, el enlace es opcional</p>
                  <p>• Para servicios presenciales, debe seleccionar un local</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
