import {
  createFileRoute,
  useNavigate,
  useSearch,
} from '@tanstack/react-router';
import { ReservaHorarioRoute } from '@/layouts/reservation-layout';
import { z } from 'zod';
import { useReservation } from '@/context/reservation-context';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sessionsApi, Session } from '@/api/sessions/sessions';
import { professionalsApi } from '@/api/professionals/professionals';
import { serviceProfessionalsApi } from '@/api/service-professionals/service-professionals';
import {ProtectedRoute} from '@/components/auth/ProtectedRoute';

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

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 6)); // Julio 2025

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

  // Fetch all sessions
  const {
    data: sessionsData = [],
    isLoading: isLoadingSessions,
    error,
  } = useQuery<Session[], Error>({
    queryKey: ['sessions'],
    queryFn: sessionsApi.getSessions,
  });

  const isLoading =
    isLoadingServiceProfessionals ||
    isLoadingProfessionals ||
    isLoadingSessions;

  // Filter sessions by location and service-professional associations
  const filteredSessions = sessionsData.filter((session) => {
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

  const today = new Date();
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

  // Generate time slots for the selected date
  const getTimeSlotsForDate = (dateStr: string): TimeSlot[] => {
    if (!dateStr) return [];

    const [day, month] = dateStr.split('/');
    const year = currentMonth.getFullYear();
    const targetDate = new Date(year, parseInt(month) - 1, parseInt(day));
    const targetDateStr = targetDate.toISOString().split('T')[0];

    // Find sessions for this date
    const sessionsForDate = filteredSessions.filter((session) => {
      const sessionDate = new Date(session.date).toISOString().split('T')[0];
      return sessionDate === targetDateStr;
    });

    // Generate time slots from 5:00 to 13:00
    const timeSlots: TimeSlot[] = [];
    for (let hour = 5; hour <= 13; hour++) {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;

      // Check if there's a session at this time
      const sessionAtTime = sessionsForDate.find((session) => {
        const sessionHour = new Date(session.start_time).getHours();
        return sessionHour === hour;
      });

      // Get professional name if session exists
      let professionalName = '';
      if (sessionAtTime?.professional_id) {
        const professional = professionalsData.find(
          (p) => p.id === sessionAtTime.professional_id,
        );
        professionalName = professional
          ? `${professional.name} ${professional.first_last_name}`
          : '';
      }

      timeSlots.push({
        time: timeStr,
        available:
          !!sessionAtTime &&
          sessionAtTime.registered_count < sessionAtTime.capacity,
        sessionId: sessionAtTime?.id,
        capacity: sessionAtTime?.capacity,
        registeredCount: sessionAtTime?.registered_count,
        professionalName,
        sessionTitle: sessionAtTime?.title,
      });
    }

    return timeSlots;
  };

  const handleDateSelect = (day: number) => {
    const dateStr = `${day}/${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setSelectedTime(null);
    setSelectedSessionId(null);
  };

  const handleTimeSelect = (timeSlot: TimeSlot) => {
    if (!timeSlot.available || !timeSlot.sessionId) return;

    setSelectedTime(timeSlot.time);
    setSelectedSessionId(timeSlot.sessionId);

    // Find the full session data
    const session = filteredSessions.find((s) => s.id === timeSlot.sessionId);
    if (session) {
      updateReservation({
        date: selectedDate || '',
        time: timeSlot.time,
        session: {
          id: session.id,
          title: session.title,
          date: session.date,
          startTime: session.start_time,
          endTime: session.end_time,
          capacity: session.capacity,
          registeredCount: session.registered_count,
          professionalId: session.professional_id,
          localId: session.local_id,
        },
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
      to: '/reserva/lugar',
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
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedSessionId(null);
  };

  const renderCalendarDays = () => {
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(<div key={`empty-${i}`} className=""></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${day}/${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
      const isSelected = selectedDate === dateStr;
      const isToday = day === 15; // Highlighting day 15 as shown in the image

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          className={`
            w-8 h-8 flex items-center justify-center text-sm rounded-md
            ${isSelected ? 'bg-black text-white' : ''}
            ${isToday && !isSelected ? 'bg-gray-200' : ''}
            hover:bg-gray-100 transition-colors
          `}
        >
          {day}
        </button>,
      );
    }

    return days;
  };

  const generateDates = () => {
    const dates = [];
    const currentDate = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i);
      dates.push({
        day: date.getDate(),
        month: date.getMonth() + 1,
        label: `${date.getDate()}/${String(date.getMonth() + 1).padStart(2, '0')}`,
      });
    }

    return dates;
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

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">
          Error al cargar los horarios: {error.message}
        </p>
        <Button onClick={() => window.location.reload()}>Reintentar</Button>
      </div>
    );
  }

  const timeSlots = selectedDate ? getTimeSlotsForDate(selectedDate) : [];

  return (
    <ProtectedRoute>
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
                    {reservationData.location.name}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendario */}
          <div className="border p-6 rounded-md">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Fechas disponibles</h3>
              <p className="text-sm text-gray-600">
                Puedes hacer reservas hasta con
                <br />7 días de anticipación
              </p>
            </div>

            {/* Navegación del mes */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h4 className="font-semibold">
                {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h4>
              <button
                onClick={() => navigateMonth('next')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-gray-600 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Días del calendario */}
            <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>
          </div>

          {/* Horarios */}
          <div className="border p-6 rounded-md">
            <h3 className="text-lg font-semibold mb-4">Horarios disponibles</h3>

            {/* Header de fechas */}
            <div className="grid grid-cols-8 gap-1 mb-4">
              <div className="text-sm font-medium text-center">Hora</div>
              {generateDates().map((date, index) => (
                <div key={index} className="text-xs text-center font-medium">
                  {date.label}
                </div>
              ))}
            </div>

            {/* Horarios */}
            <div className="space-y-1">
              {timeSlots.map((slot) => (
                <div
                  key={slot.time}
                  className="grid grid-cols-8 gap-1 items-center"
                >
                  <div className="text-sm font-medium text-center">
                    {slot.time} h
                  </div>
                  {generateDates().map((date, index) => (
                    <div
                      key={index}
                      className="h-8 flex items-center justify-center"
                    >
                      {slot.available ? (
                        <button
                          onClick={() => handleTimeSelect(slot)}
                          className={`w-full h-full text-xs rounded text-center flex flex-col items-center justify-center p-1
                          ${
                            selectedTime === slot.time &&
                            selectedDate === date.label
                              ? 'bg-black text-white'
                              : 'bg-green-100 hover:bg-green-200 border border-green-300'
                          }`}
                          title={`${slot.sessionTitle || 'Sesión disponible'}
Profesional: ${slot.professionalName || 'No asignado'}
Capacidad: ${slot.capacity}, Reservados: ${slot.registeredCount}
Disponibles: ${slot.capacity && slot.registeredCount ? slot.capacity - slot.registeredCount : 'N/A'}`}
                        >
                          <div className="font-medium">
                            {slot.capacity && slot.registeredCount
                              ? `${slot.capacity - slot.registeredCount}`
                              : '✓'}
                          </div>
                          {slot.professionalName && (
                            <div className="text-[10px] truncate w-full">
                              {slot.professionalName.split(' ')[0]}
                            </div>
                          )}
                        </button>
                      ) : (
                        <div
                          className="w-full h-full bg-gray-100 rounded border border-gray-200"
                          title="No disponible"
                        ></div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
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
    </ProtectedRoute>
  );
}
