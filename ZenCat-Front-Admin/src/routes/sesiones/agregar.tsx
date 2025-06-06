import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

import { sessionsApi } from '@/api/sessions/sessions';
import { professionalsApi } from '@/api/professionals/professionals';
import { localsApi } from '@/api/locals/locals';
import { CreateSessionPayload } from '@/types/session';
import {
  useSessionConflicts,
  useDayAvailability,
  useMonthlyAvailability,
} from '@/hooks/use-session-conflicts';
import { TimeSlotDisplay } from '@/components/sessions/time-slot-display';
import { SimpleTimePickerModal } from '@/components/sessions/simple-time-picker-modal';

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
      // Validar que si es presencial, debe tener local_id
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

  // Obtener profesionales y locales
  const { data: professionals, isLoading: isLoadingProfessionals } = useQuery({
    queryKey: ['professionals'],
    queryFn: professionalsApi.getProfessionals,
  });

  const { data: locals, isLoading: isLoadingLocals } = useQuery({
    queryKey: ['locals'],
    queryFn: localsApi.getLocals,
  });

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
      toast.success('Sesión creada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      navigate({ to: '/sesiones' });
    },
    onError: (error) => {
      console.error('Error creating session:', error);
      toast.error('Error al crear sesión', { description: error.message });
    },
  });

  const onSubmit = (data: SessionFormData) => {


    if (hasConflict) {

      toast.error('No se puede crear la sesión', {
        description:
          'Existen conflictos de horario que deben resolverse primero',
      });
      return;
    }

    // Crear fechas en zona horaria local (Lima, Perú)
    if (!data.date) {
      toast.error('La fecha es requerida');
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
    };


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
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">1</span>
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

                  {/* Paso 2: Profesional */}
                  <div className="space-y-4 border-b pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <span className={`rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2 ${
                        watchedValues.title && watchedValues.date && watchedValues.capacity 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-300 text-gray-600'
                      }`}>2</span>
                       Profesional
                    </h3>
                    <div>
                      <Label>Profesional *</Label>
                      <Select
                        value={watchedValues.professional_id}
                        onValueChange={(value) =>
                          setValue('professional_id', value)
                        }
                        disabled={!watchedValues.title || !watchedValues.date || !watchedValues.capacity}
                      >
                        <SelectTrigger className={`transition-colors ${
                          !watchedValues.title || !watchedValues.date || !watchedValues.capacity
                            ? 'bg-gray-100 cursor-not-allowed' 
                            : !watchedValues.professional_id 
                              ? 'border-blue-300 bg-blue-50 hover:bg-blue-100' 
                              : 'border-green-300 bg-green-50'
                        }`}>
                          <SelectValue placeholder={
                            !watchedValues.title || !watchedValues.date || !watchedValues.capacity
                              ? "Completa la información básica primero"
                              : "Seleccionar profesional"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingProfessionals ? (
                            <SelectItem value="loading" disabled>
                              Cargando...
                            </SelectItem>
                          ) : (
                            professionals?.map((professional) => (
                              <SelectItem
                                key={professional.id}
                                value={professional.id}
                              >
                                {professional.name} {professional.first_last_name}
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
                    </div>
                  </div>

                  {/* Paso 3: Tipo de sesión */}
                  <div className="space-y-4 border-b pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <span className={`rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2 ${
                        watchedValues.professional_id
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-300 text-gray-600'
                      }`}>3</span>
                       Tipo de Sesión
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_virtual"
                        checked={watchedValues.is_virtual}
                        disabled={!watchedValues.professional_id}
                        onCheckedChange={(checked) => {
                          setValue('is_virtual', !!checked);
                          if (checked) {
                            setValue('local_id', undefined);
                          } else {
                            setValue('session_link', '');
                          }
                        }}
                      />
                      <Label htmlFor="is_virtual" className={!watchedValues.professional_id ? 'text-gray-400' : ''}>
                        Sesión virtual
                      </Label>
                    </div>

                    {watchedValues.is_virtual ? (
                      <div>
                        <Label htmlFor="session_link">
                          Enlace de la sesión
                        </Label>
                        <Input
                          id="session_link"
                          type="url"
                          {...form.register('session_link')}
                          placeholder="https://meet.google.com/..."
                          disabled={!watchedValues.professional_id}
                        />
                        {form.formState.errors.session_link && (
                          <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.session_link.message}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <Label>Local *</Label>
                        <Select
                          value={watchedValues.local_id}
                          onValueChange={(value) => setValue('local_id', value)}
                          disabled={!watchedValues.professional_id}
                        >
                          <SelectTrigger className={`transition-colors ${
                            !watchedValues.professional_id
                              ? 'bg-gray-100 cursor-not-allowed' 
                              : !watchedValues.local_id 
                                ? 'border-blue-300 bg-blue-50 hover:bg-blue-100' 
                                : 'border-green-300 bg-green-50'
                          }`}>
                            <SelectValue placeholder={
                              !watchedValues.professional_id
                                ? "Selecciona un profesional primero"
                                : "Seleccionar local"
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {isLoadingLocals ? (
                              <SelectItem value="loading" disabled>
                                Cargando...
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
                    )}
                  </div>

                  {/* Paso 4: Horario (al final) */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <span className={`rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2 ${
                        (watchedValues.is_virtual || watchedValues.local_id)
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-300 text-gray-600'
                      }`}>4</span>
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
                          disabled={!watchedValues.date || !watchedValues.professional_id || (!watchedValues.is_virtual && !watchedValues.local_id)}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="start_time">Hora de inicio *</Label>
                          <Input
                            id="start_time"
                            type="time"
                            {...form.register('start_time')}
                            disabled={!watchedValues.date || !watchedValues.professional_id || (!watchedValues.is_virtual && !watchedValues.local_id)}
                            className={(!watchedValues.date || !watchedValues.professional_id || (!watchedValues.is_virtual && !watchedValues.local_id)) 
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

                        <div>
                          <Label htmlFor="end_time">Hora de fin *</Label>
                          <Input
                            id="end_time"
                            type="time"
                            {...form.register('end_time')}
                            disabled={!watchedValues.date || !watchedValues.professional_id || (!watchedValues.is_virtual && !watchedValues.local_id)}
                            className={(!watchedValues.date || !watchedValues.professional_id || (!watchedValues.is_virtual && !watchedValues.local_id)) 
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
                      
                      {(!watchedValues.date || !watchedValues.professional_id || (!watchedValues.is_virtual && !watchedValues.local_id)) && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-sm text-yellow-800">
                             Completa primero la información básica, profesional y tipo de sesión para habilitar la selección de horario.
                          </p>
                        </div>
                      )}
                    </div>
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
                <p>
                  • No puede haber sesiones simultáneas del mismo profesional
                </p>
                <p>• Un local no puede tener sesiones superpuestas</p>
                <p>• Las fechas pasadas no están disponibles</p>
                <p>• Para sesiones virtuales, el enlace es opcional</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
