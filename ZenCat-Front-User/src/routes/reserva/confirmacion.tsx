import { createFileRoute } from '@tanstack/react-router';
import { ConfirmStep } from '@/components/ui/reservation/confirm-step';
import { ReservaConfirmacionRoute } from '@/layouts/reservation-layout';

export const Route = createFileRoute(ReservaConfirmacionRoute)({
  component: ConfirmStep,
});
