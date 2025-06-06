import { createFileRoute } from '@tanstack/react-router';
import { ServiceStep } from '@/components/ui/Reservation/ServiceStep';
import { ReservaServiciosRoute } from '@/layouts/ReservationLayout';

export const Route = createFileRoute(ReservaServiciosRoute)({
  component: ServiceStep,
});
