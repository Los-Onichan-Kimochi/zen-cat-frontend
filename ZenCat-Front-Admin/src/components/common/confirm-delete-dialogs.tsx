
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface ConfirmDeleteDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: React.ReactNode;
    confirmText?: string;
    onConfirm: () => void;
}

function ConfirmDeleteDialogBase({
    isOpen,
    onOpenChange,
    title,
    description,
    confirmText = 'Confirmar',
    onConfirm,
}: ConfirmDeleteDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="space-x-2">
                    <AlertDialogCancel onClick={() => onOpenChange(false)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button variant="destructive" className="bg-red-500 hover:bg-red-600" onClick={() => { onConfirm(); onOpenChange(false); }}>
                        {confirmText}
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export function ConfirmDeleteSingleDialog(props: Omit<ConfirmDeleteDialogProps, 'title' | 'description'> & { itemName: string , entity: string , title: string }) {
  return (
    <ConfirmDeleteDialogBase
      {...props}
      title={props.title}
      description={<>Esta acción no se puede deshacer.<br /><strong>{props.entity}: {props.itemName}</strong></>}
      confirmText="Eliminar"
    />
  );
}

export function ConfirmDeleteBulkDialog(props: Omit<ConfirmDeleteDialogProps, 'title' | 'description'> & { count: number }) {
  return (
    <ConfirmDeleteDialogBase
      {...props}
      title="¿Eliminar elementos seleccionados?"
      description={<>Esta acción no se puede deshacer.<br />Elementos seleccionados: <strong>{props.count}</strong></>}
      confirmText="Eliminar"
    />
  );
}