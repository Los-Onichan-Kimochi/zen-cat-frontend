import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ActivateMembershipDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onActivate: () => void;
  communityName?: string;
}

export function ActivateMembershipDialog({
  isOpen,
  onClose,
  onActivate,
  communityName = '',
}: ActivateMembershipDialogProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="sm:max-w-md p-0 border-0 overflow-hidden">
        <div className="bg-white p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-center">
              ¿Desea volver a activar su membresía?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-black text-center mt-4 leading-relaxed">
              Si vuelve a activar su membresía el tiempo que le falta para que
              esta culmine seguirá corriendo de manera regular hasta que acabe.
              Todas las reservas disponibles que tenía al momento de suspeder la
              membresía se mantienen igual.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex justify-center space-x-4 mt-6">
            <Button
              type="button"
              className="bg-black text-white hover:bg-gray-800 rounded-sm px-8 py-2 w-32"
              onClick={onActivate}
            >
              Activar
            </Button>
            <Button
              type="button"
              variant="outline"
              className="bg-white text-black border border-gray-300 hover:bg-gray-100 rounded-sm px-8 py-2 w-32"
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
