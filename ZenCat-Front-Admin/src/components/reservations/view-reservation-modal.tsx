import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, User, Calendar, Clock, Mail, Phone } from 'lucide-react';
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
      <DialogContent className="max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-bold">
            Detalles de la Reserva
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500">ID</div>
              <div className="text-sm font-mono">{reservation.id}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500">Estado</div>
              <Badge className={getStateColor(reservation.state)}>
                {getStateLabel(reservation.state)}
              </Badge>
            </div>
          </div>

          {/* Reservation Info */}
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Información de la Reserva</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-500">Nombre</div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>{reservation.name}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-500">Fecha de Reserva</div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>
                      {format(new Date(reservation.reservation_time), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* User Info */}
            {(reservation.user_name || reservation.user_email || reservation.user_phone) && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">Información del Usuario</h3>
                <div className="space-y-3">
                  {reservation.user_name && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{reservation.user_name}</span>
                    </div>
                  )}
                  {reservation.user_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{reservation.user_email}</span>
                    </div>
                  )}
                  {reservation.user_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{reservation.user_phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Información de Sistema</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-500">ID de Usuario</div>
                  <div className="text-sm font-mono">{reservation.user_id}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-500">ID de Sesión</div>
                  <div className="text-sm font-mono">{reservation.session_id}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-500">Última Modificación</div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {format(new Date(reservation.last_modification), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 