import React, { useState } from 'react';
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
import { User } from '@/types/user';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { reservationsApi } from '@/api/reservations/reservations';
import { usuariosApi } from '@/api/usuarios/usuarios';

interface CreateReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sessionId: string;
  users: User[];
  sessionName: string;
}

export function CreateReservationModal({
  isOpen,
  onClose,
  onSuccess,
  sessionId,
  users = [],
  sessionName,
}: CreateReservationModalProps) {
  const [name, setName] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [guestCount, setGuestCount] = useState(1);
  const [notes, setNotes] = useState('');
  const { modal, error, closeModal } = useModalNotifications();
  const toast = useToast();

  const queryClient = useQueryClient();

  const createReservationMutation = useMutation({
    mutationFn: async (data: any) => reservationsApi.createReservation(data),
    onSuccess: () => {
      toast.success('Reserva Creada', {
        description: 'La reserva ha sido registrada correctamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['reservations', sessionId] });
      handleClose();
      onSuccess();
    },
    onError: (error: any) => {
      error('Error al crear la reserva', {
        description: error.message || 'No se pudo crear la reserva',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!name.trim()) {
      error('Validación', {
        description: 'El nombre es requerido',
      });
      return;
    }

    if (!selectedUserId) {
      error('Validación', {
        description: 'Debe seleccionar un usuario',
      });
      return;
    }

    const reservationData = {
      session_id: sessionId,
      user_id: selectedUserId,
      name: name.trim(),
      guest_count: guestCount,
      notes: notes.trim(),
      state: 'CONFIRMED',
      reservation_time: new Date().toISOString(), // Usamos la fecha actual como tiempo de reserva
    };

    console.log('Enviando datos de reserva:', reservationData);
    createReservationMutation.mutate(reservationData);
  };

  const handleClose = () => {
    setName('');
    setSelectedUserId('');
    setGuestCount(1);
    setNotes('');
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear Nueva Reserva</DialogTitle>
            <p className="text-sm text-gray-600">
              Sesión: <span className="font-medium">{sessionName}</span>
            </p>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la reserva</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ingrese el nombre de la reserva"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user">Usuario</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un usuario" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(users) && users.length > 0 ? (
                    users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      No hay usuarios disponibles
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guests">Número de invitados</Label>
              <Input
                id="guests"
                type="number"
                min="1"
                max="10"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas adicionales"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createReservationMutation.isPending}
              >
                {createReservationMutation.isPending ? 'Creando...' : 'Crear Reserva'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ModalNotifications modal={modal} onClose={closeModal} />
    </>
  );
}
