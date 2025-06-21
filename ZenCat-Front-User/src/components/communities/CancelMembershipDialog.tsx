import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CancelMembershipDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  communityName?: string;
}

export function CancelMembershipDialog({
  isOpen,
  onClose,
  onCancel,
  communityName = '',
}: CancelMembershipDialogProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="sm:max-w-md p-0 border-0 overflow-hidden">
        <div className="bg-white p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-center">
              ¿Desea cancelar su membresía?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-black text-center mt-4 leading-relaxed">
              Si cancela su membresía perderá todos los beneficios asociados a
              ella, incluyendo las reservas disponibles y cualquier descuento
              especial. Esta acción no puede deshacerse.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex justify-center space-x-4 mt-6">
            <Button
              type="button"
              variant="outline"
              className="bg-white text-black border border-gray-300 hover:bg-gray-100 rounded-sm px-8 py-2 w-32"
              onClick={onCancel}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="bg-black text-white hover:bg-gray-800 rounded-sm px-8 py-2 w-32"
              onClick={onClose}
            >
              Volver
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
