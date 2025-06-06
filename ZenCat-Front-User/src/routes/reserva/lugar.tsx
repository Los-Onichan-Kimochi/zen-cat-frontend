import { createFileRoute } from '@tanstack/react-router';
import { LocationStep } from '@/components/ui/Reservation/LocationStep';
import { ReservaLugarRoute } from '@/layouts/ReservationLayout';

export const Route = createFileRoute(ReservaLugarRoute)({
  component: LocationStep,
});
