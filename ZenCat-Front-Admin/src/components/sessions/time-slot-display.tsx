import { Clock, AlertTriangle, User, MapPin } from 'lucide-react';
import { useDayAvailability } from '@/hooks/use-session-conflicts';

interface TimeSlotDisplayProps {
  date: string;
  professionalId?: string;
  localId?: string;
}

export function TimeSlotDisplay({
  date,
  professionalId,
  localId,
}: TimeSlotDisplayProps) {
  const { isAvailable, busySlots } = useDayAvailability(
    date,
    professionalId,
    localId,
  );

  if (!date) {
    return (
      <div className="text-sm text-gray-500 p-4 text-center">
        Selecciona una fecha para ver la disponibilidad
      </div>
    );
  }

  if (isAvailable) {
    return (
      <div className="text-sm text-green-600 p-4 text-center flex items-center justify-center">
        <Clock className="mr-2 h-4 w-4" />
        Día completamente disponible
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center text-sm font-medium text-gray-700">
        <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
        Horarios ocupados
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto">
        {busySlots.map((slot, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border-l-4 ${
              slot.type === 'professional'
                ? 'bg-red-50 border-red-400'
                : 'bg-blue-50 border-blue-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {slot.type === 'professional' ? (
                  <User className="h-4 w-4 text-red-600" />
                ) : (
                  <MapPin className="h-4 w-4 text-blue-600" />
                )}
                <span className="text-sm font-medium">
                  {slot.start} - {slot.end}
                </span>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  slot.type === 'professional'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {slot.type === 'professional' ? 'Profesional' : 'Local'}
              </span>
            </div>
            <div className="text-sm text-gray-600 mt-1 truncate">
              {slot.title}
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-500 mt-2">
        * Evita programar sesiones en estos horarios para prevenir conflictos
      </div>
    </div>
  );
}
