import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ModalNotifications } from '@/components/custom/common/modal-notifications';
import { useModalNotifications } from '@/hooks/use-modal-notifications';
import { useToast } from '@/context/ToastContext';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { X, Loader2 } from 'lucide-react';

import { reservationsApi } from '@/api/reservations/reservations';
import { usuariosApi } from '@/api/usuarios/usuarios';
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
  const [formData, setFormData] = useState<UpdateReservationRequest>({
    name: '',
    reservation_time: '',
    state: ReservationState.CONFIRMED,
    user_id: '',
  });
  const { modal, error, closeModal } = useModalNotifications();
  const toast = useToast();

  // Initialize form when reservation changes
  useEffect(() => {
    if (reservation) {
      setFormData({
        name: reservation.name,
        reservation_time: new Date(reservation.reservation_time)
          .toISOString()
          .slice(0, 16), // Convert to YYYY-MM-DDTHH:mm format
        state: reservation.state,
        user_id: reservation.user_id,
      });
    }
  }, [reservation]);

  // Fetch users for the select
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => usuariosApi.fetchUsuarios(),
    enabled: isOpen, // Only fetch when modal is open
  });

  const { mutate: updateReservation, isPending: isUpdating } = useMutation({
    mutationFn: (data: UpdateReservationRequest) =>
      reservationsApi.updateReservation(reservation!.id, data),
    onSuccess: () => {
      toast.success('Reserva Actualizada', {
        description: 'La reserva ha sido actualizada exitosamente.',
      });
      onSuccess();
    },
    onError: (err: any) => {
      error('Error al actualizar la reserva', {
        description: err.message || 'No se pudo actualizar la reserva',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      error('Error de validación', {
        description: 'El nombre es requerido',
      });
      return;
    }

    if (!formData.user_id) {
      error('Error de validación', {
        description: 'Debe seleccionar un usuario',
      });
      return;
    }

    updateReservation(formData);
  };

  if (!reservation) return null;

  const users = usersData?.users || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-bold">
            Editar Reserva
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ID (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="id">ID</Label>
            <Input
              id="id"
              value={reservation.id}
              disabled
              className="bg-gray-100"
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Reserva</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ingrese el nombre de la reserva"
              required
            />
          </div>

          {/* User Selection */}
          <div className="space-y-2">
            <Label htmlFor="user">Usuario</Label>
            {isLoadingUsers ? (
              <div className="flex items-center gap-2 p-2 border rounded">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Cargando usuarios...</span>
              </div>
            ) : (
              <Select
                value={formData.user_id || ''}
                onValueChange={(value) =>
                  setFormData({ ...formData, user_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar usuario" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex flex-col">
                        <span>
                          {user.name} {user.first_last_name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {user.email}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Reservation Time */}
          <div className="space-y-2">
            <Label htmlFor="reservation_time">Fecha y Hora de Reserva</Label>
            <Input
              id="reservation_time"
              type="datetime-local"
              value={formData.reservation_time || ''}
              onChange={(e) =>
                setFormData({ ...formData, reservation_time: e.target.value })
              }
              required
            />
          </div>

          {/* State */}
          <div className="space-y-2">
            <Label htmlFor="state">Estado</Label>
            <Select
              value={formData.state || ReservationState.CONFIRMED}
              onValueChange={(value) =>
                setFormData({ ...formData, state: value as ReservationState })
              }
            >
              <SelectTrigger>
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

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Actualizar Reserva'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
      
      <ModalNotifications modal={modal} onClose={closeModal} />
    </Dialog>
  );
}
