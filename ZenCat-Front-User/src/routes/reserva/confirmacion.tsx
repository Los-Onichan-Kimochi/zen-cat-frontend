import { createFileRoute } from '@tanstack/react-router';
import { ConfirmStep } from '@/components/ui/Reservation/ConfirmStep';
import { ReservaConfirmacionRoute } from '@/layouts/ReservationLayout';

export const Route = createFileRoute(ReservaConfirmacionRoute)({
  component: ConfirmStep,
});
