import {
  createFileRoute,
  useNavigate,
  useSearch,
} from '@tanstack/react-router';
import { ReservaConfirmacionRoute } from '@/layouts/reservation-layout';
import { z } from 'zod';
import { useReservation } from '@/context/reservation-context';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Calendar, Clock, User, MapPin, Monitor, Users, Home, Video, MapPinIcon, CalendarDays, Timer } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { reservationsApi } from '@/api/reservations/reservations';
import { professionalsApi } from '@/api/professionals/professionals';
import { communitiesApi } from '@/api/communities/communities';
import { CreateReservationRequest, ReservationState } from '@/types/reservation';
import { useReservationAlert } from '@/components/ui/ReservationAlert';

export const Route = createFileRoute(ReservaConfirmacionRoute)({
  component: ConfirmationStepComponent,
  validateSearch: z.object({
    servicio: z.string().optional(),
  }),
});

function ConfirmationStepComponent() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/reserva/confirmacion' });
  const { reservationData, resetReservation } = useReservation();
  const [reservationCreated, setReservationCreated] = useState(false);
  const [createdReservationId, setCreatedReservationId] = useState<string | null>(null);
  const { error: showErrorAlert, success: showSuccessAlert, AlertComponent } = useReservationAlert();
  
  // Determinar si el servicio es virtual
  const isVirtualService = reservationData.service?.is_virtual || false;

  // Fetch professional data if session exists
  const { data: professionalData } = useQuery({
    queryKey: ['professional', reservationData.session?.professionalId],
    queryFn: () =>
      professionalsApi.getProfessional(reservationData.session!.professionalId),
    enabled: !!reservationData.session?.professionalId,
  });

  // Fetch community data
  const { data: communityData } = useQuery({
    queryKey: ['community', reservationData.communityId],
    queryFn: () =>
      communitiesApi.getCommunityById(reservationData.communityId!),
    enabled: !!reservationData.communityId,
  });

  // Mutation for creating reservation
  const createReservationMutation = useMutation({
    mutationFn: (request: CreateReservationRequest) =>
      reservationsApi.createReservation(request),
    onSuccess: (data) => {
      setReservationCreated(true);
      setCreatedReservationId(data.id);
    },
    onError: (error: any) => {
      console.error('Error creating reservation:', error);
      
      // Manejo específico de errores basado en el código de respuesta
      if (error.message?.includes('409') || error.status === 409) {
        // Error de conflicto - ya existe una reserva en ese horario
        showErrorAlert('Ya tienes una reserva programada para este horario. Por favor, selecciona un horario diferente o cancela tu reserva existente.');
      } else if (error.message?.includes('400') || error.status === 400) {
        // Error de datos inválidos
        showErrorAlert('Los datos de la reserva no son válidos. Por favor, verifica la información e intenta nuevamente.');
      } else if (error.message?.includes('401') || error.status === 401) {
        // Error de autenticación
        showErrorAlert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      } else if (error.message?.includes('403') || error.status === 403) {
        // Error de autorización
        showErrorAlert('No tienes permisos para realizar esta reserva. Verifica tu membresía.');
      } else if (error.message?.includes('500') || error.status === 500) {
        // Error del servidor
        showErrorAlert('Ocurrió un error en el servidor. Por favor, intenta nuevamente en unos minutos.');
      } else {
        // Error genérico
        showErrorAlert('No se pudo crear la reserva. Por favor, verifica tu conexión e intenta nuevamente.');
      }
    },
  });

  const handleConfirm = async () => {
    // Validaciones más estrictas
    if (!reservationData.session || !reservationData.userId) {
      showErrorAlert('Faltan datos necesarios para crear la reserva. Por favor, intenta nuevamente.');
      return;
    }

    const reservationRequest: CreateReservationRequest = {
      name: `Reserva ${reservationData.service?.name || 'Servicio'}`,
      reservation_time: new Date().toISOString(),
      state: ReservationState.CONFIRMED,
      user_id: reservationData.userId,
      session_id: reservationData.session.id,
      // Solo incluir membershipId si está presente
      ...(reservationData.membershipId && { membership_id: reservationData.membershipId }),
    };

    createReservationMutation.mutate(reservationRequest);
  };

  const handleBack = () => {
    navigate({
      to: '/reserva/horario',
      search: { servicio: search.servicio },
    });
  };

  const handleGoToCommunities = () => {
    resetReservation();
    navigate({ to: '/mis-comunidades' });
  };

  const formatDate = (dateStr?: string) => {
    if (reservationData.session?.date) {
      const sessionDate = new Date(reservationData.session.date);
      const months = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
      ];
      return `${sessionDate.getDate()} de ${months[sessionDate.getMonth()]} del ${sessionDate.getFullYear()}`;
    }

    if (!dateStr) return '';
    const [day, month] = dateStr.split('/');
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
    ];
    return `${day} de ${months[parseInt(month) - 1]} del 2025`;
  };

  const formatSessionTime = () => {
    if (!reservationData.session) return '';
    const startTime = new Date(reservationData.session.startTime);
    const endTime = new Date(reservationData.session.endTime);
    return `${startTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (!reservationData.service) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">
          No hay información de reserva disponible.
        </p>
        <Button onClick={() => navigate({ to: '/reserva/servicios' })}>
          Comenzar nueva reserva
        </Button>
      </div>
    );
  }

  if (reservationCreated) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-8 rounded-xl shadow-lg">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-3 text-green-800">
              ¡Reserva Confirmada!
            </h2>
            <p className="text-green-700 text-lg">
              Tu reserva se ha creado exitosamente
            </p>
          </div>

          <div className="text-center">
            <Button 
              onClick={handleGoToCommunities} 
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Ir a mis comunidades
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gray-900 text-white p-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">Confirmar Reserva</h2>
                <p className="text-gray-300 text-lg">
                  Revisa los detalles de tu reserva antes de confirmar
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="space-y-8">
                {/* Información principal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-sky-50 border border-sky-100 rounded-lg">
                      <div className="w-10 h-10 bg-sky-300 rounded-full flex items-center justify-center shadow-sm">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm text-sky-600 font-medium">Comunidad</div>
                        <div className="font-semibold text-gray-900">
                          {communityData?.name || 'ZenCat Wellness Community'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-sky-50 border border-sky-100 rounded-lg">
                      <div className="w-10 h-10 bg-sky-300 rounded-full flex items-center justify-center shadow-sm">
                        {isVirtualService ? (
                          <Video className="w-5 h-5 text-white" />
                        ) : (
                          <Home className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm text-sky-600 font-medium">Servicio</div>
                        <div className="font-semibold text-gray-900">
                          {reservationData.service.name}
                        </div>
                        <div className="text-sm text-sky-600 font-medium">
                          {isVirtualService ? 'Virtual' : 'Presencial'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-sky-50 border border-sky-100 rounded-lg">
                      <div className="w-10 h-10 bg-sky-300 rounded-full flex items-center justify-center shadow-sm">
                        <CalendarDays className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm text-sky-600 font-medium">Fecha</div>
                        <div className="font-semibold text-gray-900">{formatDate()}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-sky-50 border border-sky-100 rounded-lg">
                      <div className="w-10 h-10 bg-sky-300 rounded-full flex items-center justify-center shadow-sm">
                        <Timer className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm text-sky-600 font-medium">Horario</div>
                        <div className="font-semibold text-gray-900">
                          {formatSessionTime()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información específica por modalidad */}
                {isVirtualService ? (
                                   // Información para servicios virtuales
                   <div className="border-t pt-6">
                     <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                       <div className="w-6 h-6 bg-emerald-300 rounded-full flex items-center justify-center">
                         <Video className="w-4 h-4 text-white" />
                       </div>
                       Información del Servicio Virtual
                     </h3>
                     <div className="space-y-4">
                       {reservationData.professional && (
                         <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                           <div className="w-10 h-10 bg-emerald-300 rounded-full flex items-center justify-center shadow-sm">
                             <User className="w-5 h-5 text-white" />
                           </div>
                           <div>
                             <div className="text-sm text-emerald-600 font-medium">Profesional</div>
                             <div className="font-semibold text-gray-900">
                               {reservationData.professional.name} {reservationData.professional.first_last_name}
                               {reservationData.professional.second_last_name && ` ${reservationData.professional.second_last_name}`}
                             </div>
                           </div>
                         </div>
                       )}
                       
                       {/* Enlace de la sesión virtual */}
                       {reservationData.session && (
                         <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                           <div className="flex items-start gap-3">
                             <div className="w-10 h-10 bg-emerald-300 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                               <Monitor className="w-5 h-5 text-white" />
                             </div>
                             <div className="flex-1 min-w-0">
                               <div className="text-sm font-medium text-gray-900 mb-2">Enlace de acceso a la sesión</div>
                               {reservationData.session.sessionLink ? (
                                 <div className="font-mono text-sm bg-white px-3 py-2 rounded border border-gray-200 text-emerald-600 break-all mb-2">
                                   {reservationData.session.sessionLink}
                                 </div>
                               ) : (
                                 <div className="bg-amber-50 border border-amber-200 px-3 py-2 rounded text-amber-700 text-sm">
                                   <div className="flex items-center gap-2">
                                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                       <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                     </svg>
                                     El enlace aún no está disponible para la sesión
                                   </div>
                                 </div>
                               )}
                             </div>
                           </div>
                         </div>
                       )}
                     </div>
                   </div>
                ) : (
                  // Información para servicios presenciales
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-6 h-6 bg-emerald-300 rounded-full flex items-center justify-center">
                        <MapPinIcon className="w-4 h-4 text-white" />
                      </div>
                      Información del Lugar
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                        <div className="w-10 h-10 bg-emerald-300 rounded-full flex items-center justify-center shadow-sm">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm text-emerald-600 font-medium">Lugar</div>
                          <div className="font-semibold text-gray-900">
                            {reservationData.location?.name || 'Pabellón A'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {reservationData.location?.district || 'San Miguel'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                        <div className="w-10 h-10 bg-emerald-300 rounded-full flex items-center justify-center shadow-sm">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm text-emerald-600 font-medium">Instructor</div>
                          <div className="font-semibold text-gray-900">
                            {professionalData
                              ? `${professionalData.name} ${professionalData.first_last_name}`
                              : 'Instructor asignado'}
                          </div>
                        </div>
                      </div>
                    </div>
                    {reservationData.location?.address && (
                      <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                        <div className="text-sm text-emerald-600 mb-1 font-medium">Dirección completa</div>
                        <div className="font-medium text-gray-900">{reservationData.location.address}</div>
                      </div>
                    )}
                  </div>
                )}

                               {/* Información de la sesión */}
                 {reservationData.session && (
                   <div className="border-t pt-6">
                     <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                       <div className="w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center">
                         <Calendar className="w-4 h-4 text-white" />
                       </div>
                       Detalles de la Sesión
                     </h3>
                     <div className="bg-slate-50 border border-slate-100 p-6 rounded-xl shadow-sm">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-slate-300 rounded-full flex items-center justify-center shadow-sm">
                           <Clock className="w-6 h-6 text-white" />
                         </div>
                         <div className="flex-1">
                           <div className="font-bold text-gray-900 text-xl mb-1">
                             {reservationData.session.title}
                           </div>
                           <div className="flex items-center gap-4 text-sm text-slate-600">
                             <span className="flex items-center gap-1">
                               <Users className="w-4 h-4" />
                               Capacidad: {reservationData.session.capacity} personas
                             </span>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                 )}

                               {/* Mensaje informativo */}
                 <div className="bg-sky-50 border border-sky-100 p-4 rounded-lg">
                   <p className="text-sky-600 text-center font-medium">
                     {isVirtualService ? (
                       "Asegúrate de tener una conexión estable a internet y únete unos minutos antes"
                     ) : (
                       "No olvides llegar puntual a tu reserva"
                     )}
                   </p>
                 </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-3"
              disabled={createReservationMutation.isPending}
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </Button>

            <Button
              onClick={handleConfirm}
              disabled={createReservationMutation.isPending}
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {createReservationMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  Confirmando...
                </>
              ) : (
                'Confirmar reserva'
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Componente de Alerta */}
      <AlertComponent />
    </>
  );
}
