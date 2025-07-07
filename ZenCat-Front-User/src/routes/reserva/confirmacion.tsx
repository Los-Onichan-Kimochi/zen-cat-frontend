import {
  createFileRoute,
  useNavigate,
  useSearch,
} from '@tanstack/react-router';
import { ReservaConfirmacionRoute } from '@/layouts/reservation-layout';
import { z } from 'zod';
import { useReservation } from '@/context/reservation-context';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { reservationsApi } from '@/api/reservations/reservations';
import { professionalsApi } from '@/api/professionals/professionals';
import { communitiesApi } from '@/api/communities/communities';
import {
  CreateReservationRequest,
  ReservationState,
} from '@/types/reservation';
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
  const [createdReservationId, setCreatedReservationId] = useState<
    string | null
  >(null);
  console.log(reservationData);
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
    onError: (error) => {
      console.error('Error creating reservation:', error);
      alert('Error al crear la reserva. Por favor, inténtalo de nuevo.');
    },
  });

  const handleConfirm = async () => {
    if (!reservationData.session || !reservationData.userId) {
      alert('Faltan datos para crear la reserva');
      return;
    }

    const reservationRequest: CreateReservationRequest = {
      name: `Reserva ${reservationData.service?.name || 'Servicio'}`,
      reservation_time: new Date().toISOString(),
      state: ReservationState.CONFIRMED,
      user_id: reservationData.userId,
      session_id: reservationData.session.id,
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
    navigate({ to: '/comunidades' });
  };

  const formatDate = (dateStr?: string) => {
    if (reservationData.session?.date) {
      const sessionDate = new Date(reservationData.session.date);
      const months = [
        'enero',
        'febrero',
        'marzo',
        'abril',
        'mayo',
        'junio',
        'julio',
        'agosto',
        'septiembre',
        'octubre',
        'noviembre',
        'diciembre',
      ];
      return `${sessionDate.getDate()} de ${months[sessionDate.getMonth()]} del ${sessionDate.getFullYear()}`;
    }

    if (!dateStr) return '';
    const [day, month] = dateStr.split('/');
    const months = [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ];
    return `${day} de ${months[parseInt(month) - 1]} del 2025`;
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    return `${time} h - 08:00 h`;
  };

  const formatSessionTime = () => {
    if (!reservationData.session) return '';
    const startTime = new Date(reservationData.session.startTime);
    const endTime = new Date(reservationData.session.endTime);
    return `${startTime.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false })} h - ${endTime.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false })} h`;
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
        <div className="border p-8 rounded-md bg-green-50">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-green-800">
              ¡Reserva Confirmada!
            </h2>
            <p className="text-green-700">
              Tu reserva se ha creado exitosamente
            </p>
            {createdReservationId && (
              <p className="text-sm text-green-600 mt-2">
                ID de reserva: {createdReservationId}
              </p>
            )}
          </div>

          <div className="text-center">
            <Button onClick={handleGoToCommunities} className="mr-4">
              Ir a mis comunidades
            </Button>
            <Button variant="outline">Descargar comprobante</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-2xl mx-auto">
        <div className="border p-8 rounded-md bg-white">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Reserva realizada</h2>
            <p className="text-gray-600">
              Tu reserva se ha registrado correctamente
            </p>
          </div>

          <div className="space-y-6">
            {/* Información de la comunidad y servicio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Comunidad</div>
                <div className="font-semibold">
                  {communityData?.name || 'ZenCat Wellness Community'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Servicio</div>
                <div className="font-semibold">
                  {reservationData.service.name}
                </div>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Información de lugar y fecha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Lugar</div>
                <div className="font-semibold">
                  {reservationData.location?.pavilion || 'Pabellón A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Fecha</div>
                <div className="font-semibold">{formatDate()}</div>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Información de dirección y horario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Dirección</div>
                <div className="font-semibold">
                  {reservationData.location?.address || 'Av. Universitaria 100'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Hora</div>
                <div className="font-semibold">
                  {reservationData.session
                    ? formatSessionTime()
                    : formatTime(reservationData.time || '')}
                </div>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Información de capacidad y sesión */}
            {reservationData.session && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Capacidad</div>
                    <div className="font-semibold">
                      {reservationData.session.capacity} personas
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      Reservas actuales
                    </div>
                    <div className="font-semibold">
                      {reservationData.session.registeredCount + 1} /{' '}
                      {reservationData.session.capacity}
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200" />
              </>
            )}

            {/* Información del salón y distrito */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Salón</div>
                <div className="font-semibold">
                  {reservationData.session?.title || 'A201'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Distrito</div>
                <div className="font-semibold">
                  {reservationData.location?.district || 'San Miguel'}
                </div>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Información del profesor */}
            <div>
              <div className="text-sm text-gray-600 mb-1">Profesor</div>
              <div className="font-semibold">
                {professionalData
                  ? `${professionalData.name} ${professionalData.first_last_name}`
                  : 'Instructor asignado'}
              </div>
            </div>

            {/* Mensaje adicional */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 text-center">
                No olvides llegar puntual a tu reserva
              </p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2"
            disabled={createReservationMutation.isPending}
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </Button>

          <div className="flex gap-4">
            <Button variant="outline">Descargar ticket</Button>
            <Button
              onClick={handleConfirm}
              disabled={createReservationMutation.isPending}
              className="min-w-[140px]"
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
    </div>
  );
}
