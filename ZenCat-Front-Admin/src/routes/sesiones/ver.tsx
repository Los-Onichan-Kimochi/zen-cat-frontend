import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { sessionsApi } from '@/api/sessions/sessions';
import { professionalsApi } from '@/api/professionals/professionals';
import { localsApi } from '@/api/locals/locals';
import { communitiesApi } from '@/api/communities/communities';
import { communityServicesApi } from '@/api/communities/community-services';
import { CommunityService } from '@/types/community-service';
import { serviceProfessionalApi } from '@/api/services/service_professionals';
import { serviceLocalApi } from '@/api/services/service_locals';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  MapPin,
  Link as LinkIcon,
  CalendarIcon,
  Save,
  Check,
  X,
  Building,
  BookOpen,
  AlertTriangle,
} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { SessionState, UpdateSessionPayload } from '@/types/session';
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
import { SimpleTimePickerModal } from '@/components/sessions/simple-time-picker-modal';
import { useDayAvailability, useSessionConflicts } from '@/hooks/use-session-conflicts';

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
    community_service_id: '',
    community_id: '',
    service_id: '',
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
        community_service_id: session.community_service_id || '',
        community_id: '',
        service_id: '',
      });
    }
  }, [session]);

  // Unificamos la obtención de community service en una sola consulta directa
  // Esto elimina la race condition y problemas de caché
  const { data: communityService, isLoading: isLoadingCommunityService } =
    useQuery<CommunityService | null>({
      queryKey: ['communityServiceDetail', session?.id, session?.community_service_id],
      queryFn: async () => {
        if (!session?.community_service_id) {
          console.warn('No community_service_id available');
          return null;
        }
        
        console.log('Fetching community service details for ID:', session.community_service_id);
        try {
          // Usamos directamente la API que obtiene un community service específico
          // en lugar de filtrar una lista
          return await communityServicesApi.getCommunityServiceById(session.community_service_id);
        } catch (error) {
          console.error('Error fetching community service by ID:', error);
          return null;
        }
      },
      enabled: !!session?.community_service_id,
      staleTime: 0, // Evitar uso de caché
      cacheTime: 5000, // Tiempo corto de caché
      retry: 1, // Limitar reintentos
    });

  // Actualizamos formData con los datos del community service (un solo useEffect)
  useEffect(() => {
    if (communityService && session) {
      console.log('Community service details loaded:', communityService);
      
      setFormData((prev) => ({
        ...prev,
        community_id: communityService.community_id,
        service_id: communityService.service_id,
        // Aseguramos que community_service_id siempre esté sincronizado
        community_service_id: session.community_service_id,
      }));
    }
  }, [communityService, session]);

  // Fetch professionals for display
  const { data: professionals } = useQuery({
    queryKey: ['professionals'],
    queryFn: professionalsApi.getProfessionals,
    enabled: !!session && !formData.service_id,
  });

  // Fetch filtered professionals for virtual service
  const {
    data: filteredProfessionals,
    isLoading: isLoadingFilteredProfessionals,
  } = useQuery({
    queryKey: [
      'filteredProfessionals',
      formData.service_id,
      formData.is_virtual,
    ],
    queryFn: () =>
      serviceProfessionalApi.fetchFilteredProfessionals(
        formData.service_id,
        formData.is_virtual || false,
      ),
    enabled: !!formData.service_id && isEditing,
  });

  // Combined professionals list for the dropdown
  const availableProfessionals = useMemo(() => {
    // Always use filtered professionals when we have a service_id
    if (formData.service_id && filteredProfessionals) {
      return filteredProfessionals;
    }
    // Fallback to all professionals only if needed
    return professionals || [];
  }, [professionals, filteredProfessionals, formData.service_id]);

  // Fetch all locals for display in view mode
  const { data: allLocals } = useQuery({
    queryKey: ['locals'],
    queryFn: localsApi.getLocals,
    enabled: !!session && !isEditing,
  });

  // Fetch service-specific locals for edit mode
  const { data: serviceLocals } = useQuery({
    queryKey: ['serviceLocals', formData.service_id],
    queryFn: () =>
      serviceLocalApi.fetchServiceLocals({ serviceId: formData.service_id }),
    enabled:
      !!session && !!formData.service_id && isEditing && !formData.is_virtual,
  });

  // Fetch communities
  const { data: communities, isLoading: isLoadingCommunities } = useQuery({
    queryKey: ['communities'],
    queryFn: communitiesApi.getCommunities,
    enabled: !!session,
  });

  // Fetch services for the community - solo para mostrar información, no para editar
  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ['services', formData.community_id],
    queryFn: () =>
      formData.community_id
        ? communityServicesApi.getServicesByCommunityId(formData.community_id)
        : Promise.resolve([]),
    enabled: !!formData.community_id,
  });

  // Find professional and local details - use useMemo to update when formData changes in edit mode
  const professional = useMemo(() => {
    if (isEditing && formData.is_virtual && filteredProfessionals) {
      return filteredProfessionals.find(
        (p) => p.id === formData.professional_id,
      );
    } else if (!professionals) {
      return null;
    }
    return isEditing
      ? professionals.find((p) => p.id === formData.professional_id)
      : professionals.find((p) => p.id === session?.professional_id);
  }, [
    professionals,
    filteredProfessionals,
    session?.professional_id,
    formData.professional_id,
    formData.is_virtual,
    isEditing,
  ]);

  // Combined locals list for the dropdown
  const availableLocals = useMemo(() => {
    if (isEditing && serviceLocals) {
      // In edit mode, use service-specific locals when available
      return serviceLocals
        .map((sl) => {
          // Find the full local details from all locals if available
          const localDetails = allLocals?.find((l) => l.id === sl.local_id);
          return localDetails || null;
        })
        .filter(Boolean);
    }
    // In view mode or when service locals are not available yet, use all locals
    return allLocals || [];
  }, [isEditing, serviceLocals, allLocals]);

  const local = useMemo(() => {
    if (availableLocals.length === 0) return null;
    return isEditing
      ? availableLocals.find((l) => l.id === formData.local_id)
      : availableLocals.find((l) => l.id === session?.local_id);
  }, [availableLocals, session?.local_id, formData.local_id, isEditing]);

  // Find community and service details
  const community = useMemo(() => {
    if (!communities) return null;
    return communities.find((c) => c.id === formData.community_id);
  }, [communities, formData.community_id]);

  const service = useMemo(() => {
    if (!services) return null;
    return services.find((s) => s.id === formData.service_id);
  }, [services, formData.service_id]);

  // Get selected service details - used only for display, no editing
  const selectedService = services?.find(
    (service) => service.id === formData.service_id,
  );

  // Check if session is virtual - use formData when in edit mode
  const isVirtual = isEditing
    ? formData.is_virtual
    : session && !session.local_id;

  // Obtener disponibilidad del día para el selector de horario cuando está editando
  const availability = useDayAvailability(
    isEditing && formData.date ? formData.date : '',
    isEditing && formData.professional_id ? formData.professional_id : '',
    isEditing && !formData.is_virtual && formData.local_id ? formData.local_id : undefined,
    isEditing ? id : undefined, // Excluir la sesión actual de los conflictos
  );

  // Verificar conflictos cuando se está editando
  const conflictCheck = {
    date: isEditing && formData.date ? formData.date : '',
    startTime: isEditing && formData.start_time ? formData.start_time : '',
    endTime: isEditing && formData.end_time ? formData.end_time : '',
    professionalId: isEditing && formData.professional_id ? formData.professional_id : '',
    localId: isEditing && !formData.is_virtual && formData.local_id ? formData.local_id : undefined,
    excludeSessionId: isEditing ? id : undefined,
  };

  const {
    hasConflict,
    conflicts,
    isLoading: isCheckingConflicts,
  } = useSessionConflicts(conflictCheck);

  // Debug para availability
  useEffect(() => {
    if (isEditing && formData.date && formData.professional_id) {
      console.log('------- AVAILABILITY DEBUG -------');
      console.log('Date:', formData.date);
      console.log('Professional ID:', formData.professional_id);
      console.log('Local ID:', formData.local_id);
      console.log('Is Virtual:', formData.is_virtual);
      console.log('Excluding Session ID:', id);
      console.log('Availability:', availability);
      console.log('Busy Slots:', availability.busySlots);
      availability.busySlots.forEach((slot, index) => {
        console.log(`Slot ${index + 1}:`, {
          start: slot.start,
          end: slot.end,
          title: slot.title,
          type: slot.type
        });
      });
      console.log('-----------------------------------');
    }
  }, [isEditing, formData.date, formData.professional_id, formData.local_id, formData.is_virtual, availability, id]);

  // Debug logging - similar to agregar.tsx
  useEffect(() => {
    if (session) {
      console.log('------- DATOS ACTUALES EN VER.TSX -------');
      console.log('Session data:', session);
      console.log('Session ID:', session.id);
      console.log('Community Service ID (session):', session.community_service_id);
      console.log('Community Service ID (formData):', formData.community_service_id);
      console.log('¿Son iguales?:', session.community_service_id === formData.community_service_id);
      console.log('Communities:', communities);
      console.log('Services:', services);
      console.log('Community Service:', communityService);
      console.log('Form data:', formData);
      console.log('Community:', community);
      console.log('Service:', service);
      console.log('Selected Service:', selectedService);
      console.log('is_virtual:', formData.is_virtual);
      console.log('Filtered Professionals:', filteredProfessionals);
      console.log('Available Professionals:', availableProfessionals);
      console.log('Service Locals:', serviceLocals);
      console.log('Available Locals:', availableLocals);
      console.log('-------------------------------------------');
    }
  }, [
    session,
    communities,
    services,
    communityService,
    formData,
    community,
    service,
    selectedService,
  ]);

  // Update session mutation
  const updateSessionMutation = useMutation({
    mutationFn: (updatedSession: UpdateSessionPayload) => {
      console.log('Sending update request with data:', updatedSession);
      return sessionsApi.updateSession(id, updatedSession);
    },
    onSuccess: (data) => {
      console.log('Update successful. Response:', data);
      
      // Invalidate both the specific session and the sessions list
      queryClient.invalidateQueries({ queryKey: ['session', id] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] }); // Invalidate the sessions list to update it in real-time
      
      refetch(); // Refetch the session data to ensure we have the latest
      setIsEditing(false);
      
      // Show special message if the session was cancelled
      if (formData.state === SessionState.CANCELLED && session?.state !== SessionState.CANCELLED) {
        toast.success('Sesión cancelada', {
          description: 'La sesión ha sido cancelada y todas las reservas asociadas han sido anuladas automáticamente.',
        });
      } else {
        toast.success('Sesión actualizada', {
          description: 'Los cambios han sido guardados correctamente.',
        });
      }
    },
    onError: (error: any) => {
      console.error('Error updating session:', error);
      
      // Detectar si es un error de conflicto específico
      const errorMessage = error?.message || '';
      if (errorMessage.includes('conflicto de horario') || errorMessage.includes('409')) {
        toast.error('Error de Conflicto', {
          description: 'Existe un conflicto de horario con otra sesión. Intenta con un horario diferente.',
        });
      } else if (errorMessage.includes('profesional')) {
        toast.error('Error de Disponibilidad', {
          description: 'El profesional seleccionado no está disponible en este horario.',
        });
      } else if (errorMessage.includes('local')) {
        toast.error('Error de Disponibilidad', {
          description: 'El local seleccionado no está disponible en este horario.',
        });
      } else {
        toast.error('Error', {
          description: 'No se pudo actualizar la sesión. Inténtalo de nuevo.',
        });
      }
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
    // No permitimos cambiar community_id o service_id en la pantalla de ver
    if (name === 'community_id' || name === 'service_id') {
      toast.warning('Operación no permitida', {
        description: 'No se puede cambiar la comunidad o servicio en una sesión existente.',
      });
      return;
    }
    
    // Add warning if the session status is being changed to CANCELLED
    if (name === 'state' && value === SessionState.CANCELLED) {
      toast.warning('Advertencia: Cancelación de sesión', {
        description: 'Al cambiar el estado a CANCELADO, todas las reservas asociadas a esta sesión serán automáticamente anuladas.',
      });
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });

    // If changing the professional_id and we have a virtual service, validate compatibility
    if (
      name === 'professional_id' &&
      formData.is_virtual &&
      formData.service_id &&
      filteredProfessionals
    ) {
      const isValidProfessional = filteredProfessionals.some(
        (p) => p.id === value,
      );
      if (!isValidProfessional) {
        // Show warning but don't auto-reset - let the form validation catch this
        toast.warning('Profesional no disponible', {
          description:
            'El profesional seleccionado no está disponible para este servicio virtual. Por favor seleccione otro.',
        });
      }
    }
  };

  // Handle time range selection from SimpleTimePickerModal
  const handleTimeRangeSelect = (range: { start: string; end: string }) => {
    setFormData({
      ...formData,
      start_time: range.start,
      end_time: range.end,
    });
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

    // Validate that the professional is available for virtual service
    if (formData.is_virtual && formData.service_id && filteredProfessionals) {
      const isValidProfessional = filteredProfessionals.some(
        (p) => p.id === formData.professional_id,
      );
      if (!isValidProfessional) {
        toast.error('Error de validación', {
          description:
            'El profesional seleccionado no está disponible para este servicio virtual.',
        });
        return false;
      }
    }

    if (!formData.community_service_id) {
      // Try to use the community_service_id from the session
      if (session?.community_service_id) {
        setFormData((prev) => ({
          ...prev,
          community_service_id: session.community_service_id || '',
        }));
      } else {
        toast.error('Error de validación', {
          description:
            'No se pudo determinar la asociación comunidad-servicio.',
        });
        return false;
      }
    }

    if (!formData.is_virtual && !formData.local_id) {
      toast.error('Error de validación', {
        description: 'Debe seleccionar un local para sesiones presenciales.',
      });
      return false;
    }

    // Validate that the local is available for the service
    if (!formData.is_virtual && formData.local_id && serviceLocals) {
      const isValidLocal = serviceLocals.some(
        (sl) => sl.local_id === formData.local_id,
      );
      if (!isValidLocal) {
        toast.error('Error de validación', {
          description:
            'El local seleccionado no está disponible para este servicio. Por favor seleccione otro local.',
        });
        return false;
      }
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

    // Verificar si hay conflictos de horario
    if (hasConflict) {
      toast.error('Conflicto de Horario', {
        description:
          'Existen conflictos de horario que deben resolverse primero.',
      });
      return;
    }
    
    // Add a second confirmation when changing to CANCELLED state
    if (formData.state === SessionState.CANCELLED && session?.state !== SessionState.CANCELLED) {
      // Use the browser's confirm dialog for a simple confirmation
      const confirmCancel = window.confirm(
        "IMPORTANTE: Al cancelar esta sesión, todas las reservas asociadas serán anuladas automáticamente.\n\n¿Estás seguro de que deseas continuar?"
      );
      
      if (!confirmCancel) {
        return;
      }
    }

    // Creamos una copia de formData para evitar mutación directa
    const formDataCopy = { ...formData };

    // Siempre usamos el community_service_id de la sesión (fuente confiable)
    if (session?.community_service_id) {
      formDataCopy.community_service_id = session.community_service_id;
    }
    
    // Aseguramos que community_id y service_id no cambien
    if (session && communityService) {
      formDataCopy.community_id = communityService.community_id;
      formDataCopy.service_id = communityService.service_id;
    }

    // Final check before submission
    if (!formDataCopy.community_service_id) {
      toast.error('Datos Incompletos', {
        description:
          'No se pudo obtener la asociación entre comunidad y servicio.',
      });
      return;
    }

    try {
      // Asegurar que las fechas estén en el formato correcto
      const isoDateStr = formDataCopy.date;
      const startTimeStr = formDataCopy.start_time;
      const endTimeStr = formDataCopy.end_time;
      
      // Preparamos el payload para la API
      // Separamos el envío de campos básicos y temporales para facilitar
      // la recuperación en caso de conflictos
      const updatedSession: UpdateSessionPayload = {
        // Datos básicos
        title: formDataCopy.title,
        capacity: parseInt(formDataCopy.capacity.toString()),
        professional_id: formDataCopy.professional_id,
        community_service_id: formDataCopy.community_service_id,
        state: formDataCopy.state as SessionState,
        
        // Datos condicionales
        local_id: formDataCopy.is_virtual ? null : formDataCopy.local_id,
        session_link: formDataCopy.is_virtual ? formDataCopy.session_link : null,
        
        // Datos temporales - enviamos solo la fecha en formato YYYY-MM-DD
        date: isoDateStr,
        
        // Para las horas, enviamos el tiempo como HH:MM:SS
        // El API se encargará de combinarlos correctamente
        start_time: `${startTimeStr}:00`,
        end_time: `${endTimeStr}:00`,
      };

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
                    </h3>{' '}
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
                          {availableProfessionals &&
                          availableProfessionals.length > 0 ? (
                            availableProfessionals.map((prof) => (
                              <SelectItem key={prof.id} value={prof.id}>
                                {`${prof.name} ${prof.first_last_name || ''}`}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-center text-sm text-gray-500">
                              {formData.is_virtual
                                ? 'No hay profesionales disponibles para este servicio virtual.'
                                : 'No hay profesionales disponibles.'}
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      {isEditing &&
                        formData.service_id &&
                        selectedService &&
                        !formData.is_virtual && (
                          <p className="text-blue-600 text-sm mt-1 italic">
                            <AlertTriangle className="inline h-3 w-3 mr-1" />
                            Nota: Profesionales de tipo Médico solo están
                            disponibles para servicios virtuales
                          </p>
                        )}
                    </div>
                  </div>

                  {/* Paso 3: Local (solo para servicios presenciales) */}
                  {(isEditing ? !formData.is_virtual : !isVirtual) && (
                    <div className="space-y-4 border-b pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <span className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                          3
                        </span>
                        Local
                      </h3>
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
                            {availableLocals.length > 0 ? (
                              availableLocals.map((loc) => (
                                <SelectItem key={loc.id} value={loc.id}>
                                  {`${loc.local_name} - ${loc.street_name} ${loc.building_number}`}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-2 text-center text-sm text-gray-500">
                                {isEditing && formData.service_id
                                  ? 'No hay locales disponibles para este servicio.'
                                  : 'No hay locales disponibles.'}
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Paso 3: Enlace (solo para servicios virtuales) */}
                  {(isEditing ? formData.is_virtual : isVirtual) && (
                    <div className="space-y-4 border-b pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <span className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                          3
                        </span>
                        Enlace Virtual
                      </h3>
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
                    </div>
                  )}

                  {/* Paso 4: Horario */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <span className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                        4
                      </span>
                      Horario de la Sesión
                    </h3>
                    <div className="space-y-4">
                      {isEditing ? (
                        <>
                          <div className="flex items-center justify-between">
                            <SimpleTimePickerModal
                              selectedRange={
                                formData.start_time && formData.end_time
                                  ? {
                                      start: formData.start_time,
                                      end: formData.end_time,
                                    }
                                  : undefined
                              }
                              onRangeSelect={handleTimeRangeSelect}
                              occupiedSlots={availability.busySlots}
                              disabled={
                                !formData.date ||
                                !formData.professional_id ||
                                (!formData.is_virtual && !formData.local_id)
                              }
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="start_time">Hora de inicio</Label>
                              <Input
                                id="start_time"
                                name="start_time"
                                type="time"
                                value={formData.start_time}
                                onChange={handleInputChange}
                                className="bg-gray-50"
                                readOnly
                              />
                            </div>
                            <div>
                              <Label htmlFor="end_time">Hora de fin</Label>
                              <Input
                                id="end_time"
                                name="end_time"
                                type="time"
                                value={formData.end_time}
                                onChange={handleInputChange}
                                className="bg-gray-50"
                                readOnly
                              />
                            </div>
                          </div>
                          {/* Leyenda de colores para conflictos */}
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-2">Leyenda de conflictos:</p>
                            <div className="flex flex-wrap gap-4 text-xs">
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                <span className="text-gray-600">Profesional ocupado</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                <span className="text-gray-600">Local ocupado</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                <span className="text-gray-600">Horario seleccionado</span>
                              </div>
                            </div>
                          </div>

                          {/* Alertas de conflictos */}
                          {hasConflict && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <div className="flex items-center text-red-700 font-medium mb-2">
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Conflictos de Horario Detectados
                              </div>
                              <div className="space-y-2">
                                {conflicts.professional.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium text-red-700">
                                      Conflicto de profesional:
                                    </p>
                                    {conflicts.professional.map((session) => (
                                      <div
                                        key={session.id}
                                        className="text-sm text-red-600 bg-red-100 p-2 rounded mt-1"
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
                                    <p className="text-sm font-medium text-red-700">
                                      Conflicto de local:
                                    </p>
                                    {conflicts.local.map((session) => (
                                      <div
                                        key={session.id}
                                        className="text-sm text-red-600 bg-red-100 p-2 rounded mt-1"
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
                        </>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="start_time">Hora de inicio</Label>
                            <Input
                              id="start_time"
                              name="start_time"
                              type="time"
                              value={formattedStartTime}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>
                          <div>
                            <Label htmlFor="end_time">Hora de fin</Label>
                            <Input
                              id="end_time"
                              name="end_time"
                              type="time"
                              value={formattedEndTime}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>
                        </div>
                      )}
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
                          <SelectItem value={SessionState.CANCELLED} className="flex items-center text-red-600">
                            <AlertTriangle className="mr-2 h-4 w-4" />
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

            {/* Comunidad y Servicio */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Building className="mr-2 h-4 w-4" />
                  Comunidad y Servicio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!session?.community_service_id ? (
                  <div className="text-yellow-600 bg-yellow-50 p-3 rounded-md text-sm">
                    <p className="font-medium">Información incompleta</p>
                    <p>
                      Esta sesión no tiene una asociación comunidad-servicio.
                    </p>
                  </div>
                ) : isLoadingCommunities ||
                  isLoadingServices ||
                  isLoadingCommunityService ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span>Cargando información...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-3">
                      <Building className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Comunidad</p>
                        <p className="font-medium">
                          {community
                            ? community.name
                            : 'Comunidad no encontrada'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <BookOpen className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Servicio</p>
                        <p className="font-medium">
                          {service ? service.name : 'Servicio no encontrado'}
                        </p>
                        {service && (
                          <div className="flex items-center gap-1 mt-1">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs ${
                                service.is_virtual
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {service.is_virtual ? 'Virtual' : 'Presencial'}
                            </span>
                          </div>
                        )}
                        {service?.description && (
                          <p className="text-sm text-gray-600 mt-2">
                            {service.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
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
                  disabled={updateSessionMutation.isPending || hasConflict}
                  type="button"
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
