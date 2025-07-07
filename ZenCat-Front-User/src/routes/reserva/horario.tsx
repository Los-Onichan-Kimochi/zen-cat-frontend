import {
  createFileRoute,
  useNavigate,
  useSearch,
} from '@tanstack/react-router';
import { ReservaHorarioRoute } from '@/layouts/reservation-layout';
import { z } from 'zod';
import { useReservation } from '@/context/reservation-context';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sessionsApi, Session } from '@/api/sessions/sessions';
import { professionalsApi } from '@/api/professionals/professionals';
import { serviceProfessionalsApi } from '@/api/service-professionals/service-professionals';
import { TimeSlotCalendar } from '@/components/ui/time-slot-calendar';
import { localsApi } from '@/api/locals/locals';
import { communityServicesApi } from '@/api/communities/community-services';
import { CommunityService } from '@/types/community-service';
import { reservationsApi } from '@/api/reservations/reservations';
import { Reservation } from '@/types/reservation';

export const Route = createFileRoute(ReservaHorarioRoute)({
  component: ScheduleStepComponent,
  validateSearch: z.object({
    servicio: z.string().optional(),
  }),
});

interface TimeSlot {
  time: string;
  available: boolean;
  sessionId?: string;
  capacity?: number;
  registeredCount?: number;
  professionalName?: string;
  sessionTitle?: string;
}

const daysOfWeek = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
const months = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

