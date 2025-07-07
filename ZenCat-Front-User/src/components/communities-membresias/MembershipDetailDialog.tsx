import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Membership, MembershipState } from '@/types/membership';
import { mapMembershipStateToSpanish } from '@/utils/membership-utils';

interface MembershipDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  membership: Membership | null;
  onSuspendMembership: (membershipId: string) => void;
  onCancelMembership: (membershipId: string) => void;
}

export function MembershipDetailDialog({
  isOpen,
  onClose,
  membership,
  onSuspendMembership,
  onCancelMembership,
}: MembershipDetailDialogProps) {
  if (!membership) return null;

  const planName = membership.plan.type === 'MONTHLY' ? 'Básico' : 'Anual';
  const duration = membership.plan.type === 'MONTHLY' ? '1 mes' : '1 año';
  const statusText = mapMembershipStateToSpanish(membership.status);

  // Manejar el límite de reservas
  const reservationLimit = membership.plan.reservation_limit;
  const reservationLimitText =
    reservationLimit === null || reservationLimit === 0
      ? 'Sin límite'
      : `${reservationLimit} reservas`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-4xl sm:w-full sm:max-w-2xl [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Información de membresía
          </DialogTitle>
          <p className="text-center text-gray-600 mt-2">
            Detalle de la membresía
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 w-full">
          {/* Primera columna */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Comunidad</span>
              <span className="font-medium text-right">
                {membership.community.name}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Fecha de inicio</span>
              <span className="font-medium text-right">
                {new Date(membership.start_date).toLocaleDateString('es-ES')}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Duración</span>
              <span className="font-medium text-right">{duration}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Monto</span>
              <span className="font-medium text-right">
                S/. {membership.plan.fee.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Segunda columna */}
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Plan</span>
              <span className="font-medium text-right">{planName}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Fecha de fin</span>
              <span className="font-medium text-right">
                {new Date(membership.end_date).toLocaleDateString('es-ES')}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Cantidad de reservas</span>
              <span className="font-medium text-right">
                {reservationLimitText}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Estado</span>
              <span className="font-medium text-right">{statusText}</span>
            </div>
          </div>
        </div>

        {/* Botón */}
        <div className="flex justify-center gap-4 mt-6">
          <Button
            variant="default"
            onClick={onClose}
            className="bg-black text-white hover:bg-gray-800 px-8"
          >
            Volver
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
