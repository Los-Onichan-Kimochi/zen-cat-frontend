import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
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
  // We control the open state externally via the isOpen prop
  // The AlertDialog component itself doesn't need its own internal open state management here.
  // We only render the dialog content when isOpen is true.

  if (!isOpen) {
    return null; // Don't render anything if the modal shouldn't be open
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}> {/* Use onOpenChange for closing */} 
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* We use onOpenChange, so a simple close button is enough */}
          <AlertDialogAction onClick={onClose}>Cerrar</AlertDialogAction> 
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 