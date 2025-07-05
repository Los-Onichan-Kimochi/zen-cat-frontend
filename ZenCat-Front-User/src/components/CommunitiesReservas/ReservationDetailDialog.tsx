import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Reservation, ReservationState } from '@/types/reservation';
import { format, differenceInHours } from 'date-fns';
import { es } from 'date-fns/locale';
import { localsApi } from '@/api/locals/locals';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ReservationDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  onCancelReservation: (reservation: Reservation) => void;
  communityName?: string;
}

const getStateColor = (state: ReservationState) => {
  switch (state) {
    case ReservationState.DONE:
      return 'bg-blue-100 text-blue-800';
    case ReservationState.CANCELLED:
      return 'bg-red-100 text-red-800';
    case ReservationState.CONFIRMED:
      return 'bg-green-100 text-green-800';
    case ReservationState.ANULLED:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStateLabel = (state: ReservationState) => {
  switch (state) {
    case ReservationState.DONE:
      return 'Finalizada';
    case ReservationState.CANCELLED:
      return 'Cancelada';
    case ReservationState.CONFIRMED:
      return 'Confirmada';
    case ReservationState.ANULLED:
      return 'Anulada';
    default:
      return String(state);
  }
};

export function ReservationDetailDialog({
  isOpen,
  onClose,
  reservation,
  onCancelReservation,
  communityName,
}: ReservationDetailDialogProps) {
  const [localData, setLocalData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    const fetchLocalData = async () => {
      if (reservation?.session?.local_id) {
        setLoading(true);
        try {
          const local = await localsApi.getLocal(reservation.session.local_id);
          setLocalData(local);
        } catch (error) {
          console.error('Error fetching local data:', error);
          setLocalData(null);
        } finally {
          setLoading(false);
        }
      }
    };

    if (isOpen && reservation) {
      fetchLocalData();
    }
  }, [isOpen, reservation]);

  if (!reservation) return null;

  // Combinar correctamente la fecha de la sesión con la hora de inicio
  const sessionDate = new Date(reservation.session.date);
  const sessionStartTime = new Date(reservation.session.start_time);
  
  // Crear la fecha y hora completa de inicio de la sesión
  const sessionDateTime = new Date(
    sessionDate.getFullYear(),
    sessionDate.getMonth(),
    sessionDate.getDate(),
    sessionStartTime.getHours(),
    sessionStartTime.getMinutes(),
    sessionStartTime.getSeconds()
  );
  
  const now = new Date();
  const hoursUntilReservation = differenceInHours(sessionDateTime, now);
  const canCancel = hoursUntilReservation >= 24;

  const handleCancelReservation = () => {
    if (canCancel) {
      setShowCancelDialog(true);
    }
  };

  const confirmCancelReservation = () => {
    onCancelReservation(reservation);
    setShowCancelDialog(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[90vw] max-w-4xl sm:w-full sm:max-w-2xl [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Información de reserva
            </DialogTitle>
            <p className="text-center text-gray-600 mt-2">
              Detalle de la reserva
            </p>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 w-full">
            {/* Primera columna */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Comunidad</span>
                <span className="font-medium text-right">{communityName || 'N/A'}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fecha</span>
                <span className="font-medium text-right">
                  {format(sessionDate, 'dd/MM/yyyy', { locale: es })}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Lugar</span>
                <span className="font-medium text-right">
                  {reservation.place || 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Dirección</span>
                <span className="font-medium text-right">
                  {loading ? 'Cargando...' : (localData?.street_name + ' ' + localData?.building_number || 'N/A')}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Profesional</span>
                <span className="font-medium text-right">
                  {reservation.professional || 'N/A'}
                </span>
              </div>
            </div>

            {/* Segunda columna */}
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Servicio</span>
                <span className="font-medium text-right">
                  {reservation.service_name || 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Horario</span>
                <span className="font-medium text-right">
                  {format(reservation.session.start_time, 'HH:mm', { locale: es })} h - {format(reservation.session.end_time, 'HH:mm', { locale: es })} h
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Distrito</span>
                <span className="font-medium text-right">
                  {loading ? 'Cargando...' : (localData?.district || 'N/A')}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Estado</span>
                <div className="text-right">
                  <Badge className={getStateColor(reservation.state)}>
                    {getStateLabel(reservation.state)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-center gap-4">
            <Button
              variant="default"
              onClick={onClose}
              className="bg-black text-white hover:bg-gray-800 px-8"
            >
              Volver
            </Button>
            {reservation.state === ReservationState.CONFIRMED && (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        variant="outline"
                        onClick={handleCancelReservation}
                        className="px-8"
                        disabled={!canCancel}
                      >
                        Cancelar reserva
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {!canCancel && (
                    <TooltipContent>
                      <p>Falta menos de 24 horas para la reserva. No se puede cancelar.</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro que deseas cancelar esta reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancelReservation}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 