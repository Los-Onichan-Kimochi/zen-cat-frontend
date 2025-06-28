import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Reservation, ReservationState } from '@/types/reservation';

interface ViewReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
}

const getStateColor = (state: ReservationState) => {
  switch (state) {
    case ReservationState.CONFIRMED:
      return 'bg-green-100 text-green-800';
    case ReservationState.DONE:
      return 'bg-blue-100 text-blue-800';
    case ReservationState.CANCELLED:
      return 'bg-red-100 text-red-800';
    case ReservationState.ANULLED:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStateLabel = (state: ReservationState) => {
  switch (state) {
    case ReservationState.CONFIRMED:
      return 'Confirmada';
    case ReservationState.DONE:
      return 'Completada';
    case ReservationState.CANCELLED:
      return 'Cancelada';
    case ReservationState.ANULLED:
      return 'Anulada';
    default:
      return state;
  }
};

export function ViewReservationModal({
  isOpen,
  onClose,
  reservation,
}: ViewReservationModalProps) {
  if (!reservation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <DialogTitle className="text-xl font-bold">
            Detalles de la Reserva
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Nombre de la Reserva */}
          <div className="space-y-1.5">
            <div className="text-sm font-medium">Nombre de la Reserva</div>
            <div className="bg-gray-50 border border-gray-200 rounded p-2.5 text-sm">
              {reservation.name}
            </div>
          </div>

          {/* Usuario */}
          <div className="space-y-1.5">
            <div className="text-sm font-medium">Usuario</div>
            <div className="bg-gray-50 border border-gray-200 rounded p-2.5 text-sm">
              {reservation.user_name || 'No especificado'}
            </div>
          </div>

          {/* Fecha y Hora */}
          <div className="space-y-1.5">
            <div className="text-sm font-medium">Fecha y Hora de Reserva</div>
            <div className="bg-gray-50 border border-gray-200 rounded p-2.5 text-sm">
              {format(
                new Date(reservation.reservation_time),
                'dd/MM/yyyy HH:mm',
                { locale: es },
              )}
            </div>
          </div>

          {/* Estado */}
          <div className="space-y-1.5">
            <div className="text-sm font-medium">Estado</div>
            <Badge
              className={`${getStateColor(reservation.state)} px-3 py-1.5`}
            >
              {getStateLabel(reservation.state)}
            </Badge>
          </div>

          {/* Buttons - Solo un botón para cerrar */}
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
