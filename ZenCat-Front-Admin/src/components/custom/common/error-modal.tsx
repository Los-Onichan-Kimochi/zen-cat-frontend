import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

export function ErrorModal({ isOpen, onClose, title, description }: ErrorModalProps) {

  if (!isOpen) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}> 
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>Cerrar</AlertDialogAction> 
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 