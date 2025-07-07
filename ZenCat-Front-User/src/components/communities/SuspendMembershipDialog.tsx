import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SuspendMembershipDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuspend: () => void;
  communityName?: string;
}

export function SuspendMembershipDialog({
  isOpen,
  onClose,
  onSuspend,
  communityName = '',
}: SuspendMembershipDialogProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="sm:max-w-md p-0 border-0 overflow-hidden">
        <div className="bg-white p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-center">
              ¿Desea suspender su membresía?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-black text-center mt-4 leading-relaxed">
              Si suspende su membresía el tiempo que le falta para que esta
              culmine se congelará junto a sus reservas disponibles hasta que
              decida volver a activar su membresía otra vez
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex justify-center space-x-4 mt-6">
            <Button
              type="button"
              variant="outline"
              className="bg-white text-black border border-gray-300 hover:bg-gray-100 rounded-sm px-8 py-2 w-32"
              onClick={onSuspend}
            >
              Suspender
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
