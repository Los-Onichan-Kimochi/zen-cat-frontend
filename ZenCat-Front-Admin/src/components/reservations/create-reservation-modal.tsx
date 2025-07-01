import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

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
import { CreateReservationRequest, ReservationState } from '@/types/reservation';

interface CreateReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sessionId: string;
}

export function CreateReservationModal({
  isOpen,
  onClose,
  onSuccess,
  sessionId,
}: CreateReservationModalProps) {
  const [formData, setFormData] = useState<CreateReservationRequest>({
    name: '',
    reservation_time: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm format
    state: ReservationState.CONFIRMED,
    user_id: '',
    session_id: sessionId,
  });

  // Fetch users for the select
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => usuariosApi.getUsuarios(),
    enabled: isOpen, // Only fetch when modal is open
  });

  const { mutate: createReservation, isPending: isCreating } = useMutation({
    mutationFn: (reservation: CreateReservationRequest) =>
      reservationsApi.createReservation(reservation),
    onSuccess: () => {
      toast.success('Reserva creada exitosamente');
      onSuccess();
      resetForm();
    },
    onError: (error) => {
      toast.error('Error al crear la reserva', {
        description: error.message,
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      reservation_time: new Date().toISOString().slice(0, 16),
      state: ReservationState.CONFIRMED,
      user_id: '',
      session_id: sessionId,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    
    if (!formData.user_id) {
      toast.error('Debe seleccionar un usuario');
      return;
    }

    createReservation(formData);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const users = usersData || [];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Nueva Reserva</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Reserva</Label>
            <Input
              id="name"
              value={formData.name}
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
                value={formData.user_id}
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
                        <span>{user.name} {user.first_last_name}</span>
                        <span className="text-xs text-gray-500">{user.email}</span>
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
              value={formData.reservation_time}
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
              value={formData.state}
              onValueChange={(value) =>
                setFormData({ ...formData, state: value as ReservationState })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ReservationState.CONFIRMED}>Confirmada</SelectItem>
                <SelectItem value={ReservationState.DONE}>Completada</SelectItem>
                <SelectItem value={ReservationState.CANCELLED}>Cancelada</SelectItem>
                <SelectItem value={ReservationState.ANULLED}>Anulada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Reserva'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 