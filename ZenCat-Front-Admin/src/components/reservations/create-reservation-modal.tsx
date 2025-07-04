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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationsApi } from '@/api/reservations/reservations';
import { membershipsApi } from '@/api/memberships/memberships';

interface CreateReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sessionId: string;
  users: User[];
  sessionName: string;
  communityId: string;
}

export function CreateReservationModal({
  isOpen,
  onClose,
  onSuccess,
  sessionId,
  users = [],
  sessionName,
  communityId,
}: CreateReservationModalProps) {
  const [name, setName] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    onError: (err: any) => {
      toast.error('Error al crear la reserva', {
        description: err.message || 'No se pudo crear la reserva',
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validaciones
    if (!name.trim()) {
      error('Validación', {
        description: 'El nombre es requerido',
      });
      setIsLoading(false);
      return;
    }

    if (!selectedUserId) {
      error('Validación', {
        description: 'Debe seleccionar un usuario',
      });
      setIsLoading(false);
      return;
    }

    try {
      // Obtener el ID de la membresía para el usuario y comunidad
      let membershipId = null;

      if (communityId && selectedUserId) {
        try {
          const membership = await membershipsApi.getMembershipByUserAndCommunity(
            selectedUserId,
            communityId
          );
          membershipId = membership.id;
        } catch (err: any) {
          console.warn('No se pudo obtener la membresía:', err.message);
          // Continuamos sin membresía si no se puede encontrar
        }
      }

      const reservationData = {
        session_id: sessionId,
        user_id: selectedUserId,
        membership_id: membershipId, // Incluimos el ID de la membresía
        name: name.trim(),
        notes: notes.trim(),
        state: 'CONFIRMED',
        reservation_time: new Date().toISOString(), // Usamos la fecha actual como tiempo de reserva
      };

      console.log('Enviando datos de reserva:', reservationData);
      await createReservationMutation.mutateAsync(reservationData);
    } catch (err) {
      console.error('Error en la creación de la reserva:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setSelectedUserId('');
    setNotes('');
    onClose();
  };

  return (
    <>
      <ModalNotifications modal={modal} onClose={closeModal} />
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear Reserva</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="user" className="text-right">
                  Usuario
                </Label>
                <Select
                  value={selectedUserId}
                  onValueChange={setSelectedUserId}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notas
                </Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Sesión</Label>
                <div className="col-span-3 text-sm text-gray-600">
                  {sessionName}
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
                {isLoading ? 'Creando...' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
