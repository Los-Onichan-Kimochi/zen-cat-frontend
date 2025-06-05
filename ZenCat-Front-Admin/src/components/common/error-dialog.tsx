// components/common/ErrorDialog.tsx
'use client';

import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

interface ErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message: string;
}

export default function ErrorDialog({
  open,
  onOpenChange,
  title = "Error",
  message,
}: ErrorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md text-center space-y-4">
        <div className="flex justify-center items-center">
          <XCircle className="h-20 w-20 text-red-600" strokeWidth={1} />
        </div>
        <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        <p>{message}</p>
        <DialogFooter>
          <Button
            className="mx-auto bg-gray-800 hover:bg-gray-700 px-6"
            onClick={() => onOpenChange(false)}
          >
            Salir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
