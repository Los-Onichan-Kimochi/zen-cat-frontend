import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, User, Phone, Mail, Calendar } from 'lucide-react';
import { Session } from '@/types/session';

interface ReservationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
  reservations: any[]; // You might want to define a proper Reservation type
}

export function ReservationsModal({ 
  isOpen, 
  onClose, 
  session, 
  reservations = [] 
}: ReservationsModalProps) {
  if (!session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-bold">
            Reservas - {session.title}
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
        
        <div className="flex-1 overflow-y-auto">
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">
                  {new Date(session.date).toLocaleDateString('es-ES')}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Capacidad: {session.registered_count || 0}/{session.capacity}
              </div>
            </div>
          </div>

          {reservations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No hay reservas para esta sesión</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reservations.map((reservation, index) => (
                <div
                  key={reservation.id || index}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {reservation.user_name || 'Usuario desconocido'}
                        </span>
                      </div>
                      
                      {reservation.user_email && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                          <Mail className="h-3 w-3" />
                          <span>{reservation.user_email}</span>
                        </div>
                      )}
                      
                      {reservation.user_phone && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          <span>{reservation.user_phone}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {reservation.created_at && (
                        <div>
                          Reservado: {new Date(reservation.created_at).toLocaleDateString('es-ES')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="pt-4 border-t">
          <Button onClick={onClose} className="w-full">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 