function ScheduleStepComponent() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/reserva/horario' });
  const { reservationData, updateReservation } = useReservation();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const [currentMonth, setCurrentMonth] = useState(() => new Date()); // Usar la fecha actual

  // Fetch service-professional associations if a service is selected
  const {
    data: serviceProfessionals = [],
    isLoading: isLoadingServiceProfessionals,
  } = useQuery({
    queryKey: ['service-professionals', reservationData.service?.id],
    queryFn: () =>
      serviceProfessionalsApi.getProfessionalsForService(
        reservationData.service!.id,
      ),
    enabled: !!reservationData.service?.id,
  });

  // Extract professional IDs from service-professional associations
  const availableProfessionalIds = serviceProfessionals.map(
    (sp) => sp.professional_id,
  );

  // Fetch all professionals
  const { data: professionalsData = [], isLoading: isLoadingProfessionals } =
    useQuery({
      queryKey: ['professionals'],
      queryFn: () => professionalsApi.getProfessionals(),
    });

  // Fetch all locals
  const { data: localsData = [], isLoading: isLoadingLocals } = useQuery({
    queryKey: ['locals'],
    queryFn: () => localsApi.getLocals(),
  });

  // Obtener el community service único basado en community_id y service_id
  const {
    data: communityServiceData = [],
    isLoading: isLoadingCommunityService,
    error: errorCommunityService,
  } = useQuery<CommunityService[], Error>({
    queryKey: [
      'communityService',
      reservationData.communityId,
      reservationData.service?.id,
    ],
    queryFn: () =>
      communityServicesApi.getCommunityServices(
        [reservationData.communityId!],
        [reservationData.service?.id!],
      ),
    enabled: !!reservationData.communityId && !!reservationData.service?.id,
  });

  // Obtener el community_service_id único
  const communityServiceId =
    communityServiceData.length > 0 ? communityServiceData[0].id : null;

  // Fetch sessions basado en el community_service_id único
  const {
    data: sessionsData = [],
    isLoading: isLoadingSessions,
    error,
  } = useQuery<Session[], Error>({
    queryKey: ['sessions', communityServiceId],
    queryFn: () => sessionsApi.getSessions(),
    enabled: !!communityServiceId,
  });

  // Fetch user reservations para identificar sesiones donde ya tiene reservas
  const { data: userReservations = [], isLoading: isLoadingReservations } =
    useQuery<Reservation[], Error>({
      queryKey: ['user-reservations', reservationData.communityId, user?.id],
      queryFn: () => {
        if (!reservationData.communityId || !user?.id) {
          throw new Error('Missing required parameters');
        }
        return reservationsApi.getReservationsByCommunityAndUser(
          reservationData.communityId,
          user.id,
        );
      },
      enabled: !!reservationData.communityId && !!user?.id,
    });

  const isLoading =
    isLoadingServiceProfessionals ||
    isLoadingProfessionals ||
    isLoadingLocals ||
    isLoadingSessions ||
    isLoadingCommunityService ||
    isLoadingReservations;

  // Filter sessions by community_service_id, location and service-professional associations
  console.log('Filtrar');
  const filteredSessions = sessionsData.filter((session: Session) => {
    // Filtrar por community_service_id si está disponible
    if (communityServiceId && session.community_service_id) {
      if (session.community_service_id !== communityServiceId) {
        return false;
      }
    }

    // Filter by location if selected
    if (reservationData.location?.id && session.local_id) {
      if (session.local_id !== reservationData.location.id) {
        return false;
      }
    }

    // Filter by service-professional associations if service is selected
    if (reservationData.service?.id && session.professional_id) {
      if (!availableProfessionalIds.includes(session.professional_id)) {
        return false;
      }
    }
    return true;
  });

  console.log('Sessions filtradas: ', filteredSessions);

  // Crear un Set de session_ids donde el usuario ya tiene reservas
  const userReservedSessionIds = new Set(
    userReservations
      .filter((reservation) => reservation.state === 'CONFIRMED') // Solo reservas confirmadas
      .map((reservation) => reservation.session_id),
  );

  // Generar fechas disponibles (próximos 7 días)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        label: `${date.getDate()}/${String(date.getMonth() + 1).padStart(2, '0')}`,
        fullDate: `${date.getDate()}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`,
      });
    }

    return dates;
  };

  const availableDates = getAvailableDates();

  // Verificar si una fecha está entre las disponibles (próximos 7 días)
  const isDateAvailable = (day: number, month: number) => {
    return availableDates.some(
      (date) => date.day === day && date.month === month,
    );
  };

  // Calcular días del mes actual para el calendario
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0,
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1,
  ).getDay();

  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Ajustar para que lunes sea 0

  // Convertir las sesiones al formato requerido por TimeSlotCalendar
  const convertedOccupiedSlots = filteredSessions.map((session: Session) => {
    const professional = professionalsData.find(
      (p) => p.id === session.professional_id,
    );
    const local = localsData.find((l) => l.id === session.local_id);
    const sessionDate = new Date(session.date);
    const dateLabel = `${sessionDate.getDate()}/${String(sessionDate.getMonth() + 1).padStart(2, '0')}`;

    // Convertir las horas UTC a hora local
    const startTimeUTC = new Date(session.start_time);
    const endTimeUTC = new Date(session.end_time);

    // Formatear las horas en formato local (HH:MM)
    const startTimeLocal = startTimeUTC.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const endTimeLocal = endTimeUTC.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    // Determinar el estado de la sesión
    const isUserReserved = userReservedSessionIds.has(session.id);
    const isFullyBooked = session.registered_count >= session.capacity;

    return {
      date: dateLabel,
      start: startTimeLocal,
      end: endTimeLocal,
      title: session.title,
      type: 'professional' as const,
      sessionId: session.id,
      isUserReserved,
      isFullyBooked,
      sessionInfo: {
        title: session.title,
        professional: professional
          ? `${professional.name} ${professional.first_last_name}`
          : 'No asignado',
        location: local ? local.local_name : 'No especificado',
        capacity: session.capacity,
        registered: session.registered_count,
      },
    };
  });

  const handleDateSelect = (day: number) => {
    // Solo permitir seleccionar fechas de los próximos 7 días
    if (!isDateAvailable(day, currentMonth.getMonth() + 1)) return;

    const dateStr = `${day}/${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setSelectedTime(null);
    setSelectedSessionId(null);
  };

  const handleTimeRangeSelect = (
    range: { start: string; end: string },
    date: string,
  ) => {
    setSelectedTime(range.start);
    setSelectedDate(date);

    // Buscar la sesión que coincide con este horario y fecha
    const matchingSession = filteredSessions.find((session: Session) => {
      const sessionDate = new Date(session.date);
      const sessionDateStr = `${sessionDate.getDate()}/${String(sessionDate.getMonth() + 1).padStart(2, '0')}`;

      // Convertir la hora UTC a hora local para la comparación
      const startTimeUTC = new Date(session.start_time);
      const sessionTimeLocal = startTimeUTC.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      return sessionDateStr === date && sessionTimeLocal === range.start;
    });

    if (matchingSession) {
      setSelectedSessionId(matchingSession.id);

      updateReservation({
        date: date,
        time: range.start,
        session: {
          id: matchingSession.id,
          title: matchingSession.title,
          date: matchingSession.date,
          startTime: matchingSession.start_time,
          endTime: matchingSession.end_time,
          capacity: matchingSession.capacity,
          registeredCount: matchingSession.registered_count,
          professionalId: matchingSession.professional_id,
          localId: matchingSession.local_id,
          sessionLink: matchingSession.session_link,
        },
        userId: user?.id,
      });
    }
  };

  const handleContinue = () => {
    if (selectedDate && selectedTime && selectedSessionId) {
      navigate({
        to: '/reserva/confirmacion',
        search: { servicio: search.servicio },
      });
    }
  };

  const handleBack = () => {
    navigate({
      to: '/reserva/location-professional',
      search: { servicio: search.servicio },
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendarDays = () => {
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isAvailable = isDateAvailable(day, currentMonth.getMonth() + 1);
      const dateStr = `${day}/${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
      const isSelected = selectedDate === dateStr;

      // Verificar si es hoy
      const today = new Date();
      const isToday =
        day === today.getDate() &&
        currentMonth.getMonth() === today.getMonth() &&
        currentMonth.getFullYear() === today.getFullYear();

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          disabled={!isAvailable}
          className={`
            w-8 h-8 flex items-center justify-center text-sm rounded-md
            ${isSelected ? 'bg-black text-white' : ''}
            ${isToday && !isSelected ? 'bg-gray-200' : ''}
            ${isAvailable ? 'hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}
            transition-colors
          `}
        >
          {day}
        </button>,
      );
    }

    return days;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="animate-spin w-12 h-12 mx-auto mb-4" />
          <p className="text-gray-600">Cargando horarios disponibles...</p>
        </div>
      </div>
    );
  }

  if (error || errorCommunityService) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">
          Error al cargar los horarios:{' '}
          {error?.message || errorCommunityService?.message}
        </p>
        <Button onClick={() => window.location.reload()}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div>
      {/* Mensaje informativo sobre filtros aplicados */}
      {(reservationData.service || reservationData.location) && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <h4 className="font-semibold text-blue-800 mb-2">
            Filtros aplicados:
          </h4>
          <div className="text-blue-700 text-sm space-y-1">
            {reservationData.service && (
              <p>
                • Servicio:{' '}
                <span className="font-medium">
                  {reservationData.service.name}
                </span>
              </p>
            )}
            {reservationData.location && (
              <p>
                • Ubicación:{' '}
                <span className="font-medium">
                  {reservationData.location.pavilion}
                </span>{' '}
                - {reservationData.location.district}
              </p>
            )}
            <p className="text-xs text-blue-600 mt-2">
              Solo se muestran horarios disponibles para los filtros
              seleccionados.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Calendario */}
        <div className="border p-4 rounded-md flex flex-col w-full h-[450px] bg-white">
          <div className="mb-4 w-full text-center">
            <h3 className="text-2xl font-bold mb-2">Fechas disponibles</h3>
            <p className="text-xs text-gray-600">
              Puedes hacer reservas hasta con
              <br />7 días de anticipación
            </p>
          </div>

          {/* Navegación del mes */}
          <div className="flex items-center justify-between mb-4 w-full">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h4 className="font-semibold text-sm">
              {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h4>
            <button
              onClick={() => navigateMonth('next')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 mb-2 w-full">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-600 py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Días del calendario - ocupar el espacio restante */}
          <div className="grid grid-cols-7 gap-1 w-full flex-1 content-start">
            {renderCalendarDays()}
          </div>
        </div>

        {/* Tabla de horarios con altura igual al calendario */}
        <div className="col-span-2 h-[450px]">
          <TimeSlotCalendar
            selectedRange={
              selectedTime ? { start: selectedTime, end: '' } : undefined
            }
            onRangeSelect={handleTimeRangeSelect}
            occupiedSlots={convertedOccupiedSlots}
            startHour={8}
            endHour={21}
            slotDuration={60}
            disabled={false}
            selectedDate={selectedDate || undefined}
          />
        </div>
      </div>

      {/* Leyenda de colores */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
        <h4 className="font-semibold text-gray-800 mb-3">Leyenda:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-gray-700">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-black text-white border border-black rounded flex items-center justify-center">
              <span className="text-xs text-white">✓</span>
            </div>
            <span className="text-gray-700">Seleccionado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
            <span className="text-gray-700">Ya reservado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
            <span className="text-gray-700">Lleno</span>
          </div>
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!selectedDate || !selectedTime || !selectedSessionId}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
