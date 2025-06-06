import { createFileRoute } from '@tanstack/react-router';
import { ServiceStep } from '@/components/ui/reservation/service-step';
import { ReservaServiciosRoute } from '@/layouts/reservation-layout';

export const Route = createFileRoute(ReservaServiciosRoute)({
  component: ServiceStep,
});
