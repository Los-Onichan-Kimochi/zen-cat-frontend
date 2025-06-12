import { SessionState } from '@/types/session';

export interface SessionWithTime {
  start_time: string;
  end_time: string;
  state: SessionState;
}

/**
 * Determina el estado actual de una sesión basándose en las fechas y horas
 */
export function getSessionCurrentState(session: SessionWithTime): SessionState {
  // Usar la hora local del navegador del usuario
  const now = new Date();
  const startTime = new Date(session.start_time);
  const endTime = new Date(session.end_time);

  // Si la sesión ya fue cancelada o reprogramada, mantener ese estado
  if (
    session.state === SessionState.CANCELLED ||
    session.state === SessionState.RESCHEDULED
  ) {
    return session.state;
  }

  // Agregar un margen de 5 minutos para evitar cambios abruptos
  const bufferTime = 5 * 60 * 1000; // 5 minutos en milliseconds

  // Si la sesión ya terminó (con margen)
  if (now.getTime() > endTime.getTime() + bufferTime) {
    return SessionState.COMPLETED;
  }

  // Si la sesión está en curso (con margen)
  if (
    now.getTime() >= startTime.getTime() - bufferTime &&
    now.getTime() <= endTime.getTime() + bufferTime
  ) {
    return SessionState.ONGOING;
  }

  // Si la sesión está programada para el futuro
  if (now.getTime() < startTime.getTime() - bufferTime) {
    return SessionState.SCHEDULED;
  }

  // Por defecto, mantener el estado original

  return session.state;
}

/**
 * Obtiene una etiqueta de estado en español para mostrar en la UI
 */
export function getSessionStateLabel(state: SessionState): string {
  switch (state) {
    case SessionState.SCHEDULED:
      return 'Programada';
    case SessionState.ONGOING:
      return 'En curso';
    case SessionState.COMPLETED:
      return 'Completada';
    case SessionState.CANCELLED:
      return 'Cancelada';
    case SessionState.RESCHEDULED:
      return 'Reprogramada';
    default:
      return 'Desconocido';
  }
}

/**
 * Obtiene el color del badge basándose en el estado
 */
export function getSessionStateColor(state: SessionState): string {
  switch (state) {
    case SessionState.SCHEDULED:
      return 'bg-blue-100 text-blue-800';
    case SessionState.ONGOING:
      return 'bg-green-100 text-green-800';
    case SessionState.COMPLETED:
      return 'bg-gray-100 text-gray-800';
    case SessionState.CANCELLED:
      return 'bg-red-100 text-red-800';
    case SessionState.RESCHEDULED:
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
