import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { ModalNotifications } from '@/components/custom/common/modal-notifications';
import { useModalNotifications } from '@/hooks/use-modal-notifications';
import { useToast } from '@/context/ToastContext';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

import { reservationsApi } from '@/api/reservations/reservations';
import { membershipsApi } from '@/api/memberships/memberships';
import {
  Reservation,
  UpdateReservationRequest,
  ReservationState,
} from '@/types/reservation';

interface EditReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  reservation: Reservation | null;
}

export function EditReservationModal({
  isOpen,
  onClose,
  onSuccess,
  reservation,
}: EditReservationModalProps) {
  // State for form data (solo nombre y estado)
  const [name, setName] = useState('');
  const [reservationState, setReservationState] = useState<ReservationState>(ReservationState.CONFIRMED);
  const [isLoading, setIsLoading] = useState(false);
  const [membershipReservationsUsed, setMembershipReservationsUsed] = useState<number | null>(null);
  
  // Hooks
  const { modal, closeModal } = useModalNotifications();
  const toast = useToast();
  const queryClient = useQueryClient();

  // Obtener la información de membresía si tenemos un ID de usuario y comunidad
  useEffect(() => {
    if (reservation && reservation.user_id && reservation.session_id) {
      // Primero, obtener el ID de la comunidad desde la sesión
      const fetchMembershipData = async () => {
        try {
          setIsLoading(true);
          // Este es un enfoque simplificado, deberías adaptar esta lógica a tu estructura de API
          const sessionResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/session/${reservation.session_id}`);
          if (!sessionResponse.ok) throw new Error("Error obteniendo sesión");
          const sessionData = await sessionResponse.json();
          
          if (sessionData.community_service_id) {
            // Ahora conseguimos el servicio de comunidad para obtener el ID de comunidad
            const serviceResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/community-service/${sessionData.community_service_id}`);
            if (!serviceResponse.ok) throw new Error("Error obteniendo servicio de comunidad");
            const serviceData = await serviceResponse.json();
            
            if (serviceData.community_id) {
              // Finalmente obtenemos la membresía
              try {
                const membership = await membershipsApi.getMembershipByUserAndCommunity(
                  reservation.user_id,
                  serviceData.community_id
                );
                console.log('Membership data for edit:', membership);
                
                // Determinar si es un plan ilimitado o con límite
                if (membership.plan?.reservation_limit === null || 
                    membership.plan?.reservation_limit === 0) {
                  setMembershipReservationsUsed(null); // Plan ilimitado
                } else {
                  setMembershipReservationsUsed(membership.reservations_used);
                }
              } catch (membershipErr) {
                console.warn('No se pudo obtener datos de membresía:', membershipErr);
                setMembershipReservationsUsed(null);
              }
            }
          }
        } catch (err) {
          console.error('Error obteniendo datos para membership_reservations_used:', err);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchMembershipData();
    }
  }, [reservation]);

  // Initialize form with reservation data when it changes (solo nombre y estado)
  useEffect(() => {
    if (reservation) {
      console.log('Reservation data received:', reservation);
      setName(reservation.name || '');
      setReservationState(reservation.state || ReservationState.CONFIRMED);
    } else {
      // Reset form if no reservation is provided
      setName('');
      setReservationState(ReservationState.CONFIRMED);
    }
  }, [reservation]);

  // Ya no necesitamos cargar usuarios porque no vamos a cambiar el usuario

  // Update mutation
  const updateReservationMutation = useMutation({
    mutationFn: async (data: UpdateReservationRequest) => {
      if (!reservation?.id) {
        throw new Error('No reservation ID provided');
      }
      console.log('Updating reservation with ID:', reservation.id);
      return reservationsApi.updateReservation(reservation.id, data);
    },
    onSuccess: (_, variables) => {
      console.log('Reservation updated successfully with data:', variables);
      toast.success('Reserva Actualizada', {
        description: 'La reserva ha sido actualizada exitosamente.',
      });
      
      // Invalidar consultas para actualizar la UI
      if (reservation?.session_id) {
        queryClient.invalidateQueries({ queryKey: ['reservations', 'session', reservation.session_id] });
      }
      
      // Resetear estado y cerrar modal
      setIsLoading(false);
      handleClose();
      onSuccess();
    },
    onError: (err: any) => {
      console.error('Error updating reservation:', err);
      toast.error('Error al actualizar la reserva', {
        description: err.message || 'No se pudo actualizar la reserva',
      });
      setIsLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validaciones
    if (!name.trim()) {
      toast.error('Validación', {
        description: 'El nombre es requerido',
      });
      setIsLoading(false);
      return;
    }

    try {
      // Solo enviamos nombre y estado
      const updateData: UpdateReservationRequest = {
        name: name.trim(),
        state: reservationState,
      };

      console.log('Enviando datos de actualización:', updateData);
      await updateReservationMutation.mutateAsync(updateData);
    } catch (err) {
      console.error('Error en la actualización de la reserva:', err);
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      // Reset form state (solo nombre y estado)
      setName('');
      setReservationState(ReservationState.CONFIRMED);
      // Call parent onClose
      onClose();
    }
    // Eliminamos el toast para no mostrar ningún mensaje cuando se intenta cerrar durante la carga
  };

  // Ensure we have a reservation object to work with
  if (!isOpen || !reservation) return null;

  return (
    <>
      <ModalNotifications modal={modal} onClose={closeModal} />
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Reserva</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Título
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="state" className="text-right">
                  Estado
                </Label>
                <Select
                  value={reservationState}
                  onValueChange={(value) => setReservationState(value as ReservationState)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ReservationState.CONFIRMED}>
                      Confirmada
                    </SelectItem>
                    <SelectItem value={ReservationState.DONE}>
                      Completada
                    </SelectItem>
                    <SelectItem value={ReservationState.CANCELLED}>
                      Cancelada
                    </SelectItem>
                    <SelectItem value={ReservationState.ANULLED}>
                      Anulada
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Sesión</Label>
                <div className="col-span-3 text-sm text-gray-600">
                  {reservation.session_title || 'Sesión'}
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Usuario</Label>
                <div className="col-span-3 text-sm text-gray-600">
                  {reservation.user_name || 'Usuario'}
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Reservas usadas</Label>
                <div className="col-span-3 text-sm text-gray-600">
                  {isLoading ? "Cargando..." : (
                    membershipReservationsUsed === null ? 
                    "Ilimitado" : 
                    membershipReservationsUsed.toString()
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Fecha y Hora</Label>
                <div className="col-span-3 text-sm text-gray-600">
                  {reservation.reservation_time ? new Date(reservation.reservation_time).toLocaleString('es-ES') : 'No disponible'}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : 'Actualizar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
