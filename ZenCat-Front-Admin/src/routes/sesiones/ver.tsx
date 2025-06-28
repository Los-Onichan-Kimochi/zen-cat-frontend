import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { sessionsApi } from '@/api/sessions/sessions';
import { professionalsApi } from '@/api/professionals/professionals';
import { localsApi } from '@/api/locals/locals';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  MapPin,
  Link as LinkIcon,
  User,
  CalendarIcon,
  Save,
  X,
} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { SessionState, Session, UpdateSessionPayload } from '@/types/session';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/context/ToastContext';

const sessionSearchSchema = z.object({
  id: z.string(),
});

export const Route = createFileRoute('/sesiones/ver')({
  validateSearch: sessionSearchSchema,
  component: SessionDetailComponent,
});

function SessionDetailComponent() {
  const navigate = useNavigate();
  const { id } = Route.useSearch();
  const queryClient = useQueryClient();
  const toast = useToast();

  // State for edit mode
  const [isEditing, setIsEditing] = useState(false);

  // Form state for editing
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    capacity: 0,
    professional_id: '',
    is_virtual: false,
    local_id: '',
    session_link: '',
    start_time: '',
    end_time: '',
    state: '',
  });

  // Fetch session data
  const {
    data: session,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['session', id],
    queryFn: () => sessionsApi.getSessionById(id),
  });

  // Initialize form data when session data is loaded
  useEffect(() => {
    if (session) {
      console.log('Session data loaded:', session);
      setFormData({
        title: session.title,
        date: format(new Date(session.date), 'yyyy-MM-dd'),
        capacity: session.capacity,
        professional_id: session.professional_id,
        is_virtual: !session.local_id,
        local_id: session.local_id || '',
        session_link: session.session_link || '',
        start_time: format(new Date(session.start_time), 'HH:mm'),
        end_time: format(new Date(session.end_time), 'HH:mm'),
        state: session.state,
      });
    }
  }, [session]);

  // Fetch professionals for display
  const { data: professionals } = useQuery({
    queryKey: ['professionals'],
    queryFn: professionalsApi.getProfessionals,
    enabled: !!session,
  });

  // Fetch locals for display
  const { data: locals } = useQuery({
    queryKey: ['locals'],
    queryFn: localsApi.getLocals,
    enabled: !!session,
  });

  // Find professional and local details - use useMemo to update when formData changes in edit mode
  const professional = useMemo(() => {
    if (!professionals) return null;
    return isEditing
      ? professionals.find((p) => p.id === formData.professional_id)
      : professionals.find((p) => p.id === session?.professional_id);
  }, [
    professionals,
    session?.professional_id,
    formData.professional_id,
    isEditing,
  ]);

  const local = useMemo(() => {
    if (!locals) return null;
    return isEditing
      ? locals.find((l) => l.id === formData.local_id)
      : locals.find((l) => l.id === session?.local_id);
  }, [locals, session?.local_id, formData.local_id, isEditing]);

  // Check if session is virtual - use formData when in edit mode
  const isVirtual = isEditing
    ? formData.is_virtual
    : session && !session.local_id;

  // Update session mutation
  const updateSessionMutation = useMutation({
    mutationFn: (updatedSession: UpdateSessionPayload) => {
      console.log('Sending update request with data:', updatedSession);
      return sessionsApi.updateSession(id, updatedSession);
    },
    onSuccess: (data) => {
      console.log('Update successful. Response:', data);
      queryClient.invalidateQueries({ queryKey: ['session', id] });
      refetch(); // Refetch the session data to ensure we have the latest
      setIsEditing(false);
      toast.success('Sesión actualizada', {
        description: 'Los cambios han sido guardados correctamente.',
      });
    },
    onError: (error) => {
      console.error('Error updating session:', error);
      toast.error('Error', {
        description: 'No se pudo actualizar la sesión. Inténtalo de nuevo.',
      });
    },
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string | boolean) => {
    setFormData({
      ...formData,
      [name]: value,
    });

    // If changing to virtual session, clear local_id
    if (name === 'is_virtual' && value === true) {
      setFormData((prev) => ({ ...prev, local_id: '' }));
    }
    // If changing to in-person session, clear session_link
    else if (name === 'is_virtual' && value === false) {
      setFormData((prev) => ({ ...prev, session_link: '' }));
    }
  };

  // Validate form data
  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast.error('Error de validación', {
        description: 'El título de la sesión es obligatorio.',
      });
      return false;
    }

    if (!formData.date) {
      toast.error('Error de validación', {
        description: 'La fecha de la sesión es obligatoria.',
      });
      return false;
    }

    if (!formData.professional_id) {
      toast.error('Error de validación', {
        description: 'Debe seleccionar un profesional.',
      });
      return false;
    }

    if (!formData.is_virtual && !formData.local_id) {
      toast.error('Error de validación', {
        description: 'Debe seleccionar un local para sesiones presenciales.',
      });
      return false;
    }

    if (formData.is_virtual && !formData.session_link) {
      toast.error('Error de validación', {
        description: 'El enlace es obligatorio para sesiones virtuales.',
      });
      return false;
    }

    if (!formData.start_time || !formData.end_time) {
      toast.error('Error de validación', {
        description: 'La hora de inicio y fin son obligatorias.',
      });
      return false;
    }

    if (!formData.state) {
      toast.error('Error de validación', {
        description: 'Debe seleccionar un estado para la sesión.',
      });
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!validateForm()) {
      return;
    }

    try {
      // Format the data for API
      const updatedSession: UpdateSessionPayload = {
        title: formData.title,
        date: formData.date,
        capacity: parseInt(formData.capacity.toString()),
        professional_id: formData.professional_id,
        local_id: formData.is_virtual ? null : formData.local_id,
        session_link: formData.is_virtual ? formData.session_link : null,
        start_time: `${formData.date}T${formData.start_time}:00`,
        end_time: `${formData.date}T${formData.end_time}:00`,
        state: formData.state as SessionState,
      };

      console.log('Form data before submission:', formData);
      console.log('Prepared update payload:', updatedSession);

      updateSessionMutation.mutate(updatedSession);
    } catch (error) {
      console.error('Error preparing session data:', error);
      toast.error('Error', {
        description:
          'Error al preparar los datos de la sesión. Verifique los campos e intente nuevamente.',
      });
    }
  };

  // Format date and times for display
  const formattedDate = session?.date
    ? format(new Date(session.date), 'yyyy-MM-dd')
    : '';

  const formattedStartTime = session?.start_time
    ? format(new Date(session.start_time), 'HH:mm')
    : '';

  const formattedEndTime = session?.end_time
    ? format(new Date(session.end_time), 'HH:mm')
    : '';

  if (isLoading) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="p-6 h-full">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/sesiones' })}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>
        <div className="text-center">
          <p className="text-red-600">Error cargando la sesión</p>
        </div>
      </div>
    );
  }

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
                  Detalles de la Sesión
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Paso 1: Información básica */}
                  <div className="space-y-4 border-b pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <span className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                        1
                      </span>
                      Información Básica
                    </h3>
                    <div>
                      <Label htmlFor="title">Título de la sesión</Label>
                      <Input
                        id="title"
                        name="title"
                        value={isEditing ? formData.title : session.title}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date">Fecha</Label>
                        <Input
                          id="date"
                          name="date"
                          type="date"
                          value={isEditing ? formData.date : formattedDate}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-gray-50' : ''}
                        />
                      </div>

                      <div>
                        <Label htmlFor="capacity">Capacidad</Label>
                        <Input
                          id="capacity"
                          name="capacity"
                          type="number"
                          value={
                            isEditing ? formData.capacity : session.capacity
                          }
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-gray-50' : ''}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Paso 2: Profesional */}
                  <div className="space-y-4 border-b pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <span className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                        2
                      </span>
                      Profesional
                    </h3>
                    <div>
                      <Label>Profesional</Label>
                      <Select
                        disabled={!isEditing}
                        value={
                          isEditing
                            ? formData.professional_id
                            : session.professional_id
                        }
                        onValueChange={(value) =>
                          handleSelectChange('professional_id', value)
                        }
                      >
                        <SelectTrigger
                          className={!isEditing ? 'bg-gray-50' : ''}
                        >
                          <SelectValue>
                            {professional
                              ? `${professional.name} ${professional.first_last_name || ''}`
                              : 'Profesional no encontrado'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {professionals?.map((prof) => (
                            <SelectItem key={prof.id} value={prof.id}>
                              {`${prof.name} ${prof.first_last_name || ''}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Paso 3: Tipo de sesión */}
                  <div className="space-y-4 border-b pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <span className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                        3
                      </span>
                      Tipo de Sesión
                    </h3>
                    <div className="flex items-center space-x-2 mb-4">
                      <Checkbox
                        id="is_virtual"
                        name="is_virtual"
                        checked={isEditing ? formData.is_virtual : isVirtual}
                        onCheckedChange={(checked) =>
                          handleSelectChange('is_virtual', !!checked)
                        }
                        disabled={!isEditing}
                      />
                      <Label htmlFor="is_virtual">Sesión virtual</Label>
                    </div>

                    {(isEditing ? formData.is_virtual : isVirtual) ? (
                      <div>
                        <Label htmlFor="session_link">
                          Enlace de la sesión
                        </Label>
                        <Input
                          id="session_link"
                          name="session_link"
                          value={
                            isEditing
                              ? formData.session_link
                              : session.session_link || ''
                          }
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-gray-50' : ''}
                        />
                      </div>
                    ) : (
                      <div>
                        <Label>Local</Label>
                        <Select
                          disabled={!isEditing}
                          value={
                            isEditing
                              ? formData.local_id
                              : session.local_id || ''
                          }
                          onValueChange={(value) =>
                            handleSelectChange('local_id', value)
                          }
                        >
                          <SelectTrigger
                            className={!isEditing ? 'bg-gray-50' : ''}
                          >
                            <SelectValue>
                              {local
                                ? `${local.local_name} - ${local.street_name} ${local.building_number}`
                                : 'Seleccione un local'}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {locals?.map((loc) => (
                              <SelectItem key={loc.id} value={loc.id}>
                                {`${loc.local_name} - ${loc.street_name} ${loc.building_number}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Paso 4: Horario */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <span className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                        4
                      </span>
                      Horario de la Sesión
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start_time">Hora de inicio</Label>
                        <Input
                          id="start_time"
                          name="start_time"
                          type="time"
                          value={
                            isEditing ? formData.start_time : formattedStartTime
                          }
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-gray-50' : ''}
                        />
                      </div>

                      <div>
                        <Label htmlFor="end_time">Hora de fin</Label>
                        <Input
                          id="end_time"
                          name="end_time"
                          type="time"
                          value={
                            isEditing ? formData.end_time : formattedEndTime
                          }
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-gray-50' : ''}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Estado de la sesión */}
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <span className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                        5
                      </span>
                      Estado de la Sesión
                    </h3>
                    {isEditing ? (
                      <Select
                        value={formData.state}
                        onValueChange={(value) =>
                          handleSelectChange('state', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={SessionState.SCHEDULED}>
                            Programada
                          </SelectItem>
                          <SelectItem value={SessionState.ONGOING}>
                            En curso
                          </SelectItem>
                          <SelectItem value={SessionState.COMPLETED}>
                            Completada
                          </SelectItem>
                          <SelectItem value={SessionState.CANCELLED}>
                            Cancelada
                          </SelectItem>
                          <SelectItem value={SessionState.RESCHEDULED}>
                            Reprogramada
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center">
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium border 
                          ${
                            session.state === SessionState.SCHEDULED
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : session.state === SessionState.ONGOING
                                ? 'bg-green-100 text-green-800 border-green-200'
                                : session.state === SessionState.COMPLETED
                                  ? 'bg-gray-100 text-gray-800 border-gray-200'
                                  : session.state === SessionState.CANCELLED
                                    ? 'bg-red-100 text-red-800 border-red-200'
                                    : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          }`}
                        >
                          {session.state === SessionState.SCHEDULED
                            ? 'Programada'
                            : session.state === SessionState.ONGOING
                              ? 'En curso'
                              : session.state === SessionState.COMPLETED
                                ? 'Completada'
                                : session.state === SessionState.CANCELLED
                                  ? 'Cancelada'
                                  : 'Reprogramada'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel lateral de información */}
          <div className="space-y-6">
            {/* Información de ocupación */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Ocupación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-2">
                  <div className="text-2xl font-bold">
                    {session.registered_count} / {session.capacity}
                  </div>
                  <div className="text-sm text-gray-500">participantes</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${
                        session.registered_count / session.capacity >= 0.9
                          ? 'bg-red-400'
                          : session.registered_count / session.capacity >= 0.7
                            ? 'bg-yellow-400'
                            : 'bg-green-400'
                      }`}
                      style={{
                        width: `${Math.min((session.registered_count / session.capacity) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    onClick={() =>
                      navigate({
                        to: '/sesiones/reservas/$sessionId',
                        params: { sessionId: session.id },
                      })
                    }
                    className="w-full bg-black text-white hover:bg-gray-800"
                  >
                    Ver Reservas
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Información de fecha y hora */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Fecha y Hora
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Fecha</p>
                    <p className="font-medium">
                      {format(
                        new Date(session.date),
                        "EEEE, dd 'de' MMMM 'de' yyyy",
                        { locale: es },
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Horario</p>
                    <p className="font-medium">
                      {format(new Date(session.start_time), 'HH:mm')} -{' '}
                      {format(new Date(session.end_time), 'HH:mm')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tipo de sesión */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  {isVirtual ? (
                    <LinkIcon className="mr-2 h-4 w-4" />
                  ) : (
                    <MapPin className="mr-2 h-4 w-4" />
                  )}
                  {isVirtual ? 'Sesión Virtual' : 'Sesión Presencial'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isVirtual ? (
                  session.session_link ? (
                    <a
                      href={session.session_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium break-all block p-2 border border-blue-100 bg-blue-50 rounded"
                    >
                      {session.session_link}
                    </a>
                  ) : (
                    <p className="text-gray-400 italic">
                      No hay enlace disponible
                    </p>
                  )
                ) : (
                  <div className="space-y-2">
                    <p className="font-medium">
                      {local?.local_name || 'Local no encontrado'}
                    </p>
                    {local && (
                      <p className="text-sm text-gray-600">
                        {local.street_name} {local.building_number}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Botón de editar fuera de cualquier tarjeta */}
            {isEditing ? (
              <div className="flex space-x-2 mt-6">
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="flex items-center w-1/2"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-green-600 text-white hover:bg-green-700 flex items-center w-1/2"
                  disabled={updateSessionMutation.isPending}
                >
                  {updateSessionMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Guardar
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="w-full bg-black text-white hover:bg-gray-800 mt-6"
              >
                Editar Sesión
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
