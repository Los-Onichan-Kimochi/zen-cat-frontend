'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface SuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  buttonText?: string;
}

export function SuccessDialog({
  open,
  onOpenChange,
  title = 'Operación exitosa',
  description = 'La operación se realizó correctamente.',
  buttonText = 'Salir',
}: SuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md text-center space-y-4">
        <div className="flex justify-center items-center">
          <CheckCircle className="h-20 w-20 text-green-600" strokeWidth={1} />
        </div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
        <Button
          className="mx-auto bg-gray-800 hover:bg-gray-700 px-6"
          onClick={() => onOpenChange(false)}
        >
          {buttonText}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
