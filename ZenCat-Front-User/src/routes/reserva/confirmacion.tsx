import { createFileRoute } from '@tanstack/react-router';
import { ConfirmStep } from '@/components/ui/Reservation/ConfirmStep';

export const Route = createFileRoute('/reserva/confirmacion')({
  component: ConfirmStep,
});
