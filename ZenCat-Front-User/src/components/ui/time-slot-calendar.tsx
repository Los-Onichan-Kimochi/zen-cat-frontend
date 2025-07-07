import React, { useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

export interface TimeSlotCalendarProps {
  selectedRange?: { start: string; end: string };
  onRangeSelect: (range: { start: string; end: string }, date: string) => void;
  occupiedSlots?: {
    date: string;
    start: string;
    end: string;
    title?: string;
    type?: 'professional' | 'local';
    sessionId?: string;
    isUserReserved?: boolean;
    isFullyBooked?: boolean;
    sessionInfo?: {
      title: string;
      professional: string;
      location: string;
      capacity: number;
      registered: number;
    };
  }[];
  startHour?: number;
  endHour?: number;
  slotDuration?: number;
  disabled?: boolean;
  selectedDate?: string;
}

export function TimeSlotCalendar({
  selectedRange,
  onRangeSelect,
  occupiedSlots = [],
  startHour = 5,
  endHour = 21,
  slotDuration = 30,
  disabled = false,
  selectedDate,
}: TimeSlotCalendarProps) {
  // Generar fechas para la vista horizontal (7 días desde hoy)
  const dates = useMemo(() => {
    const result = [];
    const currentDate = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i);
      result.push({
        day: date.getDate(),
        month: date.getMonth() + 1,
        label: `${date.getDate()}/${String(date.getMonth() + 1).padStart(2, '0')}`,
        weekday: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'][date.getDay()],
      });
    }
    return result;
  }, []);

  // Generar horas para mostrar en la columna izquierda
  const hours = useMemo(() => {
    const result = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      result.push(`${String(hour).padStart(2, '0')}:00`);
    }
    return result;
  }, [startHour, endHour]);

  // Convertir hora a minutos desde medianoche
  const timeToMinutes = useCallback((time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  }, []);

  // Calcular posición y altura de un bloque de sesión
  const getSessionPosition = useCallback(
    (start: string, end: string) => {
      const startMinutes = timeToMinutes(start);
      const endMinutes = timeToMinutes(end);
      const startHourMinutes = startHour * 60;

      // Cada hora ocupa 60px
      const pixelsPerMinute = 60 / 60; // 1px por minuto
      const top = (startMinutes - startHourMinutes) * pixelsPerMinute;
      const height = (endMinutes - startMinutes) * pixelsPerMinute;

      return { top, height };
    },
    [startHour, timeToMinutes],
  );

  // Obtener sesiones para una fecha específica
  const getSessionsForDate = useCallback(
    (dateLabel: string) => {
      return occupiedSlots.filter((slot) => slot.date === dateLabel);
    },
    [occupiedSlots],
  );

  // Manejar selección de sesión
  const handleSessionSelect = useCallback(
    (date: string, session: any) => {
      if (disabled) return;

      // No permitir seleccionar sesiones donde el usuario ya tiene reserva
      if (session.isUserReserved) {
        return;
      }

      // No permitir seleccionar sesiones llenas
      if (session.isFullyBooked) {
        return;
      }

      onRangeSelect({ start: session.start, end: session.end }, date);
    },
    [disabled, onRangeSelect],
  );

  // Determinar el estilo de la sesión basado en su estado
  const getSessionStyle = useCallback((session: any, isSelected: boolean) => {
    if (session.isUserReserved === true) {
      return 'bg-red-100 border-red-300 text-red-800 cursor-not-allowed';
    }

    if (session.isFullyBooked === true) {
      return 'bg-gray-200 border-gray-300 text-gray-600 cursor-not-allowed';
    }

    if (isSelected) {
      return 'bg-black text-white border-black';
    }

    return 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200 cursor-pointer';
  }, []);

  // Obtener el texto de estado para el hover
  const getStatusText = useCallback((session: any) => {
    if (session.isUserReserved === true) {
      return 'Ya tienes una reserva en este horario';
    }

    if (session.isFullyBooked === true) {
      return 'Sesión llena';
    }

    return 'Disponible para reservar';
  }, []);

  const totalHours = endHour - startHour + 1;
  const gridHeight = totalHours * 60; // 60px por hora

  return (
    <div
      className="border rounded-lg bg-white shadow-sm h-full flex flex-col"
      style={{ minHeight: '400px' }}
    >
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 flex-shrink-0">
        <h3 className="text-lg font-medium text-gray-900">
          Horarios disponibles
        </h3>
        {selectedRange && selectedDate && (
          <div className="mt-2 text-sm font-medium text-green-600">
            Seleccionado: {selectedDate} a las {selectedRange.start}
          </div>
        )}
      </div>

      {/* Contenedor principal con scroll */}
      <div
        className="flex-1 overflow-auto relative"
        style={{ scrollBehavior: 'smooth', willChange: 'scroll-position' }}
      >
        <div className="flex min-w-full" style={{ minHeight: '100%' }}>
          {/* Columna de horas */}
          <div className="w-20 flex-shrink-0 border-r bg-gray-50 relative z-20">
            {/* Header vacío para alinear con los días - STICKY */}
            <div className="h-16 border-b flex items-center justify-center text-xs font-medium text-gray-600 bg-gray-50 sticky top-0 z-30">
              Hora
            </div>

            {/* Horas */}
            <div className="relative" style={{ height: gridHeight }}>
              {hours.map((hour, idx) => (
                <div
                  key={idx}
                  className="absolute w-full border-b border-gray-200 flex items-start justify-center pt-1"
                  style={{ top: idx * 60, height: 60 }}
                >
                  <span className="text-xs font-medium text-gray-700">
                    {hour}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Columnas de días */}
          <div className="flex-1 flex">
            {dates.map((date, dateIdx) => (
              <div
                key={dateIdx}
                className="flex-1 border-r border-gray-200 last:border-r-0 relative"
              >
                {/* Header del día - STICKY */}
                <div className="h-16 border-b bg-gray-50 flex flex-col items-center justify-center sticky top-0 z-20">
                  <div className="text-xs font-medium text-gray-600">
                    {date.weekday}
                  </div>
                  <div className="text-sm font-bold text-gray-900">
                    {date.day}/{date.month}
                  </div>
                </div>

                {/* Grid de horas con sesiones - CON OVERFLOW HIDDEN */}
                <div
                  className="relative overflow-hidden"
                  style={{ height: gridHeight }}
                >
                  {/* Líneas de fondo para cada hora */}
                  {hours.map((_, idx) => (
                    <div
                      key={idx}
                      className="absolute w-full border-b border-gray-100"
                      style={{ top: idx * 60, height: 60 }}
                    />
                  ))}

                  {/* Sesiones para este día */}
                  {getSessionsForDate(date.label).map((session, sessionIdx) => {
                    const { top, height } = getSessionPosition(
                      session.start,
                      session.end,
                    );
                    const isSelected = !!(
                      selectedRange &&
                      selectedDate === date.label &&
                      selectedRange.start === session.start
                    );

                    const sessionStyle = getSessionStyle(session, isSelected);
                    const statusText = getStatusText(session);

                    return (
                      <HoverCard key={sessionIdx}>
                        <HoverCardTrigger asChild>
                          <div
                            className={cn(
                              'absolute left-1 right-1 rounded border text-xs font-medium p-1 flex items-center justify-center overflow-hidden transition-colors',
                              sessionStyle,
                            )}
                            style={{
                              top,
                              height: Math.max(height, 20),
                              maxHeight: gridHeight - top, // Evita que escape del área
                            }}
                            onClick={() =>
                              handleSessionSelect(date.label, session)
                            }
                          >
                            <span className="truncate">
                              {session.sessionInfo?.title ||
                                session.title ||
                                'Sesión'}
                            </span>
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-64 p-3 text-sm">
                          {session.sessionInfo ? (
                            <div className="space-y-2">
                              <h4 className="font-medium">
                                {session.sessionInfo.title}
                              </h4>
                              <div className="space-y-1 text-xs">
                                <p>
                                  <span className="font-medium">Horario:</span>{' '}
                                  {session.start} - {session.end}
                                </p>
                                <p>
                                  <span className="font-medium">
                                    Profesional:
                                  </span>{' '}
                                  {session.sessionInfo.professional}
                                </p>
                                <p>
                                  <span className="font-medium">Lugar:</span>{' '}
                                  {session.sessionInfo.location}
                                </p>
                                <p>
                                  <span className="font-medium">
                                    Disponibilidad:
                                  </span>{' '}
                                  {session.sessionInfo.capacity -
                                    session.sessionInfo.registered}
                                  /{session.sessionInfo.capacity}
                                </p>
                                <p
                                  className={cn('font-medium', {
                                    'text-red-600':
                                      session.isUserReserved === true,
                                    'text-gray-600':
                                      session.isFullyBooked === true,
                                    'text-green-600':
                                      session.isUserReserved !== true &&
                                      session.isFullyBooked !== true,
                                  })}
                                >
                                  <span className="font-medium">Estado:</span>{' '}
                                  {statusText}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="font-medium">
                                {session.title || 'Sesión'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Horario: {session.start} - {session.end}
                              </p>
                              <p
                                className={cn('text-xs mt-1', {
                                  'text-red-600':
                                    session.isUserReserved === true,
                                  'text-gray-600':
                                    session.isFullyBooked === true,
                                  'text-green-600':
                                    session.isUserReserved !== true &&
                                    session.isFullyBooked !== true,
                                })}
                              >
                                {statusText}
                              </p>
                            </div>
                          )}
                        </HoverCardContent>
                      </HoverCard>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
